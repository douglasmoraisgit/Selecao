/**
 * ToolbarInferiorView.js
 * View - Barra de navegação inferior fixa
 * 
 * RESPONSABILIDADES:
 * - Renderizar toolbar fixa no rodapé
 * - Exibir botões de navegação (Home, Receita, Carrinho, etc.)
 * - Atualizar badges dos botões
 * - Emitir eventos de clique
 * 
 * EVENTOS EMITIDOS:
 * - 'home'       → {}
 * - 'receita'    → {}
 * - 'carrinho'   → {}
 * - 'buscar'     → {}
 * - 'mais'       → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';
import { $, $$ } from '../util/helpers.js';

export default class ToolbarInferiorView extends EventEmitter {
    
    constructor(options = {}) {
        super();
        
        this.toolbar = null;
        this.options = {
            // Botões padrão - pode customizar via options
            botoes: options.botoes || [
                { id: 'home', icon: 'fa-home', label: 'Home', event: 'home' },
                { id: 'buscar', icon: 'fa-search', label: 'Buscar', event: 'buscar' },
                { id: 'receita', icon: 'fa-prescription', label: 'Receita', event: 'receita', badge: false },
                { id: 'carrinho', icon: 'fa-shopping-cart', label: 'Carrinho', event: 'carrinho', badge: true },
                { id: 'mais', icon: 'fa-ellipsis-h', label: 'Mais', event: 'mais' }
            ],
            mostrarLabels: options.mostrarLabels !== false, // true por padrão
            tema: options.tema || 'light' // 'light' | 'dark'
        };
        
        this.injectStyles();
        this.createToolbar();
        this.addBodyPadding();
    }

    // ========================================
    // CRIAÇÃO DA TOOLBAR
    // ========================================

    createToolbar() {
        // Remove existente se houver
        const existente = $('#toolbarInferior');
        if (existente) existente.remove();
        
        const botoesHtml = this.options.botoes.map(btn => `
            <button class="toolbar-inf-btn" data-action="${btn.event}" id="toolbarBtn_${btn.id}" title="${btn.label}">
                <div class="toolbar-inf-btn-icon">
                    <i class="fas ${btn.icon}"></i>
                    ${btn.badge ? `<span class="toolbar-inf-badge" id="badge_${btn.id}" style="display: none;">0</span>` : ''}
                </div>
                ${this.options.mostrarLabels ? `<span class="toolbar-inf-btn-label">${btn.label}</span>` : ''}
            </button>
        `).join('');
        
        const toolbarHtml = `
            <nav class="toolbar-inferior ${this.options.tema}" id="toolbarInferior">
                <div class="toolbar-inf-container">
                    ${botoesHtml}
                </div>
            </nav>
        `;
        
        document.body.insertAdjacentHTML('beforeend', toolbarHtml);
        
        this.toolbar = $('#toolbarInferior');
        this.bindEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindEvents() {
        $$('.toolbar-inf-btn', this.toolbar).forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                
                // Feedback visual
                this.setAtivo(btn.id.replace('toolbarBtn_', ''));
                
                // Emite evento
                this.emit(action);
            });
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Atualiza o badge de um botão
     * @param {string} botaoId - ID do botão (ex: 'carrinho')
     * @param {number} valor - Valor do badge
     */
    atualizarBadge(botaoId, valor) {
        const badge = $(`#badge_${botaoId}`);
        if (badge) {
            badge.textContent = valor;
            badge.style.display = valor > 0 ? 'flex' : 'none';
            
            // Animação de pulse
            if (valor > 0) {
                badge.classList.add('pulse');
                setTimeout(() => badge.classList.remove('pulse'), 300);
            }
        }
    }

    /**
     * Define qual botão está ativo
     * @param {string} botaoId - ID do botão
     */
    setAtivo(botaoId) {
        $$('.toolbar-inf-btn', this.toolbar).forEach(btn => {
            btn.classList.remove('active');
        });
        
        const btn = $(`#toolbarBtn_${botaoId}`);
        if (btn) {
            btn.classList.add('active');
        }
    }

    /**
     * Atualiza o estado visual do botão de receita
     * @param {boolean} temReceita - Se tem receita preenchida
     */
    atualizarBotaoReceita(temReceita) {
        const btn = $('#toolbarBtn_receita');
        if (btn) {
            btn.classList.toggle('com-receita', temReceita);
            btn.classList.toggle('sem-receita', !temReceita);
        }
    }

    /**
     * Mostra/esconde a toolbar
     * @param {boolean} mostrar
     */
    mostrar(mostrar = true) {
        if (this.toolbar) {
            this.toolbar.style.transform = mostrar ? 'translateY(0)' : 'translateY(100%)';
        }
        
        // Ajusta padding do body
        document.body.style.paddingBottom = mostrar ? '70px' : '0';
    }

    /**
     * Esconde a toolbar
     */
    esconder() {
        this.mostrar(false);
    }

    /**
     * Desabilita um botão
     * @param {string} botaoId
     * @param {boolean} desabilitar
     */
    desabilitarBotao(botaoId, desabilitar = true) {
        const btn = $(`#toolbarBtn_${botaoId}`);
        if (btn) {
            btn.disabled = desabilitar;
            btn.classList.toggle('disabled', desabilitar);
        }
    }

    /**
     * Adiciona padding ao body para não sobrepor conteúdo
     */
    addBodyPadding() {
        document.body.style.paddingBottom = '70px';
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if ($('#toolbarInferiorStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'toolbarInferiorStyles';
        style.textContent = `
            /* ========================================
               TOOLBAR INFERIOR
               ======================================== */
            
            .toolbar-inferior {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 64px;
                background: white;
                border-top: 1px solid #e5e7eb;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
                z-index: 9990;
                transition: transform 0.3s ease;
            }
            
            .toolbar-inferior.dark {
                background: #1f2937;
                border-top-color: #374151;
            }
            
            .toolbar-inf-container {
                display: flex;
                align-items: center;
                justify-content: space-around;
                height: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 0 8px;
            }
            
            /* ========================================
               BOTÕES
               ======================================== */
            
            .toolbar-inf-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                padding: 8px 12px;
                border: none;
                background: none;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.2s ease;
                border-radius: 12px;
                min-width: 60px;
            }
            
            .toolbar-inferior.dark .toolbar-inf-btn {
                color: #9ca3af;
            }
            
            .toolbar-inf-btn:hover {
                color: #3b82f6;
                background: rgba(59, 130, 246, 0.08);
            }
            
            .toolbar-inf-btn:active {
                transform: scale(0.95);
            }
            
            .toolbar-inf-btn.active {
                color: #3b82f6;
            }
            
            .toolbar-inf-btn.active .toolbar-inf-btn-icon {
                background: rgba(59, 130, 246, 0.15);
            }
            
            .toolbar-inf-btn.disabled {
                opacity: 0.4;
                pointer-events: none;
            }
            
            /* Botão Receita - Estados */
            .toolbar-inf-btn.com-receita {
                color: #16a34a;
            }
            
            .toolbar-inf-btn.com-receita .toolbar-inf-btn-icon {
                background: rgba(22, 163, 74, 0.15);
            }
            
            .toolbar-inf-btn.sem-receita {
                color: #ef4444;
            }
            
            .toolbar-inf-btn.sem-receita .toolbar-inf-btn-icon {
                background: rgba(239, 68, 68, 0.1);
            }
            
            /* ========================================
               ÍCONE DO BOTÃO
               ======================================== */
            
            .toolbar-inf-btn-icon {
                position: relative;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 10px;
                font-size: 18px;
                transition: all 0.2s ease;
            }
            
            /* ========================================
               BADGE
               ======================================== */
            
            .toolbar-inf-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 18px;
                height: 18px;
                padding: 0 5px;
                background: #ef4444;
                color: white;
                border-radius: 9px;
                font-size: 11px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
            }
            
            .toolbar-inferior.dark .toolbar-inf-badge {
                border-color: #1f2937;
            }
            
            .toolbar-inf-badge.pulse {
                animation: badge-pulse 0.3s ease;
            }
            
            @keyframes badge-pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            /* ========================================
               LABEL
               ======================================== */
            
            .toolbar-inf-btn-label {
                font-size: 11px;
                font-weight: 500;
                line-height: 1;
            }
            
            /* ========================================
               SAFE AREA (iOS)
               ======================================== */
            
            @supports (padding-bottom: env(safe-area-inset-bottom)) {
                .toolbar-inferior {
                    padding-bottom: env(safe-area-inset-bottom);
                    height: calc(64px + env(safe-area-inset-bottom));
                }
            }
            
            /* ========================================
               RESPONSIVO
               ======================================== */
            
            @media (max-width: 400px) {
                .toolbar-inf-btn {
                    min-width: 50px;
                    padding: 8px 8px;
                }
                
                .toolbar-inf-btn-label {
                    font-size: 10px;
                }
                
                .toolbar-inf-btn-icon {
                    width: 32px;
                    height: 32px;
                    font-size: 16px;
                }
            }
            
            /* Landscape em mobile - toolbar menor */
            @media (max-height: 500px) and (orientation: landscape) {
                .toolbar-inferior {
                    height: 50px;
                }
                
                .toolbar-inf-btn-label {
                    display: none;
                }
                
                .toolbar-inf-btn {
                    padding: 6px 16px;
                }
            }
            
            /* Desktop grande - pode esconder labels se preferir */
            @media (min-width: 768px) {
                .toolbar-inferior {
                    /* Pode customizar para desktop se necessário */
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
