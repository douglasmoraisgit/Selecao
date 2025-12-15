/**
 * SidebarModel.js
 * Model - Gerencia estado das sidebars (esquerda e direita)
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SidebarModel extends EventEmitter {
    
    constructor() {
        super();
        
        // Estado das sidebars
        this.state = {
            left: {
                visible: false,
                activeItem: null,
                activeSection: null
            },
            right: {
                visible: false,
                activeItem: null,
                activeSection: null
            }
        };
        
        // Estrutura do menu esquerdo (navegação rápida)
        this.leftMenuStructure = {
            sections: [
                {
                    id: 'tipoVisao',
                    title: 'TIPO DE VISÃO',
                    icon: '👁️',
                    badge: { text: 'ÚNICA', type: 'unica' },
                    items: [
                        { id: 'longe', icon: '🔭', text: 'Longe', action: 'selectTipoVisao' },
                        { id: 'perto', icon: '📖', text: 'Perto', action: 'selectTipoVisao' },
                        { id: 'meia-distancia', icon: '💻', text: 'Meia Distância', action: 'selectTipoVisao' },
                        { id: 'bifocal', icon: '👓', text: 'Bifocal', action: 'selectTipoVisao' },
                        { id: 'multifocal', icon: '🎭', text: 'Multifocal', action: 'selectTipoVisao' },
                        { id: 'ocupacional', icon: '⚒️', text: 'Ocupacional', action: 'selectTipoVisao' }
                    ]
                },
                {
                    id: 'configuracao',
                    title: 'CONFIGURAÇÃO',
                    icon: '⚙️',
                    badge: { text: 'MÚLTIPLA', type: 'multipla' },
                    items: [
                        { id: 'material', icon: '🔬', text: 'Material', action: 'selectConfig' },
                        { id: 'antiReflexo', icon: '✨', text: 'Anti-Reflexo', action: 'selectConfig' },
                        { id: 'fotossensivel', icon: '🌞', text: 'Fotossensível', action: 'selectConfig' },
                        { id: 'antiBlue', icon: '💙', text: 'Anti-Blue', action: 'selectConfig' },
                        { id: 'indice', icon: '🔢', text: 'Índice de Refração', action: 'selectConfig' }
                    ]
                }
            ]
        };
        
        // Estrutura do menu direito (opções)
        this.rightMenuStructure = {
            sections: [
                {
                    id: 'cadastros',
                    title: 'CADASTROS',
                    items: [
                        { 
                            id: 'clientes', 
                            icon: '👥', 
                            title: 'Clientes',
                            description: 'Cadastro e histórico de clientes',
                            badge: 24,
                            action: 'openClientes'
                        },
                        { 
                            id: 'vendedores', 
                            icon: '🧑‍💼', 
                            title: 'Vendedores',
                            description: 'Equipe de vendas',
                            action: 'openVendedores'
                        },
                        { 
                            id: 'armacoes', 
                            icon: '👓', 
                            title: 'Armações',
                            description: 'Catálogo de armações',
                            badge: 156,
                            action: 'openArmacoes'
                        }
                    ]
                },
                {
                    id: 'ferramentas',
                    title: 'FERRAMENTAS',
                    items: [
                        { 
                            id: 'orcamentos', 
                            icon: '📄', 
                            title: 'Orçamentos',
                            description: 'Criar e gerenciar orçamentos',
                            action: 'openOrcamentos'
                        },
                        { 
                            id: 'pedidos', 
                            icon: '📦', 
                            title: 'Pedidos',
                            description: 'Acompanhar pedidos',
                            badge: 3,
                            action: 'openPedidos'
                        },
                        { 
                            id: 'relatorios', 
                            icon: '📊', 
                            title: 'Relatórios',
                            description: 'Análises e estatísticas',
                            action: 'openRelatorios'
                        }
                    ]
                },
                {
                    id: 'sistema',
                    title: 'SISTEMA',
                    items: [
                        { 
                            id: 'configuracoes', 
                            icon: '⚙️', 
                            title: 'Configurações',
                            description: 'Preferências do sistema',
                            action: 'openConfiguracoes'
                        }
                    ]
                }
            ]
        };
    }

    // ========================================
    // VISIBILIDADE
    // ========================================

    /**
     * Mostra sidebar
     * @param {'left'|'right'} side
     */
    show(side) {
        if (this.state[side]) {
            this.state[side].visible = true;
            this.emit('show', { side });
            this.emit('change', { side, state: this.state[side] });
        }
    }

    /**
     * Esconde sidebar
     * @param {'left'|'right'} side
     */
    hide(side) {
        if (this.state[side]) {
            this.state[side].visible = false;
            this.emit('hide', { side });
            this.emit('change', { side, state: this.state[side] });
        }
    }

    /**
     * Toggle sidebar
     * @param {'left'|'right'} side
     */
    toggle(side) {
        if (this.isVisible(side)) {
            this.hide(side);
        } else {
            this.show(side);
        }
    }

    /**
     * Esconde todas as sidebars
     */
    hideAll() {
        this.hide('left');
        this.hide('right');
    }

    /**
     * Verifica se está visível
     * @param {'left'|'right'} side
     * @returns {boolean}
     */
    isVisible(side) {
        return this.state[side]?.visible || false;
    }

    // ========================================
    // ITEM ATIVO
    // ========================================

    /**
     * Define item ativo
     * @param {'left'|'right'} side
     * @param {string} itemId
     * @param {string} [sectionId]
     */
    setActiveItem(side, itemId, sectionId = null) {
        if (this.state[side]) {
            const previous = this.state[side].activeItem;
            
            this.state[side].activeItem = itemId;
            if (sectionId) {
                this.state[side].activeSection = sectionId;
            }
            
            this.emit('activeItem', { 
                side, 
                itemId, 
                sectionId, 
                previous 
            });
            this.emit('change', { side, state: this.state[side] });
        }
    }

    /**
     * Retorna item ativo
     * @param {'left'|'right'} side
     * @returns {string|null}
     */
    getActiveItem(side) {
        return this.state[side]?.activeItem || null;
    }

    /**
     * Verifica se item está ativo
     * @param {'left'|'right'} side
     * @param {string} itemId
     * @returns {boolean}
     */
    isActiveItem(side, itemId) {
        return this.state[side]?.activeItem === itemId;
    }

    /**
     * Limpa item ativo
     * @param {'left'|'right'} side
     */
    clearActiveItem(side) {
        if (this.state[side]) {
            this.state[side].activeItem = null;
            this.state[side].activeSection = null;
            this.emit('change', { side, state: this.state[side] });
        }
    }

    // ========================================
    // ESTRUTURA DO MENU
    // ========================================

    /**
     * Retorna estrutura do menu
     * @param {'left'|'right'} side
     * @returns {Object}
     */
    getMenuStructure(side) {
        return side === 'left' ? this.leftMenuStructure : this.rightMenuStructure;
    }

    /**
     * Retorna seções do menu
     * @param {'left'|'right'} side
     * @returns {Array}
     */
    getSections(side) {
        const structure = this.getMenuStructure(side);
        return structure.sections || [];
    }

    /**
     * Encontra item por ID
     * @param {'left'|'right'} side
     * @param {string} itemId
     * @returns {Object|null}
     */
    findItem(side, itemId) {
        const sections = this.getSections(side);
        
        for (const section of sections) {
            const item = section.items.find(i => i.id === itemId);
            if (item) {
                return { ...item, sectionId: section.id };
            }
        }
        
        return null;
    }

    /**
     * Atualiza badge de um item
     * @param {'left'|'right'} side
     * @param {string} itemId
     * @param {number|string} badge
     */
    updateBadge(side, itemId, badge) {
        const structure = this.getMenuStructure(side);
        
        for (const section of structure.sections) {
            const item = section.items.find(i => i.id === itemId);
            if (item) {
                item.badge = badge;
                this.emit('badgeUpdate', { side, itemId, badge });
                break;
            }
        }
    }

    // ========================================
    // ESTADO
    // ========================================

    /**
     * Retorna estado completo
     * @returns {Object}
     */
    getState() {
        return {
            left: { ...this.state.left },
            right: { ...this.state.right }
        };
    }

    /**
     * Retorna estado de uma sidebar
     * @param {'left'|'right'} side
     * @returns {Object}
     */
    getSideState(side) {
        return { ...this.state[side] };
    }

    /**
     * Serializa para JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            left: {
                activeItem: this.state.left.activeItem,
                activeSection: this.state.left.activeSection
            },
            right: {
                activeItem: this.state.right.activeItem,
                activeSection: this.state.right.activeSection
            }
        };
    }

    /**
     * Carrega de JSON
     * @param {Object} data
     */
    fromJSON(data) {
        if (data?.left) {
            this.state.left.activeItem = data.left.activeItem;
            this.state.left.activeSection = data.left.activeSection;
        }
        if (data?.right) {
            this.state.right.activeItem = data.right.activeItem;
            this.state.right.activeSection = data.right.activeSection;
        }
    }
}
