/**
 * CarrinhoView.js
 * View - Modal do carrinho de compras (CSS Puro - Sem Bootstrap)
 * 
 * RESPONSABILIDADES:
 * - Renderizar botão flutuante do carrinho
 * - Renderizar modal do carrinho
 * - Exibir abas Lentes e Produtos
 * - Mostrar tratamentos abaixo das lentes
 * - Controles de quantidade (+ / -)
 * - Campo de cliente
 * - Botões de ação (Cancelar, Ir para Pagamento)
 * 
 * EVENTOS EMITIDOS:
 * - 'incrementar'      → { id }
 * - 'decrementar'      → { id }
 * - 'remover'          → { id }
 * - 'limpar'           → {}
 * - 'clienteChange'    → { nome }
 * - 'irParaPagamento'  → {} (abre tela de pagamento)
 * - 'salvarOrcamento'  → {}
 * - 'adicionarItem'    → {}
 * - 'abaChange'        → { aba }
 * - 'abrir'            → {}
 * - 'fechar'           → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';
import { formatCurrency, $, $$ } from '../util/helpers.js';

export default class CarrinhoView extends EventEmitter {
    
    constructor(options = {}) {
        super();
        
        this.modal = null;
        this.overlay = null;
        this.botaoFlutuante = null;
        this.abaAtiva = 'lentes'; // 'lentes' | 'produtos'
        this.isOpen = false;
        
        // Opção para mostrar ou não o botão flutuante
        this.mostrarBotaoFlutuante = options.mostrarBotaoFlutuante !== false;
        
        this.injectStyles();
        
        if (this.mostrarBotaoFlutuante) {
            this.createBotaoFlutuante();
        }
        
        this.createModal();
    }

    // ========================================
    // BOTÃO FLUTUANTE
    // ========================================

    createBotaoFlutuante() {
        // Remove existente se houver
        const existente = $('#btnCarrinhoFlutuante');
        if (existente) existente.remove();
        
        const btnHtml = `
            <button id="btnCarrinhoFlutuante" class="carrinho-btn-flutuante" title="Abrir Carrinho">
                <span class="carrinho-btn-icon">🛒</span>
                <span class="carrinho-badge" id="carrinhoBadge">0</span>
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', btnHtml);
        
        this.botaoFlutuante = $('#btnCarrinhoFlutuante');
        
        // Bind do clique
        this.botaoFlutuante.addEventListener('click', () => {
            this.toggle();
        });
    }

    /**
     * Atualiza o badge do botão flutuante
     */
    atualizarBadge(quantidade) {
        const badge = $('#carrinhoBadge');
        if (badge) {
            badge.textContent = quantidade;
            badge.style.display = quantidade > 0 ? 'flex' : 'none';
            
            // Animação de pulse quando adiciona item
            if (quantidade > 0 && this.botaoFlutuante) {
                this.botaoFlutuante.classList.add('pulse');
                setTimeout(() => {
                    this.botaoFlutuante.classList.remove('pulse');
                }, 300);
            }
        }
    }

    /**
     * Mostra/esconde o botão flutuante
     */
    mostrarBotao(mostrar = true) {
        if (this.botaoFlutuante) {
            this.botaoFlutuante.style.display = mostrar ? 'flex' : 'none';
        }
    }

    // ========================================
    // CRIAÇÃO DO MODAL
    // ========================================

    createModal() {
        // Remove modal existente se houver
        const existente = $('#carrinhoModal');
        if (existente) existente.remove();
        
        const existenteOverlay = $('#carrinhoOverlay');
        if (existenteOverlay) existenteOverlay.remove();
        
        const modalHtml = `
            <div class="carrinho-overlay" id="carrinhoOverlay"></div>
            <div class="carrinho-modal" id="carrinhoModal">
                <!-- Header -->
                <div class="carrinho-header">
                    <div class="carrinho-header-left">
                        <h2 class="carrinho-title">
                            <span class="title-icon">🛒</span>
                            Carrinho
                        </h2>
                        
                        <div class="carrinho-cliente">
                            <span class="cliente-icon">👤</span>
                            <input type="text" 
                                   id="inputCliente" 
                                   class="carrinho-input-cliente" 
                                   placeholder="Nome do cliente..."
                                   autocomplete="off">
                            <button class="carrinho-btn-limpar-cliente" id="btnLimparCliente" title="Limpar cliente">
                                ✕
                            </button>
                        </div>
                    </div>
                    
                    <button class="carrinho-btn-fechar" id="btnFecharCarrinho" title="Fechar">
                        ✕
                    </button>
                </div>
                
                <!-- Abas -->
                <div class="carrinho-abas">
                    <button class="carrinho-aba active" id="abaLentes" data-aba="lentes">
                        <span class="aba-icon">👓</span>
                        Lentes
                        <span class="carrinho-aba-badge" id="badgeLentes">0</span>
                    </button>
                    <button class="carrinho-aba" id="abaProdutos" data-aba="produtos">
                        <span class="aba-icon">📦</span>
                        Demais Produtos
                        <span class="carrinho-aba-badge" id="badgeProdutos">0</span>
                    </button>
                </div>
                
                <!-- Body -->
                <div class="carrinho-body" id="carrinhoBody">
                    <div class="carrinho-lista" id="carrinhoLista">
                        <!-- Itens serão renderizados aqui -->
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="carrinho-footer">
                    <div class="carrinho-total">
                        <span class="carrinho-total-label">Total Pedido:</span>
                        <span class="carrinho-total-valor" id="carrinhoTotal">R$ 0,00</span>
                    </div>
                    
                    <div class="carrinho-acoes">
                        <button class="carrinho-btn carrinho-btn-add" id="btnAddItem">
                            <span class="btn-icon">➕</span> Item
                        </button>
                        <button class="carrinho-btn carrinho-btn-limpar" id="btnCancelar">
                            <span class="btn-icon">🗑️</span> Limpar
                        </button>
                        <button class="carrinho-btn carrinho-btn-orcamento" id="btnSalvarOrcamento">
                            <span class="btn-icon">💾</span> Salvar Orçamento
                        </button>
                        <button class="carrinho-btn carrinho-btn-finalizar" id="btnFinalizar">
                            <span class="btn-icon">💳</span> Ir Para Pagamento
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        this.modal = $('#carrinhoModal');
        this.overlay = $('#carrinhoOverlay');
        
        this.bindEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindEvents() {
        // Fechar
        $('#btnFecharCarrinho').addEventListener('click', () => this.fechar());
        this.overlay.addEventListener('click', () => this.fechar());
        
        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.fechar();
            }
        });
        
        // Abas
        $('#abaLentes').addEventListener('click', () => this.setAba('lentes'));
        $('#abaProdutos').addEventListener('click', () => this.setAba('produtos'));
        
        // Cliente
        $('#inputCliente').addEventListener('input', (e) => {
            this.emit('clienteChange', { nome: e.target.value });
        });
        
        $('#btnLimparCliente').addEventListener('click', () => {
            $('#inputCliente').value = '';
            this.emit('clienteChange', { nome: '' });
        });
        
        // Ações
        $('#btnAddItem').addEventListener('click', () => {
            this.emit('adicionarItem');
        });
        
        $('#btnCancelar').addEventListener('click', () => {
            this.emit('limpar');
        });
        
        $('#btnSalvarOrcamento').addEventListener('click', () => {
            this.emit('salvarOrcamento');
        });
        
        // ✅ CORRIGIDO: Emite 'irParaPagamento' (não 'finalizar')
        $('#btnFinalizar').addEventListener('click', () => {
            this.emit('irParaPagamento');
        });
    }

    // ========================================
    // ABRIR/FECHAR
    // ========================================

    abrir() {
        this.modal.classList.add('open');
        this.overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        this.emit('abrir');
    }

    fechar() {
        this.modal.classList.remove('open');
        this.overlay.classList.remove('open');
        document.body.style.overflow = '';
        this.isOpen = false;
        this.emit('fechar');
    }

    isAberto() {
        return this.isOpen;
    }

    toggle() {
        if (this.isOpen) {
            this.fechar();
        } else {
            this.abrir();
        }
    }

    // ========================================
    // ABAS
    // ========================================

    setAba(aba) {
        this.abaAtiva = aba;
        
        // Atualiza visual das abas
        $$('.carrinho-aba').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.aba === aba);
        });
        
        // Atualiza badges
        const badgeLentes = $('#badgeLentes');
        const badgeProdutos = $('#badgeProdutos');
        
        if (aba === 'lentes') {
            badgeLentes.classList.add('active');
            badgeProdutos.classList.remove('active');
        } else {
            badgeLentes.classList.remove('active');
            badgeProdutos.classList.add('active');
        }
        
        this.emit('abaChange', { aba });
    }

    // ========================================
    // RENDER PRINCIPAL
    // ========================================

    render(dados) {
        const { lentes = [], produtos = [], cliente = '', total = 0 } = dados;
        
        // Atualiza badges
        $('#badgeLentes').textContent = lentes.length;
        $('#badgeProdutos').textContent = produtos.length;
        
        // Atualiza cliente (garante que é string)
        const clienteNome = typeof cliente === 'object' 
            ? (cliente?.nome || cliente?.name || '') 
            : (cliente || '');
        $('#inputCliente').value = clienteNome;
        
        // Atualiza total
        this.atualizarTotal(total);
        
        // Renderiza lista conforme aba
        const container = $('#carrinhoLista');
        const itens = this.abaAtiva === 'lentes' ? lentes : produtos;
        
        if (itens.length === 0) {
            this.showEmpty();
            return;
        }
        
        if (this.abaAtiva === 'lentes') {
            this.renderLentes(lentes, container);
        } else {
            this.renderProdutos(produtos, container);
        }
    }

    // ========================================
    // RENDER LENTES
    // ========================================

    renderLentes(lentes, container) {
        if (lentes.length === 0) {
            container.innerHTML = `
                <div class="carrinho-empty">
                    <span class="empty-icon">👓</span>
                    <p>Nenhuma lente no carrinho</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="carrinho-items">';
        
        lentes.forEach(item => {
            html += this.renderLinhaLente(item);
        });
        
        html += '</div>';
        
        container.innerHTML = html;
        this.bindItemEvents(container);
    }

    renderLinhaLente(item) {
        const subtotal = item.precoTotal || (item.precoUnitario * item.quantidade);
        
        // Tratamentos HTML
        let tratamentosHtml = '';
        if (item.tratamentos && item.tratamentos.length > 0) {
            const listaTratamentos = item.tratamentos.map(t => 
                `<span class="tratamento-item">• ${t.nome} (${formatCurrency(t.valor || t.valorVenda || 0)})</span>`
            ).join('');
            
            tratamentosHtml = `
                <div class="item-tratamentos">
                    <div class="tratamentos-header">
                        <span class="tratamentos-icon">💎</span>
                        <strong>Tratamentos:</strong>
                    </div>
                    <div class="tratamentos-lista">${listaTratamentos}</div>
                </div>
            `;
        }
        
        // Coloração HTML
        let coloracaoHtml = '';
        if (item.coloracao && item.coloracao.nome) {
            const hex = item.coloracao.hex || item.coloracao.corHex || '#888888';
            coloracaoHtml = `
                <div class="item-coloracao">
                    <div class="coloracao-header">
                        <span class="coloracao-icon">🎨</span>
                        <strong>Coloração:</strong>
                    </div>
                    <div class="coloracao-info">
                        <span class="coloracao-preview" style="background-color: ${hex};"></span>
                        <span class="coloracao-nome">${item.coloracao.nome}</span>
                        ${item.coloracao.valor ? `<span class="coloracao-valor">(${formatCurrency(item.coloracao.valor)})</span>` : ''}
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="carrinho-item" data-id="${item.id}">
                <div class="item-main">
                    <div class="item-info">
                        <div class="item-codigo">${item.codigoWeb || item.codigo}</div>
                        <div class="item-detalhes">
                            <div class="item-marca">${item.marca || ''}</div>
                            <div class="item-descricao">${item.descricao || item.familia || ''}</div>
                            <div class="item-olho">
                                <span class="olho-badge ${item.olho === 'OD' ? 'od' : 'oe'}">${item.olho}</span>
                                <span class="item-grau">ESF: ${item.esf || 0} | CIL: ${item.cil || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-controles">
                        <div class="item-unidade">${item.unidade || 'UN'}</div>
                        <div class="item-quantidade">
                            <button class="btn-qtd minus" data-id="${item.id}" data-action="decrementar" title="Diminuir">
                                −
                            </button>
                            <span class="qtd-valor">${item.quantidade}</span>
                            <button class="btn-qtd plus" data-id="${item.id}" data-action="incrementar" title="Aumentar">
                                +
                            </button>
                        </div>
                        <div class="item-preco">${formatCurrency(item.precoUnitario || 0)}</div>
                        <div class="item-subtotal">${formatCurrency(subtotal)}</div>
                        <button class="btn-remover" data-id="${item.id}" title="Remover">
                            🗑️
                        </button>
                    </div>
                </div>
                
                ${tratamentosHtml}
                ${coloracaoHtml}
            </div>
        `;
    }

    // ========================================
    // RENDER PRODUTOS
    // ========================================

    renderProdutos(produtos, container) {
        if (produtos.length === 0) {
            container.innerHTML = `
                <div class="carrinho-empty">
                    <span class="empty-icon">📦</span>
                    <p>Nenhum produto no carrinho</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="carrinho-items">';
        
        produtos.forEach(item => {
            html += this.renderLinhaProduto(item);
        });
        
        html += '</div>';
        
        container.innerHTML = html;
        this.bindItemEvents(container);
    }

    renderLinhaProduto(item) {
        const subtotal = item.precoUnitario * item.quantidade;
        
        return `
            <div class="carrinho-item produto" data-id="${item.id}">
                <div class="item-main">
                    <div class="item-info">
                        <div class="item-codigo">${item.codigo}</div>
                        <div class="item-detalhes">
                            <div class="item-descricao">${item.descricao}</div>
                            ${item.marca ? `<div class="item-marca">${item.marca}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="item-controles">
                        <div class="item-unidade">${item.unidade || 'UN'}</div>
                        <div class="item-quantidade">
                            <button class="btn-qtd minus" data-id="${item.id}" data-action="decrementar" title="Diminuir">
                                −
                            </button>
                            <span class="qtd-valor">${item.quantidade}</span>
                            <button class="btn-qtd plus" data-id="${item.id}" data-action="incrementar" title="Aumentar">
                                +
                            </button>
                        </div>
                        <div class="item-preco">${formatCurrency(item.precoUnitario)}</div>
                        <div class="item-subtotal">${formatCurrency(subtotal)}</div>
                        <button class="btn-remover" data-id="${item.id}" title="Remover">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // BIND EVENTOS DOS ITENS
    // ========================================

    bindItemEvents(container) {
        // Botões de quantidade
        $$('.btn-qtd', container).forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                this.emit(action, { id });
            });
        });
        
        // Botões de remover
        $$('.btn-remover', container).forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.emit('remover', { id });
            });
        });
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================

    atualizarTotal(total) {
        $('#carrinhoTotal').textContent = formatCurrency(total);
    }

    showEmpty() {
        const container = $('#carrinhoLista');
        container.innerHTML = `
            <div class="carrinho-empty">
                <span class="empty-icon">🛒</span>
                <p>Seu carrinho está vazio</p>
                <button class="carrinho-btn carrinho-btn-add" id="btnAddPrimeiroItem">
                    <span class="btn-icon">➕</span> Adicionar Primeiro Item
                </button>
            </div>
        `;
        
        $('#btnAddPrimeiroItem')?.addEventListener('click', () => {
            this.emit('adicionarItem');
        });
        
        $('#carrinhoTotal').textContent = formatCurrency(0);
        $('#badgeLentes').textContent = '0';
        $('#badgeProdutos').textContent = '0';
    }

    setCliente(cliente) {
        const clienteNome = typeof cliente === 'object' 
            ? (cliente?.nome || cliente?.name || '') 
            : (cliente || '');
        $('#inputCliente').value = clienteNome;
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if ($('#carrinhoViewStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'carrinhoViewStyles';
        style.textContent = `
            /* ========================================
               ÍCONES E FALLBACKS
               ======================================== */
            
            .icon-fallback {
                display: none;
                font-weight: bold;
                font-size: 14px;
            }
            
            /* Mostra fallback se Font Awesome não carregar */
            .btn-qtd .fas,
            .btn-remover .fas {
                display: inline;
            }
            
            .btn-qtd:not(:has(.fas:before)) .icon-fallback,
            .btn-remover:not(:has(.fas:before)) .icon-fallback {
                display: inline;
            }
            
            /* Fallback simples: sempre mostra se fa não funcionar */
            .btn-qtd .fas:empty + .icon-fallback,
            .btn-remover .fas:empty + .icon-fallback {
                display: inline;
            }
            
            .title-icon,
            .cliente-icon,
            .aba-icon,
            .btn-icon,
            .tratamentos-icon,
            .empty-icon {
                font-style: normal;
            }
            
            .empty-icon {
                font-size: 48px;
                display: block;
                margin-bottom: 16px;
                opacity: 0.6;
            }
            
            /* ========================================
               BOTÃO FLUTUANTE DO CARRINHO
               ======================================== */
            
            .carrinho-btn-flutuante {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4),
                            0 2px 6px rgba(0, 0, 0, 0.15);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .carrinho-btn-icon {
                font-size: 28px;
                font-style: normal;
            }
            
            .carrinho-btn-flutuante:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5),
                            0 4px 10px rgba(0, 0, 0, 0.2);
            }
            
            .carrinho-btn-flutuante:active {
                transform: scale(0.95);
            }
            
            .carrinho-btn-flutuante.pulse {
                animation: carrinho-pulse 0.3s ease;
            }
            
            @keyframes carrinho-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .carrinho-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 22px;
                height: 22px;
                padding: 0 6px;
                background: #ef4444;
                color: white;
                border-radius: 11px;
                font-size: 12px;
                font-weight: bold;
                display: none;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            /* ========================================
               OVERLAY
               ======================================== */
            
            .carrinho-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .carrinho-overlay.open {
                opacity: 1;
                visibility: visible;
            }
            
            /* ========================================
               MODAL
               ======================================== */
            
            .carrinho-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                width: 95%;
                max-width: 900px;
                max-height: 90vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .carrinho-modal.open {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, -50%) scale(1);
            }
            
            /* ========================================
               HEADER
               ======================================== */
            
            .carrinho-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-radius: 12px 12px 0 0;
            }
            
            .carrinho-header-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .carrinho-title {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .carrinho-cliente {
                display: flex;
                align-items: center;
                gap: 8px;
                background: rgba(255, 255, 255, 0.15);
                padding: 6px 12px;
                border-radius: 6px;
            }
            
            .carrinho-input-cliente {
                border: none;
                background: white;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 14px;
                width: 180px;
                outline: none;
            }
            
            .carrinho-btn-limpar-cliente {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            
            .carrinho-btn-limpar-cliente:hover {
                opacity: 1;
            }
            
            .carrinho-btn-fechar {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: background 0.2s;
            }
            
            .carrinho-btn-fechar:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            /* ========================================
               ABAS
               ======================================== */
            
            .carrinho-abas {
                display: flex;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
            }
            
            .carrinho-aba {
                flex: 1;
                padding: 14px 20px;
                border: none;
                background: none;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-bottom: 3px solid transparent;
                transition: all 0.2s;
            }
            
            .carrinho-aba:hover {
                color: #3b82f6;
                background: rgba(59, 130, 246, 0.05);
            }
            
            .carrinho-aba.active {
                color: #3b82f6;
                border-bottom-color: #3b82f6;
                background: white;
            }
            
            .carrinho-aba-badge {
                background: #e5e7eb;
                color: #6b7280;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .carrinho-aba.active .carrinho-aba-badge {
                background: #3b82f6;
                color: white;
            }
            
            /* ========================================
               BODY
               ======================================== */
            
            .carrinho-body {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                min-height: 300px;
                max-height: 45vh;
            }
            
            .carrinho-items {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            /* ========================================
               ITEM
               ======================================== */
            
            .carrinho-item {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                transition: all 0.2s;
            }
            
            .carrinho-item:hover {
                border-color: #3b82f6;
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
            }
            
            .item-main {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                padding: 4px 0;
            }
            
            .item-info {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                flex: 1;
                min-width: 0;
            }
            
            .item-codigo {
                background: #3b82f6;
                color: white;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            .item-detalhes {
                flex: 1;
                min-width: 0;
            }
            
            .item-marca {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .item-descricao {
                color: #6b7280;
                font-size: 13px;
                margin-bottom: 4px;
            }
            
            .item-olho {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                margin-top: 6px;
            }
            
            .olho-badge {
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 700;
                min-width: 32px;
                text-align: center;
            }
            
            .olho-badge.od {
               background: #dcfce7;
                color: #16a34a;
                border: 1px solid #86efac;
            }
            
            .olho-badge.oe {
                background: #dcfce7;
                color: #16a34a;
                border: 1px solid #86efac;
            }
            
            .item-grau {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
                white-space: nowrap;
            }
            
            .item-controles {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .item-unidade {
                background: #e5e7eb;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                color: #6b7280;
            }
            
            .item-quantidade {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .btn-qtd {
                width: 28px;
                height: 28px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6b7280;
                transition: all 0.2s;
            }
            
            .btn-qtd:hover {
                border-color: #3b82f6;
                color: #3b82f6;
            }
            
            .btn-qtd.minus:hover {
                border-color: #ef4444;
                color: #ef4444;
            }
            
            .btn-qtd.plus:hover {
                border-color: #22c55e;
                color: #22c55e;
            }
            
            .qtd-valor {
                min-width: 40px;
                text-align: center;
                font-weight: 600;
            }
            
            .item-preco {
                color: #6b7280;
                font-size: 13px;
                min-width: 80px;
                text-align: right;
            }
            
            .item-subtotal {
                color: #16a34a;
                font-weight: 600;
                min-width: 90px;
                text-align: right;
            }
            
            .btn-remover {
                width: 32px;
                height: 32px;
                border: none;
                background: #fee2e2;
                color: #ef4444;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .btn-remover:hover {
                background: #ef4444;
                color: white;
            }
            
            /* ========================================
               TRATAMENTOS
               ======================================== */
            
            .item-tratamentos {
                margin-top: 10px;
                padding: 10px 12px;
                background: rgba(14, 165, 233, 0.08);
                border-left: 3px solid #0ea5e9;
                border-radius: 0 6px 6px 0;
            }
            
            .tratamentos-header {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #0284c7;
                font-size: 13px;
                margin-bottom: 6px;
            }
            
            .tratamentos-lista {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .tratamento-item {
                font-size: 12px;
                color: #0369a1;
                background: rgba(14, 165, 233, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
            }
            
            /* ========================================
               COLORAÇÃO
               ======================================== */
            
            .item-coloracao {
                margin-top: 10px;
                padding: 10px 12px;
                background: rgba(147, 51, 234, 0.08);
                border-left: 3px solid #9333ea;
                border-radius: 0 6px 6px 0;
            }
            
            .coloracao-header {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #7c3aed;
                font-size: 13px;
                margin-bottom: 6px;
            }
            
            .coloracao-icon {
                font-style: normal;
            }
            
            .coloracao-info {
                display: flex;
                align-items: center;
                gap: 10px;
                padding-left: 4px;
            }
            
            .coloracao-preview {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                flex-shrink: 0;
            }
            
            .coloracao-nome {
                color: #7c3aed;
                font-size: 13px;
                font-weight: 500;
            }
            
            .coloracao-valor {
                color: #9333ea;
                font-size: 12px;
            }
            
            /* ========================================
               EMPTY STATE
               ======================================== */
            
            .carrinho-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                color: #9ca3af;
            }
            
            .carrinho-empty .empty-icon {
                font-size: 56px;
                margin-bottom: 16px;
                opacity: 0.6;
            }
            
            .carrinho-empty p {
                margin: 0 0 20px 0;
                font-size: 16px;
            }
            
            /* ========================================
               FOOTER
               ======================================== */
            
            .carrinho-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                background: #f9fafb;
                border-top: 1px solid #e5e7eb;
                border-radius: 0 0 12px 12px;
            }
            
            .carrinho-total {
                display: flex;
                align-items: baseline;
                gap: 10px;
            }
            
            .carrinho-total-label {
                color: #6b7280;
                font-size: 14px;
            }
            
            .carrinho-total-valor {
                font-size: 24px;
                font-weight: 700;
                color: #16a34a;
            }
            
            .carrinho-acoes {
                display: flex;
                gap: 10px;
            }
            
            .carrinho-btn {
                padding: 10px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .carrinho-btn-add {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            
            .carrinho-btn-add:hover {
                background: #dcfce7;
            }
            
            .carrinho-btn-limpar {
                background: #fef2f2;
                color: #ef4444;
                border: 1px solid #fecaca;
            }
            
            .carrinho-btn-limpar:hover {
                background: #fee2e2;
            }
            
            .carrinho-btn-orcamento {
                background: #fffbeb;
                color: #d97706;
                border: 1px solid #fde68a;
            }
            
            .carrinho-btn-orcamento:hover {
                background: #fef3c7;
            }
            
            .carrinho-btn-finalizar {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 12px 24px;
                font-size: 15px;
            }
            
            .carrinho-btn-finalizar:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
            
            /* ========================================
               RESPONSIVE
               ======================================== */
            
            @media (max-width: 768px) {
                .carrinho-btn-flutuante {
                    width: 52px;
                    height: 52px;
                    font-size: 20px;
                    bottom: 16px;
                    right: 16px;
                }
                
                .carrinho-modal {
                    width: 100%;
                    height: 100%;
                    max-width: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
                
                .carrinho-header {
                    border-radius: 0;
                }
                
                .carrinho-header-left {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                
                .carrinho-cliente {
                    width: 100%;
                }
                
                .carrinho-input-cliente {
                    flex: 1;
                }
                
                .item-main {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .item-controles {
                    justify-content: space-between;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .carrinho-footer {
                    flex-direction: column;
                    gap: 16px;
                    border-radius: 0;
                }
                
                .carrinho-acoes {
                    width: 100%;
                    flex-direction: column;
                }
                
                .carrinho-btn {
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
