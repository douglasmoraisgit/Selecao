/**
 * BreadcrumbView.js
 * View - Renderiza breadcrumbs de navegação
 */

import EventEmitter from '../util/EventEmitter.js';

export default class BreadcrumbView extends EventEmitter {
    
    constructor(containerId = 'breadcrumbContainer') {
        super();
        this.container = document.getElementById(containerId);
    }

    /**
     * Renderiza breadcrumbs
     * @param {Array} breadcrumbs - Array de {id, label, icon, type}
     * @param {Object} currentNode - Nó atual {id, label, icon}
     */
    render(breadcrumbs, currentNode) {
        if (!this.container) return;
        
        // Esconde se estiver no root (sem breadcrumbs e é root)
        if ((!breadcrumbs || breadcrumbs.length === 0) && (!currentNode || currentNode.type === 'root')) {
            this.container.style.display = 'none';
            return;
        }
        
        this.container.style.display = 'flex';
        this.container.innerHTML = '';
        
        // NÃO mostra "Início" - começa direto pelos breadcrumbs
        // Itens do breadcrumb (clicáveis)
        if (breadcrumbs && breadcrumbs.length > 0) {
            breadcrumbs.forEach((item, displayIndex) => {
                // Adiciona separador antes (exceto no primeiro)
                if (displayIndex > 0) {
                    this.container.appendChild(this.createSeparator());
                }
                // Usa originalIndex para navegação (se disponível), senão usa displayIndex
                const navIndex = item.originalIndex !== undefined ? item.originalIndex : displayIndex;
                this.container.appendChild(this.createClickableItem(item, navIndex));
            });
        }
        
        // Item atual (não clicável)
        if (currentNode && currentNode.type !== 'root') {
            // Adiciona separador se houver breadcrumbs antes
            if (breadcrumbs && breadcrumbs.length > 0) {
                this.container.appendChild(this.createSeparator());
            }
            this.container.appendChild(this.createCurrentItem(currentNode));
        }
    }

    /**
     * Cria item clicável do breadcrumb
     */
    createClickableItem(item, index) {
        const span = document.createElement('span');
        span.className = 'breadcrumb__item';
        span.dataset.id = item.id;
        
        // Ícone + texto
        const icon = item.icon ? `<span class="breadcrumb__icon">${item.icon}</span>` : '';
        span.innerHTML = `${icon}<span class="breadcrumb__text">${item.label}</span>`;
        
        span.addEventListener('click', () => {
            console.log('🔗 Breadcrumb click:', item.id, 'index:', index);
            this.emit('click', { item, index });
        });
        
        return span;
    }

    /**
     * Cria item atual (não clicável)
     */
    createCurrentItem(node) {
        const span = document.createElement('span');
        span.className = 'breadcrumb__item breadcrumb__item--current';
        
        const icon = node.icon ? `<span class="breadcrumb__icon">${node.icon}</span>` : '';
        span.innerHTML = `${icon}<span class="breadcrumb__text">${node.label || node.title}</span>`;
        
        return span;
    }

    /**
     * Cria separador
     */
    createSeparator() {
        const span = document.createElement('span');
        span.className = 'breadcrumb__separator';
        span.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
        return span;
    }

    hide() {
        if (this.container) this.container.style.display = 'none';
    }

    show() {
        if (this.container) this.container.style.display = 'flex';
    }
}
