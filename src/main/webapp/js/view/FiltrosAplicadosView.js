/**
 * FiltrosAplicadosView.js
 * View para exibir painel de filtros aplicados (estilo flutuante no canto direito)
 * COM FUNCIONALIDADE DE ARRASTAR
 * 
 * RESPONSABILIDADES:
 * - Mostrar painel flutuante com filtros ativos
 * - Mostrar quantidade de resultados em destaque
 * - Permitir remoção de filtros
 * - Permitir arrastar o painel para qualquer posição
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
        
        // Estado do drag
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Cria o painel flutuante
        this.criarPainel();
        this.injectStyles();
        this.initDrag();
        this.loadPosition();
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
    // DRAG AND DROP
    // ========================================

    initDrag() {
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.onDragStart(e));
        document.addEventListener('mousemove', (e) => this.onDragMove(e));
        document.addEventListener('mouseup', (e) => this.onDragEnd(e));
        
        // Touch events (mobile)
        this.container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }

    onDragStart(e) {
        // Só arrasta pelo header
        const header = e.target.closest('.filtros-painel__header');
        if (!header) return;
        
        // Ignora se clicar no botão fechar
        if (e.target.closest('.filtros-painel__close')) return;
        
        this.isDragging = true;
        this.container.classList.add('dragging');
        
        const rect = this.container.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        e.preventDefault();
    }

    onDragMove(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        this.setPosition(x, y);
    }

    onDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.container.classList.remove('dragging');
        
        // Salva posição
        this.savePosition();
    }

    // Touch events
    onTouchStart(e) {
        const header = e.target.closest('.filtros-painel__header');
        if (!header) return;
        if (e.target.closest('.filtros-painel__close')) return;
        
        this.isDragging = true;
        this.container.classList.add('dragging');
        
        const touch = e.touches[0];
        const rect = this.container.getBoundingClientRect();
        this.dragOffset = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
        
        e.preventDefault();
    }

    onTouchMove(e) {
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const x = touch.clientX - this.dragOffset.x;
        const y = touch.clientY - this.dragOffset.y;
        
        this.setPosition(x, y);
        e.preventDefault();
    }

    onTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.container.classList.remove('dragging');
        this.savePosition();
    }

    setPosition(x, y) {
        // Limita dentro da tela
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        // Remove posicionamento padrão e usa coordenadas absolutas
        this.container.style.right = 'auto';
        this.container.style.top = y + 'px';
        this.container.style.left = x + 'px';
    }

    savePosition() {
        const rect = this.container.getBoundingClientRect();
        const position = {
            left: rect.left,
            top: rect.top
        };
        
        try {
            localStorage.setItem('filtrosPainelPosition', JSON.stringify(position));
        } catch (e) {
            console.warn('Não foi possível salvar posição do painel');
        }
    }

    loadPosition() {
        try {
            const saved = localStorage.getItem('filtrosPainelPosition');
            if (saved) {
                const position = JSON.parse(saved);
                
                // Verifica se a posição ainda está válida (dentro da tela)
                if (position.left >= 0 && position.left < window.innerWidth - 100 &&
                    position.top >= 0 && position.top < window.innerHeight - 100) {
                    this.container.style.right = 'auto';
                    this.container.style.left = position.left + 'px';
                    this.container.style.top = position.top + 'px';
                }
            }
        } catch (e) {
            console.warn('Não foi possível carregar posição do painel');
        }
    }

    resetPosition() {
        this.container.style.left = 'auto';
        this.container.style.right = '20px';
        this.container.style.top = '120px';
        
        try {
            localStorage.removeItem('filtrosPainelPosition');
        } catch (e) {}
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
                <span class="filtros-painel__drag-hint" title="Arraste para mover">⋮⋮</span>
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
            
            <div class="filtros-painel__footer">
                <button class="filtros-painel__reset-btn" title="Resetar posição">
                    📍 Resetar posição
                </button>
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
        
        // Resetar posição
        const btnReset = this.container.querySelector('.filtros-painel__reset-btn');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.resetPosition();
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
                transition: box-shadow 0.2s ease;
            }
            
            /* Estado arrastando */
            .filtros-painel.dragging {
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
                opacity: 0.95;
                cursor: grabbing;
            }
            
            .filtros-painel__header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                cursor: grab;
                user-select: none;
            }
            
            .filtros-painel.dragging .filtros-painel__header {
                cursor: grabbing;
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
            
            .filtros-painel__drag-hint {
                font-size: 14px;
                color: #adb5bd;
                letter-spacing: -2px;
                cursor: grab;
            }
            
            .filtros-painel.dragging .filtros-painel__drag-hint {
                cursor: grabbing;
                color: #6c757d;
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
            
            .filtros-painel__footer {
                padding: 8px 12px;
                background: #f8f9fa;
                border-top: 1px solid #e9ecef;
                text-align: center;
            }
            
            .filtros-painel__reset-btn {
                background: transparent;
                border: none;
                font-size: 11px;
                color: #6c757d;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .filtros-painel__reset-btn:hover {
                background: #e9ecef;
                color: #333;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .filtros-painel {
                    width: 200px;
                }
                
                .filtros-painel__footer {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
