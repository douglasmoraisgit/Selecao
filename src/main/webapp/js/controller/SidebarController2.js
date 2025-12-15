/**
 * SidebarController.js
 * Responsável por gerenciar os menus laterais (sidebars)
 * 
 * RESPONSABILIDADES:
 * - Renderizar menus
 * - Processar clicks nos itens
 * - Mostrar/esconder sidebars
 * 
 * EVENTOS EMITIDOS:
 * - 'itemConfigClicado'     → Item de configuração clicado { id }
 * - 'itemCategoriaClicado'  → Item de categoria clicado { id }
 * - 'itemDireitaClicado'    → Item da sidebar direita clicado { id, action }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SidebarController extends EventEmitter {
    
    constructor({ sidebarModel, sidebarView }) {
        super();
        
        // Dependências injetadas
        this.sidebarModel = sidebarModel;
        this.sidebarView = sidebarView;
        
        // IDs das categorias de configuração
        this.configIds = ['material', 'antiReflexo', 'fotossensivel', 'antiBlue', 'indice'];
        
        // Bind de eventos
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Sidebar esquerda
        this.sidebarView.on('leftItemClick', ({ id, action }) => {
            this.handleLeftClick(id, action);
        });
        
        // Sidebar direita
        this.sidebarView.on('rightItemClick', ({ id, action }) => {
            this.handleRightClick(id, action);
        });
    }

    // ========================================
    // HANDLERS
    // ========================================

    /**
     * Processa click na sidebar esquerda
     */
    handleLeftClick(id, action) {
        console.log('🔗 Sidebar left click:', id, action);
        
        const isConfig = this.configIds.includes(id);
        console.log('🔍 É configuração?', isConfig, 'ID:', id);
        
        if (isConfig) {
            // Para configurações, emite evento específico
            this.emit('itemConfigClicado', { id });
        } else {
            // Para categorias de visão
            this.emit('itemCategoriaClicado', { id });
        }
        
        // Fecha sidebar após seleção (mobile)
        this.sidebarView.hideLeft();
    }

    /**
     * Processa click na sidebar direita
     */
    handleRightClick(id, action) {
        console.log('⚙️ Sidebar right click:', id, action);
        
        this.emit('itemDireitaClicado', { id, action });
        
        // Fecha sidebar
        this.sidebarView.hideRight();
    }

    // ========================================
    // RENDER
    // ========================================

    /**
     * Renderiza os menus das sidebars
     */
    renderMenus() {
        const leftMenu = this.sidebarModel.leftMenuStructure?.sections || [];
        const rightMenu = this.sidebarModel.rightMenuStructure?.sections || [];
        
        this.sidebarView.renderLeft(leftMenu);
        this.sidebarView.renderRight(rightMenu);
    }

    // ========================================
    // CONTROLE DE VISIBILIDADE
    // ========================================

    showLeft() {
        this.sidebarView.showLeft();
    }

    hideLeft() {
        this.sidebarView.hideLeft();
    }

    showRight() {
        this.sidebarView.showRight();
    }

    hideRight() {
        this.sidebarView.hideRight();
    }

    toggleLeft() {
        this.sidebarView.toggleLeft();
    }

    toggleRight() {
        this.sidebarView.toggleRight();
    }
}
