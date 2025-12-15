/**
 * DisplayProdutosView.js
 * View - Modal que exibe lista de produtos retornados do SelecaoLentes servlet
 * 
 * ATUALIZAÇÃO: Suporta exibição de tratamentos adicionais
 * - Lentes de FÁBRICA: exibição normal
 * - Lentes BASE + TRATAMENTO: exibe linha adicional com tratamento
 * 
 * Estrutura esperada: Array de { marca, codigoWeb, od, oe, hasOD, hasOE, lentes }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';
import { formatCurrency } from '../util/helpers.js';

export default class DisplayProdutosView extends EventEmitter {
    
    constructor(containerId = 'produtosContainer') {
        super();
        this.containerId = containerId;
        this.modal = null;
        this.produtos = [];
        this.produtosOriginais = [];
        this.filtros = {
            marca: null,
            busca: '',
            ordenacao: 'preco'
        };
        
        this.createModal();
    }

    // ========================================
    // CRIAÇÃO DO MODAL
    // ========================================

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'produtosModal';
        this.modal.className = 'produtos-modal';
        
        this.modal.innerHTML = `
            <div class="produtos-modal__overlay"></div>
            <div class="produtos-modal__content">
                <div class="produtos-modal__header">
                    <h2>📦 Lentes Disponíveis</h2>
                    <div class="produtos-modal__header-info">
                        <span id="produtosCount">0</span> produtos
                    </div>
                    <button type="button" class="produtos-modal__close" id="btnFecharProdutos">✕</button>
                </div>
                
                <div class="produtos-modal__filtros" id="produtosFiltros">
                    <!-- Filtros serão inseridos aqui -->
                </div>
                
                <div class="produtos-modal__body" id="produtosLista">
                    <!-- Lista de produtos será inserida aqui -->
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.bindModalEvents();
        this.injectStyles();
    }

    bindModalEvents() {
        // Fechar modal
        const btnFechar = document.getElementById('btnFecharProdutos');
        btnFechar.addEventListener('click', () => this.fechar());
        
        // Fechar ao clicar no overlay
        const overlay = this.modal.querySelector('.produtos-modal__overlay');
        overlay.addEventListener('click', () => this.fechar());
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.fechar();
            }
        });
    }

    // ========================================
    // ABRIR/FECHAR MODAL
    // ========================================

    abrir() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.emit('abrir');
    }

    fechar() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.emit('fechar');
    }

    isAberto() {
        return this.modal.classList.contains('active');
    }

    // ========================================
    // RENDERIZAÇÃO PRINCIPAL
    // ========================================

    /**
     * Renderiza produtos no modal
     * @param {Array} produtos - Array de produtos processados pelo AppController
     */
    render(produtos) {
        if (!produtos || produtos.length === 0) {
            this.showEmpty();
            return;
        }

        this.produtosOriginais = produtos;
        this.produtos = [...produtos];
        
        // Extrai marcas únicas para o filtro
        const marcas = [...new Set(produtos.map(p => p.marca))].sort();
        
        // Renderiza filtros
        const filtrosContainer = document.getElementById('produtosFiltros');
        filtrosContainer.innerHTML = this.renderFiltros(marcas);
        
        // Renderiza lista
        this.renderLista();
        
        // Bind eventos dos filtros
        this.bindFiltrosEvents();
        
        // Abre o modal
        this.abrir();
    }

    /**
     * Renderiza barra de filtros
     */
    renderFiltros(marcas) {
        return `
            <div class="filtros-grupo">
                <label>Marca:</label>
                <select id="filtroMarca" class="filtros-select">
                    <option value="">Todas (${marcas.length})</option>
                    ${marcas.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
            <div class="filtros-grupo">
                <label>Ordenar:</label>
                <select id="filtroOrdem" class="filtros-select">
                    <option value="preco">Menor Preço</option>
                    <option value="preco-desc">Maior Preço</option>
                    <option value="marca">Marca A-Z</option>
                </select>
            </div>
            <div class="filtros-grupo filtros-grupo--busca">
                <input type="text" id="filtroBusca" class="filtros-input" placeholder="🔍 Buscar...">
            </div>
        `;
    }

    /**
     * Renderiza lista de produtos
     */
    renderLista() {
        const container = document.getElementById('produtosLista');
        
        if (this.produtos.length === 0) {
            container.innerHTML = `
                <div class="produtos-empty">
                    <div class="produtos-empty__icon">🔍</div>
                    <p>Nenhum produto encontrado com os filtros selecionados</p>
                </div>
            `;
            this.atualizarContador(0);
            return;
        }

        container.innerHTML = `
            <div class="produtos-grid">
                ${this.produtos.map(produto => this.renderProdutoCard(produto)).join('')}
            </div>
        `;

        this.atualizarContador(this.produtos.length);
        this.bindProdutosEvents();
        this.animateIn();
    }

    /**
     * Renderiza card de um produto
     * ATUALIZADO: Suporta tratamento adicional e coloração
     */
    renderProdutoCard(produto) {
        const { marca, codigoWeb, od, oe, hasOD, hasOE } = produto;
        
        // Info da primeira lente disponível
        const info = od || oe;
        if (!info) return '';
        
        const temPar = hasOD && hasOE;
        const temTratamentoAdicional = info.origemTratamento === 'ADICIONAL' && info.tratamentoAdicionalNome;
        const temColoracao = info.coloracao && info.coloracao !== 'Sem Coloração';
        
        // Diâmetro para o badge
        const diametro = info.diametro || '';
        
        return `
            <div class="produto-card ${temPar ? 'produto-card--par' : ''} ${temTratamentoAdicional ? 'produto-card--tratamento' : ''} ${temColoracao ? 'produto-card--coloracao' : ''}" 
                 data-codigo="${codigoWeb}" 
                 data-marca="${marca}">
                 
                ${diametro ? `
                    <div class="produto-card__diametro">
                        <span class="diametro-valor">${diametro}</span>
                        <span class="diametro-unidade">mm</span>
                    </div>
                ` : ''}
                 
                <div class="produto-card__header">
                    <span class="produto-card__marca">${marca}</span>
                    <div class="produto-card__badges">
                        ${this.renderBadges(info)}
                        ${temTratamentoAdicional ? '<span class="badge badge--adicional">+ Tratamento</span>' : ''}
                    </div>
                </div>
                
                <div class="produto-card__body">
                    <h3 class="produto-card__titulo">${info.familia || codigoWeb}</h3>
                    
                    ${temTratamentoAdicional ? this.renderTratamentoAdicional(info) : ''}
                    ${temColoracao ? this.renderColoracaoAdicional(info) : ''}
                    
                    <div class="produto-card__specs">
                        ${this.renderSpecs(info)}
                    </div>
                </div>
                
                <div class="produto-card__olhos">
                    ${hasOD ? this.renderOlho(od, 'OD') : this.renderOlhoVazio('OD')}
                    ${hasOE ? this.renderOlho(oe, 'OE') : this.renderOlhoVazio('OE')}
                </div>
                
                <div class="produto-card__footer">
                    <div class="produto-card__precos">
                        ${this.renderPrecos(info, temPar, od, oe)}
                    </div>
                    <button class="btn-add-carrinho" data-codigo="${codigoWeb}" data-marca="${marca}">
                        🛒 Adicionar
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * NOVO: Renderiza linha de tratamento adicional
     */
    renderTratamentoAdicional(info) {
        const nomeAR = info.tratamentoAdicionalNome || 'Anti-Reflexo';
        const valorAR = info.tratamentoAdicionalValor || 0;
        
        return `
            <div class="produto-card__tratamento-adicional">
                <span class="tratamento-icon">✨</span>
                <span class="tratamento-nome">${nomeAR}</span>
                <span class="tratamento-valor">+ ${formatCurrency(valorAR)}</span>
            </div>
        `;
    }

    /**
     * NOVO: Renderiza linha de coloração
     */
    renderColoracaoAdicional(info) {
        const nomeCor = info.coloracao || 'Coloração';
        const tipoCor = info.coloracaoTipo || '';
        const valorCor = info.coloracaoValor || 0;
        const hexCor = info.coloracaoHex || '#888888';
        
        return `
            <div class="produto-card__coloracao-adicional">
                <span class="coloracao-preview" style="background-color: ${hexCor}"></span>
                <span class="coloracao-nome">${nomeCor}</span>
                <span class="coloracao-tipo">${tipoCor}</span>
                <span class="coloracao-valor">+ ${formatCurrency(valorCor)}</span>
            </div>
        `;
    }

    /**
     * Renderiza badges do produto
     */
    renderBadges(lente) {
        const badges = [];
        
        if (lente.material) {
            badges.push(`<span class="badge badge--material">${lente.material}</span>`);
        }
        if (lente.indice) {
            badges.push(`<span class="badge badge--indice">${lente.indice}</span>`);
        }
        if (lente.fotossensivel && lente.fotossensivel !== 'Não') {
            badges.push(`<span class="badge badge--foto">☀️ ${lente.fotossensivel}</span>`);
        }
        if (lente.antiblue && lente.antiblue !== 'Não') {
            badges.push(`<span class="badge badge--blue">💙 Blue</span>`);
        }
        // Só mostra badge de AR se veio de fábrica
        if (lente.antireflexo && lente.antireflexo !== 'Não' && lente.origemTratamento !== 'ADICIONAL') {
            badges.push(`<span class="badge badge--ar">✨ ${lente.antireflexo}</span>`);
        }
        
        return badges.join('');
    }

    /**
     * Renderiza especificações
     */
    renderSpecs(lente) {
        const specs = [];
        
        if (lente.tipo) {
            specs.push(`<span class="spec spec--tipo">${lente.tipo}</span>`);
        }
        if (lente.producao) {
            specs.push(`<span class="spec spec--producao">${lente.producao}</span>`);
        }
        
        return specs.join('');
    }

    /**
     * Renderiza informações de um olho
     */
    renderOlho(lente, lado) {
        const esf = this.formatarGrau(lente.esf);
        const cil = this.formatarGrau(lente.cil);
        
        return `
            <div class="produto-olho">
                <span class="produto-olho__lado">${lado}</span>
                <span class="produto-olho__grau">${esf} / ${cil}</span>
            </div>
        `;
    }

    /**
     * Renderiza olho não disponível
     */
    renderOlhoVazio(lado) {
        return `
            <div class="produto-olho produto-olho--vazio">
                <span class="produto-olho__lado">${lado}</span>
                <span class="produto-olho__indisponivel">N/D</span>
            </div>
        `;
    }

    /**
     * Renderiza preços
     * ATUALIZADO: Mostra preço decomposto se houver tratamento adicional
     */
    renderPrecos(info, temPar, od, oe) {
        const temTratamentoAdicional = info.origemTratamento === 'ADICIONAL' && info.tratamentoAdicionalValor;
        
        if (temPar) {
            // Calcula preço do par (soma OD + OE)
            const precoOD = od?.venda || 0;
            const precoOE = oe?.venda || 0;
            let precoPar = info.par || (precoOD + precoOE);
            
            // Se tem tratamento adicional, soma o valor (x2 para o par)
            if (temTratamentoAdicional) {
                const valorTratamentoPar = (info.tratamentoAdicionalValor || 0) * 2;
                const precoTotal = precoPar + valorTratamentoPar;
                
                return `
                    <div class="preco preco--composto">
                        <div class="preco__detalhe">
                            <span class="preco__base">${formatCurrency(precoPar)}</span>
                            <span class="preco__mais">+</span>
                            <span class="preco__tratamento">${formatCurrency(valorTratamentoPar)}</span>
                        </div>
                        <div class="preco__total">
                            <span class="preco__label">Par</span>
                            <span class="preco__valor">${formatCurrency(precoTotal)}</span>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="preco preco--par">
                    <span class="preco__label">Par</span>
                    <span class="preco__valor">${formatCurrency(precoPar)}</span>
                </div>
            `;
        } else {
            const precoUnitario = info.venda || 0;
            
            // Se tem tratamento adicional
            if (temTratamentoAdicional) {
                const valorTratamento = info.tratamentoAdicionalValor || 0;
                const precoTotal = precoUnitario + valorTratamento;
                
                return `
                    <div class="preco preco--composto">
                        <div class="preco__detalhe">
                            <span class="preco__base">${formatCurrency(precoUnitario)}</span>
                            <span class="preco__mais">+</span>
                            <span class="preco__tratamento">${formatCurrency(valorTratamento)}</span>
                        </div>
                        <div class="preco__total">
                            <span class="preco__label">Unid.</span>
                            <span class="preco__valor">${formatCurrency(precoTotal)}</span>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="preco preco--unitario">
                    <span class="preco__label">Unid.</span>
                    <span class="preco__valor">${formatCurrency(precoUnitario)}</span>
                </div>
            `;
        }
    }

    /**
     * Formata valor de grau
     */
    formatarGrau(valor) {
        if (valor === null || valor === undefined) return '';
        const num = parseFloat(valor);
        if (isNaN(num)) return '';
        return num >= 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    }

    // ========================================
    // EVENTOS E FILTROS
    // ========================================

    bindFiltrosEvents() {
        // Filtro de marca
        const filtroMarca = document.getElementById('filtroMarca');
        if (filtroMarca) {
            filtroMarca.addEventListener('change', (e) => {
                this.filtros.marca = e.target.value || null;
                this.aplicarFiltros();
            });
        }

        // Ordenação
        const filtroOrdem = document.getElementById('filtroOrdem');
        if (filtroOrdem) {
            filtroOrdem.addEventListener('change', (e) => {
                this.filtros.ordenacao = e.target.value;
                this.aplicarFiltros();
            });
        }

        // Busca
        const filtroBusca = document.getElementById('filtroBusca');
        if (filtroBusca) {
            filtroBusca.addEventListener('input', (e) => {
                this.filtros.busca = e.target.value.toLowerCase();
                this.aplicarFiltros();
            });
        }
    }

    bindProdutosEvents() {
        const container = document.getElementById('produtosLista');
        
        // Botões de adicionar ao carrinho
        container.querySelectorAll('.btn-add-carrinho').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const codigo = btn.dataset.codigo;
                const marca = btn.dataset.marca;
                const produto = this.produtos.find(p => p.codigoWeb === codigo && p.marca === marca);
                this.emit('addCarrinho', { codigo, marca, produto });
                
                // Feedback visual
                btn.textContent = '✅ Adicionado!';
                btn.classList.add('btn-add-carrinho--added');
                setTimeout(() => {
                    btn.textContent = '🛒 Adicionar';
                    btn.classList.remove('btn-add-carrinho--added');
                }, 1500);
            });
        });

        // Cards clicáveis
        container.querySelectorAll('.produto-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-add-carrinho')) return;
                
                const codigo = card.dataset.codigo;
                const marca = card.dataset.marca;
                const produto = this.produtos.find(p => p.codigoWeb === codigo && p.marca === marca);
                this.emit('produtoClick', { codigo, marca, produto });
            });
        });
    }

    aplicarFiltros() {
        // Começa com todos os produtos
        let filtrados = [...this.produtosOriginais];
        
        // Filtro de marca
        if (this.filtros.marca) {
            filtrados = filtrados.filter(p => p.marca === this.filtros.marca);
        }
        
        // Filtro de busca
        if (this.filtros.busca) {
            const termo = this.filtros.busca;
            filtrados = filtrados.filter(p => {
                const info = p.od || p.oe;
                const textos = [
                    p.marca,
                    p.codigoWeb,
                    info?.familia,
                    info?.descricao,
                    info?.material,
                    info?.coloracao, // Inclui coloração na busca
                    info?.tratamentoAdicionalNome // Inclui nome do tratamento adicional na busca
                ].filter(Boolean).join(' ').toLowerCase();
                return textos.includes(termo);
            });
        }
        
        // Ordenação
        filtrados.sort((a, b) => {
            const infoA = a.od || a.oe;
            const infoB = b.od || b.oe;
            
            // Usa precoTotal se disponível, senão preço de venda
            const precoA = infoA?.precoTotal || infoA?.venda || 0;
            const precoB = infoB?.precoTotal || infoB?.venda || 0;
            
            switch (this.filtros.ordenacao) {
                case 'preco':
                    return precoA - precoB;
                case 'preco-desc':
                    return precoB - precoA;
                case 'marca':
                    return a.marca.localeCompare(b.marca);
                default:
                    return 0;
            }
        });
        
        this.produtos = filtrados;
        this.renderLista();
    }

    atualizarContador(count) {
        const counter = document.getElementById('produtosCount');
        if (counter) {
            counter.textContent = count;
        }
    }

    // ========================================
    // ESTADOS
    // ========================================

    showEmpty(message = 'Nenhum produto encontrado para a receita informada') {
        const filtrosContainer = document.getElementById('produtosFiltros');
        if (filtrosContainer) {
            filtrosContainer.innerHTML = '';
        }
        
        const container = document.getElementById('produtosLista');
        if (container) {
            container.innerHTML = `
                <div class="produtos-empty">
                    <div class="produtos-empty__icon">📭</div>
                    <h3>Nenhum produto encontrado</h3>
                    <p>${message}</p>
                </div>
            `;
        }
        this.atualizarContador(0);
        this.abrir();
    }

    showLoading() {
        const container = document.getElementById('produtosLista');
        if (container) {
            container.innerHTML = `
                <div class="produtos-loading">
                    <div class="loading-spinner"></div>
                    <p>Buscando produtos...</p>
                </div>
            `;
        }
    }

    // ========================================
    // ANIMAÇÕES
    // ========================================

    animateIn() {
        const cards = document.querySelectorAll('#produtosLista .produto-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, Math.min(index * 30, 500)); // Max delay 500ms
        });
    }

    // ========================================
    // ESTILOS ADICIONAIS
    // ========================================

    injectStyles() {
        if (document.getElementById('produtosViewStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'produtosViewStyles';
        style.textContent = `
            /* Badge circular de diâmetro */
            .produto-card {
                position: relative;
            }
            
            .produto-card__diametro {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
                z-index: 10;
            }
            
            .produto-card__diametro .diametro-valor {
                font-size: 16px;
                font-weight: 700;
                line-height: 1;
            }
            
            .produto-card__diametro .diametro-unidade {
                font-size: 10px;
                font-weight: 500;
                opacity: 0.9;
                line-height: 1;
            }
            
            /* Card com tratamento adicional */
            .produto-card--tratamento {
                border-left: 4px solid #17a2b8;
            }
            
            /* Badge de tratamento adicional */
            .badge--adicional {
                background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                color: white;
                font-weight: 600;
            }
            
            /* Badge de coloração */
            .badge--coloracao {
                background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
                color: white;
                font-weight: 600;
            }
            
            /* Card com coloração */
            .produto-card--coloracao {
                border-right: 4px solid #9c27b0;
            }
            
            /* Linha de tratamento adicional */
            .produto-card__tratamento-adicional {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                margin: 8px 0;
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-radius: 8px;
                border-left: 3px solid #2196f3;
            }
            
            /* Linha de coloração adicional */
            .produto-card__coloracao-adicional {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                margin: 8px 0;
                background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
                border-radius: 8px;
                border-left: 3px solid #9c27b0;
            }
            
            .coloracao-preview {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .coloracao-nome {
                flex: 1;
                font-weight: 600;
                color: #7b1fa2;
            }
            
            .coloracao-tipo {
                font-size: 11px;
                color: #9c27b0;
                background: white;
                padding: 2px 6px;
                border-radius: 4px;
            }
            
            .coloracao-valor {
                font-weight: 700;
                color: #6a1b9a;
                background: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 13px;
            }
            
            .tratamento-icon {
                font-size: 16px;
            }
            
            .tratamento-nome {
                flex: 1;
                font-weight: 600;
                color: #1565c0;
            }
            
            .tratamento-valor {
                font-weight: 700;
                color: #0d47a1;
                background: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 13px;
            }
            
            /* Preço composto (base + tratamento) */
            .preco--composto {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .preco__detalhe {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #666;
            }
            
            .preco__base {
                color: #888;
            }
            
            .preco__mais {
                color: #17a2b8;
                font-weight: 700;
            }
            
            .preco__tratamento {
                color: #17a2b8;
                font-weight: 600;
            }
            
            .preco__total {
                display: flex;
                align-items: baseline;
                gap: 8px;
            }
            
            .preco__label {
                font-size: 12px;
                color: #888;
            }
            
            .preco__valor {
                font-size: 20px;
                font-weight: 700;
                color: #28a745;
            }
        `;
        
        document.head.appendChild(style);
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================

    clear() {
        this.produtos = [];
        this.produtosOriginais = [];
        const container = document.getElementById('produtosLista');
        if (container) {
            container.innerHTML = '';
        }
    }
}
