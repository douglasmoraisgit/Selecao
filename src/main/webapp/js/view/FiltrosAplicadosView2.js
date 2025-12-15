/**
 * FiltrosAplicadosView.js
 * View para exibir resumo dos filtros aplicados e quantidade de resultados
 * 
 * RESPONSABILIDADES:
 * - Mostrar resumo compacto dos filtros
 * - Mostrar quantidade de resultados
 * - Permitir remoção rápida de filtros
 * - Botão de buscar/atualizar
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
        this.container = document.getElementById(containerId);
        
        // Estado
        this.quantidade = 0;
        this.carregando = false;
        
        // Cria container se não existir
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.className = 'filtros-aplicados';
            
            // Insere antes do container de cards
            const cardsContainer = document.getElementById('cardsContainer');
            if (cardsContainer && cardsContainer.parentNode) {
                cardsContainer.parentNode.insertBefore(this.container, cardsContainer);
            }
        }
        
        this.injectStyles();
    }

    // ========================================
    // RENDER
    // ========================================

    /**
     * Renderiza os filtros aplicados
     */
    render({ filtros = [], produtos = [], quantidade = 0 }) {
        if (!this.container) return;
        
        this.quantidade = quantidade;
        
        const temFiltros = filtros.length > 0 || produtos.length > 0;
        
        if (!temFiltros) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
            return;
        }
        
        this.container.style.display = 'block';
        
        const html = `
            <div class="filtros-aplicados__header">
                <div class="filtros-aplicados__info">
                    <span class="filtros-aplicados__icon">🔍</span>
                    <span class="filtros-aplicados__count">
                        ${this.carregando ? 'Buscando...' : `${quantidade} produto${quantidade !== 1 ? 's' : ''}`}
                    </span>
                </div>
                <div class="filtros-aplicados__actions">
                    <button class="filtros-aplicados__btn-buscar" ${this.carregando ? 'disabled' : ''}>
                        ${this.carregando ? '⏳' : '🔄'} Atualizar
                    </button>
                </div>
            </div>
            <div class="filtros-aplicados__chips">
                ${filtros.map(f => this.renderChip(f, 'filtro')).join('')}
                ${produtos.map(p => this.renderChipProduto(p)).join('')}
            </div>
        `;
        
        this.container.innerHTML = html;
        this.bindEvents();
    }

    /**
     * Renderiza um chip de filtro
     */
    renderChip(filtro, tipo) {
        const icon = this.getIconByType(filtro.tipo);
        
        return `
            <span class="filtros-aplicados__chip" 
                  data-tipo="${filtro.tipo}" 
                  data-id="${filtro.id}">
                <span class="filtros-aplicados__chip-icon">${icon}</span>
                <span class="filtros-aplicados__chip-label">${filtro.label}</span>
                <button class="filtros-aplicados__chip-remove" 
                        data-tipo="${filtro.tipo}" 
                        data-id="${filtro.id}">✕</button>
            </span>
        `;
    }

    /**
     * Renderiza um chip de produto
     */
    renderChipProduto(produto) {
        return `
            <span class="filtros-aplicados__chip filtros-aplicados__chip--produto" 
                  data-marca="${produto.marca}">
                <span class="filtros-aplicados__chip-icon">📦</span>
                <span class="filtros-aplicados__chip-label">${produto.label || produto.marca}</span>
                <button class="filtros-aplicados__chip-remove filtros-aplicados__chip-remove--produto" 
                        data-marca="${produto.marca}">✕</button>
            </span>
        `;
    }

    // ========================================
    // EVENTOS
    // ========================================

    bindEvents() {
        // Remover filtros
        this.container.querySelectorAll('.filtros-aplicados__chip-remove:not(.filtros-aplicados__chip-remove--produto)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tipo = btn.dataset.tipo;
                const id = btn.dataset.id;
                this.emit('removerFiltro', { tipo, id });
            });
        });
        
        // Remover produtos
        this.container.querySelectorAll('.filtros-aplicados__chip-remove--produto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const marca = btn.dataset.marca;
                this.emit('removerProduto', { marca });
            });
        });
        
        // Botão buscar
        const btnBuscar = this.container.querySelector('.filtros-aplicados__btn-buscar');
        if (btnBuscar) {
            btnBuscar.addEventListener('click', () => {
                this.emit('buscar');
            });
        }
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
        
        const countEl = this.container?.querySelector('.filtros-aplicados__count');
        if (countEl) {
            countEl.textContent = `${quantidade} produto${quantidade !== 1 ? 's' : ''}`;
        }
        
        const btnBuscar = this.container?.querySelector('.filtros-aplicados__btn-buscar');
        if (btnBuscar) {
            btnBuscar.disabled = false;
            btnBuscar.innerHTML = '🔄 Atualizar';
        }
    }

    /**
     * Mostra estado de carregando
     */
    mostrarCarregando() {
        this.carregando = true;
        
        const countEl = this.container?.querySelector('.filtros-aplicados__count');
        if (countEl) {
            countEl.textContent = 'Buscando...';
        }
        
        const btnBuscar = this.container?.querySelector('.filtros-aplicados__btn-buscar');
        if (btnBuscar) {
            btnBuscar.disabled = true;
            btnBuscar.innerHTML = '⏳ Buscando...';
        }
    }

    /**
     * Esconde estado de carregando
     */
    esconderCarregando() {
        this.carregando = false;
        this.atualizarQuantidade(this.quantidade);
    }

    // ========================================
    // HELPERS
    // ========================================

    getIconByType(tipo) {
        const icons = {
            tipoVisao: '👁️',
            marca: '🏢',
            familia: '📁',
            material: '🔬',
            antireflexo: '✨',
            fotossensivel: '☀️',
            antiblue: '💙',
            indice: '📊'
        };
        
        return icons[tipo] || '🏷️';
    }

    // ========================================
    // ESTILOS
    // ========================================

    injectStyles() {
        if (document.getElementById('filtrosAplicadosStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'filtrosAplicadosStyles';
        style.textContent = `
            .filtros-aplicados {
                display: none;
                padding: 10px 12px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 1px solid #dee2e6;
            }
            
            .filtros-aplicados__header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .filtros-aplicados__info {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .filtros-aplicados__icon {
                font-size: 16px;
            }
            
            .filtros-aplicados__count {
                font-size: 13px;
                font-weight: 600;
                color: #495057;
            }
            
            .filtros-aplicados__btn-buscar {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                background: #007bff;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .filtros-aplicados__btn-buscar:hover:not(:disabled) {
                background: #0056b3;
            }
            
            .filtros-aplicados__btn-buscar:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .filtros-aplicados__chips {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .filtros-aplicados__chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 3px 8px;
                background: #fff;
                border: 1px solid #dee2e6;
                border-radius: 12px;
                font-size: 11px;
            }
            
            .filtros-aplicados__chip--produto {
                background: #e7f3ff;
                border-color: #b8daff;
            }
            
            .filtros-aplicados__chip-icon {
                font-size: 12px;
            }
            
            .filtros-aplicados__chip-label {
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .filtros-aplicados__chip-remove {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 14px;
                height: 14px;
                padding: 0;
                margin-left: 2px;
                background: transparent;
                border: none;
                border-radius: 50%;
                font-size: 9px;
                color: #6c757d;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .filtros-aplicados__chip-remove:hover {
                background: #dc3545;
                color: white;
            }
            
            @media (max-width: 480px) {
                .filtros-aplicados {
                    padding: 8px;
                }
                
                .filtros-aplicados__chip-label {
                    max-width: 70px;
                }
                
                .filtros-aplicados__btn-buscar {
                    padding: 4px 8px;
                    font-size: 11px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
