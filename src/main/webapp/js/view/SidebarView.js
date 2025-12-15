/**
 * SidebarView.js
 * View - Renderiza e controla sidebars esquerda e direita
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SidebarView extends EventEmitter {
    
    constructor() {
        super();
        this.leftSidebar = document.getElementById('leftSidebar');
        this.rightSidebar = document.getElementById('optionsSidebar');
        this.leftBackdrop = document.getElementById('leftBackdrop');
        this.rightBackdrop = document.getElementById('rightBackdrop');
        
        this.initBackdropListeners();
    }

    initBackdropListeners() {
        if (this.leftBackdrop) {
            this.leftBackdrop.addEventListener('click', () => this.hideLeft());
        }
        if (this.rightBackdrop) {
            this.rightBackdrop.addEventListener('click', () => this.hideRight());
        }
    }

    // ========================================
    // RENDERIZAÇÃO
    // ========================================

    renderLeft(menuItems = []) {
        if (!this.leftSidebar) return;
        
        const menu = this.leftSidebar.querySelector('.sidebar__menu');
        if (!menu) return;
        
        menu.innerHTML = menuItems.map(section => `
            <div class="sidebar__section">
                <div class="sidebar__section-title">
                    ${section.icon || ''} ${section.title}
                    ${section.badge ? `<span class="sidebar__section-badge sidebar__section-badge--${section.badge.type || 'default'}">${section.badge.text || section.badge}</span>` : ''}
                </div>
                <ul class="sidebar__list">
                    ${section.items.map(item => `
                        <li class="sidebar__item ${item.active ? 'sidebar__item--active' : ''}" 
                            data-id="${item.id}" data-action="${item.action || ''}">
                            <span class="sidebar__item-icon">${item.icon || ''}</span>
                            <span class="sidebar__item-text">${item.text || item.label || ''}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
        
        // Bind click events nos itens
        this.bindLeftItemEvents();
    }

    renderRight(menuItems = []) {
        if (!this.rightSidebar) return;
        
        const menu = this.rightSidebar.querySelector('.sidebar__menu');
        if (!menu) return;
        
        menu.innerHTML = menuItems.map(section => `
            <div class="sidebar__section">
                <div class="sidebar__section-title">${section.title}</div>
                <ul class="sidebar__list">
                    ${section.items.map(item => `
                        <li class="sidebar__item" data-id="${item.id}" data-action="${item.action || ''}">
                            <div class="sidebar__item-icon">${item.icon || ''}</div>
                            <div class="sidebar__item-content">
                                <div class="sidebar__item-title">${item.title}</div>
                                <div class="sidebar__item-description">${item.description || ''}</div>
                            </div>
                            ${item.badge ? `<div class="sidebar__item-badge">${item.badge}</div>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
        
        // Bind click events nos itens
        this.bindRightItemEvents();
    }

    // ========================================
    // EVENTOS DOS ITENS
    // ========================================

    bindLeftItemEvents() {
        if (!this.leftSidebar) return;
        
        const items = this.leftSidebar.querySelectorAll('.sidebar__item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const action = item.dataset.action;
                
                console.log('📌 Sidebar left item clicked:', id, action);
                
                // Marca item como ativo
                this.setActiveLeftItem(id);
                
                // Emite evento
                this.emit('leftItemClick', { id, action, element: item });
            });
        });
    }

    bindRightItemEvents() {
        if (!this.rightSidebar) return;
        
        const items = this.rightSidebar.querySelectorAll('.sidebar__item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const action = item.dataset.action;
                
                console.log('📌 Sidebar right item clicked:', id, action);
                
                // Emite evento
                this.emit('rightItemClick', { id, action, element: item });
            });
        });
    }

    setActiveLeftItem(id) {
        if (!this.leftSidebar) return;
        
        // Remove active de todos
        this.leftSidebar.querySelectorAll('.sidebar__item').forEach(item => {
            item.classList.remove('sidebar__item--active');
        });
        
        // Adiciona active no selecionado
        const activeItem = this.leftSidebar.querySelector(`.sidebar__item[data-id="${id}"]`);
        if (activeItem) {
            activeItem.classList.add('sidebar__item--active');
        }
    }

    // ========================================
    // TOGGLE / SHOW / HIDE
    // ========================================

    toggleLeft(visible) {
        if (this.leftSidebar) {
            this.leftSidebar.classList.toggle('sidebar--visible', visible);
        }
        if (this.leftBackdrop) {
            this.leftBackdrop.classList.toggle('sidebar-backdrop--visible', visible);
        }
    }

    toggleRight(visible) {
        console.log('🔧 SidebarView.toggleRight:', visible);
        if (this.rightSidebar) {
            this.rightSidebar.classList.toggle('sidebar--visible', visible);
            console.log('  Classes:', this.rightSidebar.className);
        }
        if (this.rightBackdrop) {
            this.rightBackdrop.classList.toggle('sidebar-backdrop--visible', visible);
        }
    }

    showLeft() { 
        this.toggleLeft(true); 
    }
    
    hideLeft() { 
        this.toggleLeft(false); 
    }
    
    showRight() { 
        this.toggleRight(true); 
    }
    
    hideRight() { 
        this.toggleRight(false); 
    }

    isLeftVisible() {
        return this.leftSidebar?.classList.contains('sidebar--visible') || false;
    }

    isRightVisible() {
        return this.rightSidebar?.classList.contains('sidebar--visible') || false;
    }
}
