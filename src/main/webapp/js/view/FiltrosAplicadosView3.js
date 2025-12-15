/**
 * FiltrosAplicadosView.js
 * View para exibir painel de filtros aplicados (estilo flutuante no canto direito)
 * 
 * RESPONSABILIDADES:
 * - Mostrar painel flutuante com filtros ativos
 * - Mostrar quantidade de resultados em destaque
 * - Permitir remoção de filtros
 * 
 * EVENTOS EMITIDOS:
 * - 'removerFiltro'   → Filtro removido { tipo, id }
 * - 'removerProduto'  → Produto removido { marca }
 * - 'buscar'          → Solicitação de nova busca
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class FiltrosAplicadosView extends EventEmitter {
    
    constructor(containerId) {
        super();
        
        this.containerId = containerId;
        this.container = null;
        
        // Estado
        this.quantidade = 0;
        this.carregando = false;
        
        // Cria o painel flutuante
        this.criarPainel();
        this.injectStyles();
    }

    // ========================================
    // CRIAÇÃO DO PAINEL
    // ========================================

    criarPainel() {
        // Remove se já existir
        const existente = document.getElementById(this.containerId);
        if (existente) {
            existente.remove();
        }
        
        // Cria o painel flutuante
        this.container = document.createElement('div');
        this.container.id = this.containerId;
        this.container.className = 'filtros-painel';
        
        // Adiciona ao body
        document.body.appendChild(this.container);
    }

    // ========================================
    // RENDER
    // ========================================

    /**
     * Renderiza o painel de filtros
     */
    render({ filtros = [], produtos = [], quantidade = 0 }) {
        if (!this.container) return;
        
        this.quantidade = quantidade;
        
        const temFiltros = filtros.length > 0 || produtos.length > 0;
        
        if (!temFiltros) {
            this.container.style.display = 'none';
            return;
        }
        
        this.container.style.display = 'block';
        
        // Agrupa filtros por tipo para exibição
        const filtrosAgrupados = this.agruparFiltros(filtros);
        
        const html = `
            <div class="filtros-painel__header">
                <span class="filtros-painel__header-icon">☑️</span>
                <span class="filtros-painel__header-title">Filtros Aplicados</span>
                <button class="filtros-painel__close" title="Fechar">×</button>
            </div>
            
            <div class="filtros-painel__content">
                ${this.renderFiltrosAgrupados(filtrosAgrupados)}
                ${this.renderProdutos(produtos)}
            </div>
            
            <div class="filtros-painel__resultado">
                <div class="filtros-painel__resultado-numero ${this.carregando ? 'loading' : ''}">
                    ${this.carregando ? '...' : quantidade}
                </div>
                <div class="filtros-painel__resultado-texto">
                    Produtos Disponíveis
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        this.bindEvents();
    }

    /**
     * Agrupa filtros por tipo
     */
    agruparFiltros(filtros) {
        const grupos = {};
        
        filtros.forEach(filtro => {
            const tipoLabel = this.getTipoLabel(filtro.tipo);
            if (!grupos[tipoLabel]) {
                grupos[tipoLabel] = [];
            }
            grupos[tipoLabel].push(filtro);
        });
        
        return grupos;
    }

    /**
     * Renderiza filtros agrupados
     */
    renderFiltrosAgrupados(grupos) {
        return Object.entries(grupos).map(([tipo, filtros]) => `
            <div class="filtros-painel__grupo">
                <div class="filtros-painel__grupo-titulo">${tipo}</div>
                <div class="filtros-painel__grupo-itens">
                    ${filtros.map(f => this.renderFiltroItem(f)).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza um item de filtro
     */
    renderFiltroItem(filtro) {
        return `
            <div class="filtros-painel__item" data-tipo="${filtro.tipo}" data-id="${filtro.id}">
                <span class="filtros-painel__item-label">${filtro.label}</span>
                <button class="filtros-painel__item-remove" 
                        data-tipo="${filtro.tipo}" 
                        data-id="${filtro.id}"
                        title="Remover">×</button>
            </div>
        `;
    }

    /**
     * Renderiza produtos selecionados
     */
    renderProdutos(produtos) {
        if (!produtos || produtos.length === 0) return '';
        
        return `
            <div class="filtros-painel__grupo">
                <div class="filtros-painel__grupo-titulo">Produtos</div>
                <div class="filtros-painel__grupo-itens">
                    ${produtos.map(p => `
                        <div class="filtros-painel__item filtros-painel__item--produto" data-marca="${p.marca}">
                            <span class="filtros-painel__item-label">${p.label || p.marca}</span>
                            <button class="filtros-painel__item-remove filtros-painel__item-remove--produto" 
                                    data-marca="${p.marca}"
                                    title="Remover">×</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ========================================
    // EVENTOS
    // ========================================

    bindEvents() {
        // Fechar painel
        const btnClose = this.container.querySelector('.filtros-painel__close');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.container.style.display = 'none';
            });
        }
        
        // Remover filtros
        this.container.querySelectorAll('.filtros-painel__item-remove:not(.filtros-painel__item-remove--produto)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tipo = btn.dataset.tipo;
                const id = btn.dataset.id;
                this.emit('removerFiltro', { tipo, id });
            });
        });
        
        // Remover produtos
        this.container.querySelectorAll('.filtros-painel__item-remove--produto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const marca = btn.dataset.marca;
                this.emit('removerProduto', { marca });
            });
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Atualiza apenas a quantidade
     */
    atualizarQuantidade(quantidade) {
        this.quantidade = quantidade;
        this.carregando = false;
        
        const numeroEl = this.container?.querySelector('.filtros-painel__resultado-numero');
        if (numeroEl) {
            numeroEl.textContent = quantidade;
            numeroEl.classList.remove('loading');
        }
    }

    /**
     * Mostra estado de carregando
     */
    mostrarCarregando() {
        this.carregando = true;
        
        const numeroEl = this.container?.querySelector('.filtros-painel__resultado-numero');
        if (numeroEl) {
            numeroEl.textContent = '...';
            numeroEl.classList.add('loading');
        }
    }

    /**
     * Esconde estado de carregando
     */
    esconderCarregando() {
        this.carregando = false;
        this.atualizarQuantidade(this.quantidade);
    }

    /**
     * Mostra o painel
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Esconde o painel
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    // ========================================
    // HELPERS
    // ========================================

    getTipoLabel(tipo) {
        const labels = {
            tipoVisao: 'Visão',
            marca: 'Marca',
            familia: 'Família',
            material: 'Material',
            antireflexo: 'Anti-Reflexo',
            fotossensivel: 'Fotossensível',
            antiblue: 'Anti-Blue',
            indice: 'Índice'
        };
        
        return labels[tipo] || tipo;
    }

    // ========================================
    // ESTILOS
    // ========================================

    injectStyles() {
        if (document.getElementById('filtrosPainelStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'filtrosPainelStyles';
        style.textContent = `
            .filtros-painel {
                position: fixed;
                top: 120px;
                right: 20px;
                width: 220px;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                display: none;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .filtros-painel__header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
            }
            
            .filtros-painel__header-icon {
                font-size: 16px;
            }
            
            .filtros-painel__header-title {
                flex: 1;
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            
            .filtros-painel__close {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                font-size: 18px;
                color: #6c757d;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .filtros-painel__close:hover {
                background: #e9ecef;
                color: #333;
            }
            
            .filtros-painel__content {
                padding: 12px 16px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .filtros-painel__grupo {
                margin-bottom: 12px;
            }
            
            .filtros-painel__grupo:last-child {
                margin-bottom: 0;
            }
            
            .filtros-painel__grupo-titulo {
                font-size: 11px;
                font-weight: 600;
                color: #6c757d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }
            
            .filtros-painel__grupo-itens {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .filtros-painel__item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 10px;
                background: #e7f1ff;
                border-radius: 6px;
                font-size: 13px;
            }
            
            .filtros-painel__item--produto {
                background: #e8f5e9;
            }
            
            .filtros-painel__item-label {
                color: #1a73e8;
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .filtros-painel__item--produto .filtros-painel__item-label {
                color: #2e7d32;
            }
            
            .filtros-painel__item-remove {
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                font-size: 14px;
                color: #6c757d;
                cursor: pointer;
                border-radius: 50%;
                transition: all 0.2s;
                flex-shrink: 0;
                margin-left: 8px;
            }
            
            .filtros-painel__item-remove:hover {
                background: #dc3545;
                color: white;
            }
            
            .filtros-painel__resultado {
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                text-align: center;
            }
            
            .filtros-painel__resultado-numero {
                font-size: 42px;
                font-weight: 700;
                color: #fff;
                line-height: 1;
                margin-bottom: 4px;
            }
            
            .filtros-painel__resultado-numero.loading {
                animation: pulse 1s infinite;
            }
            
            .filtros-painel__resultado-texto {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .filtros-painel {
                    top: auto;
                    bottom: 80px;
                    right: 10px;
                    left: 10px;
                    width: auto;
                    max-width: 300px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
