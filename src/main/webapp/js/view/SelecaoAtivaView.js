/**
 * SelecaoAtivaView.js
 * View para exibir seleções ativas como tags removíveis
 * 
 * RESPONSABILIDADES:
 * - Renderizar tags de seleções ativas
 * - Emitir eventos de remoção
 * - Emitir eventos de limpar tudo
 * 
 * EVENTOS EMITIDOS:
 * - 'remover'   → Tag foi clicada para remoção { tipo, id }
 * - 'limpar'    → Botão limpar tudo clicado
 * - 'tagClick'  → Tag foi clicada (sem remoção) { tipo, id }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SelecaoAtivaView extends EventEmitter {
    
    constructor(containerId) {
        super();
        
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        // Cria container se não existir
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.className = 'selecao-ativa';
            
            // Tenta inserir após o breadcrumb ou no início do main
            const breadcrumb = document.getElementById('breadcrumbContainer');
            if (breadcrumb && breadcrumb.parentNode) {
                breadcrumb.parentNode.insertBefore(this.container, breadcrumb.nextSibling);
            } else {
                const main = document.querySelector('.main') || document.body;
                main.insertBefore(this.container, main.firstChild);
            }
        }
        
        this.injectStyles();
    }

    // ========================================
    // RENDER
    // ========================================

    /**
     * Renderiza as seleções ativas
     */
    render(selecoes) {
        if (!this.container) return;
        
        // Se não tem seleções, esconde
        if (!selecoes || selecoes.length === 0) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
            return;
        }
        
        this.container.style.display = 'flex';
        
        // Agrupa por tipo para exibição
        const html = `
            <div class="selecao-ativa__tags">
                ${selecoes.map(sel => this.renderTag(sel)).join('')}
            </div>
            <button class="selecao-ativa__limpar" title="Limpar todas as seleções">
                <span class="selecao-ativa__limpar-icon">✕</span>
                <span class="selecao-ativa__limpar-text">Limpar</span>
            </button>
        `;
        
        this.container.innerHTML = html;
        this.bindEvents();
    }

    /**
     * Renderiza uma tag individual
     */
    renderTag(selecao) {
        const icon = this.getIconByType(selecao.tipo, selecao.icon);
        const label = selecao.label || selecao.id;
        const tipoLabel = this.getTipoLabel(selecao.tipo);
        
        return `
            <div class="selecao-ativa__tag" 
                 data-tipo="${selecao.tipo}" 
                 data-id="${selecao.id}"
                 title="${tipoLabel}: ${label}">
                <span class="selecao-ativa__tag-icon">${icon}</span>
                <span class="selecao-ativa__tag-label">${label}</span>
                <button class="selecao-ativa__tag-remove" 
                        data-tipo="${selecao.tipo}" 
                        data-id="${selecao.id}"
                        title="Remover ${label}">✕</button>
            </div>
        `;
    }

    // ========================================
    // EVENTOS
    // ========================================

    bindEvents() {
        // Botões de remover tag
        this.container.querySelectorAll('.selecao-ativa__tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tipo = btn.dataset.tipo;
                const id = btn.dataset.id;
                this.emit('remover', { tipo, id });
            });
        });
        
        // Click na tag (navegar)
        this.container.querySelectorAll('.selecao-ativa__tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                if (e.target.classList.contains('selecao-ativa__tag-remove')) return;
                
                const tipo = tag.dataset.tipo;
                const id = tag.dataset.id;
                this.emit('tagClick', { tipo, id });
            });
        });
        
        // Botão limpar tudo
        const btnLimpar = this.container.querySelector('.selecao-ativa__limpar');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                this.emit('limpar');
            });
        }
    }

    // ========================================
    // HELPERS
    // ========================================

    getIconByType(tipo, defaultIcon) {
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
        
        return defaultIcon || icons[tipo] || '🏷️';
    }

    getTipoLabel(tipo) {
        const labels = {
            tipoVisao: 'Tipo de Visão',
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
        if (document.getElementById('selecaoAtivaStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'selecaoAtivaStyles';
        style.textContent = `
            .selecao-ativa {
                display: none;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
            }
            
            .selecao-ativa__tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                flex: 1;
            }
            
            .selecao-ativa__tag {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: #fff;
                border: 1px solid #dee2e6;
                border-radius: 16px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .selecao-ativa__tag:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            
            .selecao-ativa__tag-icon {
                font-size: 14px;
            }
            
            .selecao-ativa__tag-label {
                max-width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .selecao-ativa__tag-remove {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                padding: 0;
                margin-left: 2px;
                background: transparent;
                border: none;
                border-radius: 50%;
                font-size: 10px;
                color: #6c757d;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .selecao-ativa__tag-remove:hover {
                background: #dc3545;
                color: white;
            }
            
            .selecao-ativa__limpar {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 12px;
                background: transparent;
                border: 1px solid #dc3545;
                border-radius: 16px;
                font-size: 12px;
                color: #dc3545;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .selecao-ativa__limpar:hover {
                background: #dc3545;
                color: white;
            }
            
            .selecao-ativa__limpar-icon {
                font-size: 10px;
            }
            
            @media (max-width: 480px) {
                .selecao-ativa {
                    padding: 6px 8px;
                }
                
                .selecao-ativa__tag-label {
                    max-width: 80px;
                }
                
                .selecao-ativa__limpar-text {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
