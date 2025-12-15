/**
 * NavigationModel.js
 * Model - Gerencia estado de navegação hierárquica (breadcrumbs, nível atual, histórico)
 */

import EventEmitter from '../util/EventEmitter.js';
import navigationStructure from '../data/navigationStructure.js';

export default class NavigationModel extends EventEmitter {
    
    constructor(structure = null) {
        super();
        
        // Estrutura de navegação hierárquica
        this.structure = structure || navigationStructure;
        
        // Estado inicial
        this.state = {
            currentNode: this.structure,    // Nó atual na árvore
            breadcrumbs: [],                // Stack de navegação [{node, index}]
            params: {}                      // Parâmetros acumulados para backend
        };
    }
    
    /**
     * Define estrutura de navegação
     * @param {Object} structure
     */
    setStructure(structure) {
        this.structure = structure;
        this.reset();
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna nó atual
     * @returns {Object}
     */
    getCurrentNode() {
        return this.state.currentNode;
    }

    /**
     * Retorna children do nó atual
     * @returns {Array}
     */
    getChildren() {
        return this.state.currentNode?.children || [];
    }

    /**
     * Retorna tipo do nó atual
     * @returns {string}
     */
    getCurrentType() {
        return this.state.currentNode?.type || 'root';
    }

    /**
     * Retorna título do nó atual
     * @returns {string}
     */
    getCurrentTitle() {
        return this.state.currentNode?.title || this.state.currentNode?.label || '';
    }

    /**
     * Retorna label do nó atual (para breadcrumb)
     * @returns {string}
     */
    getCurrentLabel() {
        return this.state.currentNode?.label || this.getCurrentTitle();
    }

    /**
     * Retorna ícone do nó atual
     * @returns {string}
     */
    getCurrentIcon() {
        return this.state.currentNode?.icon || '📦';
    }

    /**
     * Retorna breadcrumbs (excluindo o root)
     * @returns {Array}
     */
    getBreadcrumbs() {
        return this.state.breadcrumbs
            .map((b, idx) => ({
                id: b.node.id,
                label: b.node.label || b.node.title,
                icon: b.node.icon,
                type: b.node.type,
                originalIndex: idx // Índice original no array interno
            }))
            .filter(b => b.type !== 'root'); // Nunca inclui o root
    }

    /**
     * Retorna parâmetros acumulados
     * @returns {Object}
     */
    getParams() {
        return { ...this.state.params };
    }

    /**
     * Verifica se está no root
     * @returns {boolean}
     */
    isRoot() {
        return this.state.currentNode?.type === 'root' || this.state.breadcrumbs.length === 0;
    }

    /**
     * Verifica se está em produto (folha)
     * @returns {boolean}
     */
    isProduct() {
        return this.state.currentNode?.type === 'product';
    }

    /**
     * Verifica se tem filhos (pode navegar)
     * @returns {boolean}
     */
    hasChildren() {
        return this.getChildren().length > 0;
    }

    /**
     * Verifica se pode voltar
     * @returns {boolean}
     */
    canGoBack() {
        return this.state.breadcrumbs.length > 0;
    }

    // ========================================
    // AÇÕES DE NAVEGAÇÃO
    // ========================================

    /**
     * Navega para um filho (entra no item)
     * @param {string|Object} child - ID do filho ou objeto filho
     */
    navigateTo(child) {
        let targetNode;
        
        // Se passou ID, busca o nó filho
        if (typeof child === 'string') {
            targetNode = this.getChildren().find(c => c.id === child);
        } else {
            targetNode = child;
        }
        
        if (!targetNode) {
            console.warn('Nó filho não encontrado:', child);
            return false;
        }
        
        // Salva nó atual no breadcrumb
        this.state.breadcrumbs.push({
            node: this.state.currentNode,
            index: this.state.breadcrumbs.length
        });
        
        // Adiciona parâmetro baseado no tipo
        this.addParam(targetNode);
        
        // Move para o filho
        this.state.currentNode = targetNode;
        
        // Emite eventos
        this.emit('navigate', {
            node: targetNode,
            type: targetNode.type,
            breadcrumbs: this.getBreadcrumbs(),
            params: this.getParams(),
            hasChildren: this.hasChildren()
        });
        
        this.emit('change', this.getState());
        
        return true;
    }

    /**
     * Adiciona parâmetro baseado no tipo do nó
     * @param {Object} node
     */
    addParam(node) {
        const typeToParam = {
            category: 'tipoVisao',
            subcategory: 'subcategoria',
            filter: 'filtro',
            brand: 'marca',
            family: 'familia',
            product: 'produto',
            // Configurações
            config: 'configTipo',
            'config-option': 'configOpcao',
            'config-value': 'configValor'
        };
        
        const paramKey = typeToParam[node.type];
        if (paramKey) {
            this.state.params[paramKey] = node.id;
            
            // Para configurações, também salva o label
            if (node.type === 'config' || node.type === 'config-option' || node.type === 'config-value') {
                this.state.params[paramKey + 'Label'] = node.label;
            }
        }
    }

    /**
     * Remove parâmetro baseado no tipo do nó
     * @param {Object} node
     */
    removeParam(node) {
        const typeToParam = {
            category: 'tipoVisao',
            subcategory: 'subcategoria',
            filter: 'filtro',
            brand: 'marca',
            family: 'familia',
            product: 'produto',
            // Configurações
            config: 'configTipo',
            'config-option': 'configOpcao',
            'config-value': 'configValor'
        };
        
        const paramKey = typeToParam[node.type];
        if (paramKey) {
            delete this.state.params[paramKey];
            delete this.state.params[paramKey + 'Label'];
        }
    }

    /**
     * Volta um nível
     */
    goBack() {
        if (!this.canGoBack()) {
            console.warn('Não é possível voltar');
            return false;
        }
        
        // Remove parâmetro do nó atual
        this.removeParam(this.state.currentNode);
        
        // Restaura nó anterior
        const previous = this.state.breadcrumbs.pop();
        this.state.currentNode = previous.node;
        
        // Emite eventos
        this.emit('back', {
            node: this.state.currentNode,
            type: this.state.currentNode.type
        });
        
        this.emit('change', this.getState());
        
        return true;
    }

    /**
     * Vai para um nível específico do breadcrumb
     * @param {number} index - Índice do breadcrumb (índice original no array interno)
     */
    goToLevel(index) {
        // Se índice inválido ou 0 (root), vai para home
        if (index <= 0 || index >= this.state.breadcrumbs.length) {
            this.goHome();
            return;
        }
        
        // Remove parâmetro do nó atual
        this.removeParam(this.state.currentNode);
        
        // Remove todos os breadcrumbs APÓS o índice clicado
        while (this.state.breadcrumbs.length > index + 1) {
            const removed = this.state.breadcrumbs.pop();
            this.removeParam(removed.node);
        }
        
        // O item no índice clicado é o novo currentNode
        // Ele sai dos breadcrumbs e vira o nó atual
        const target = this.state.breadcrumbs.pop();
        if (target) {
            this.state.currentNode = target.node;
        } else {
            this.state.currentNode = this.structure;
        }
        
        this.emit('jump', {
            node: this.state.currentNode,
            index: index
        });
        
        this.emit('change', this.getState());
    }

    /**
     * Vai para o root
     */
    goHome() {
        // Limpa parâmetros
        this.state.params = {};
        this.state.breadcrumbs = [];
        this.state.currentNode = this.structure;
        
        this.emit('home');
        this.emit('change', this.getState());
    }
    
    /**
     * Vai para o root SEM emitir evento home (não limpa filtros)
     */
    goToRoot() {
        // Limpa parâmetros e breadcrumbs, mas NÃO emite 'home'
        this.state.params = {};
        this.state.breadcrumbs = [];
        this.state.currentNode = this.structure;
        
        // Apenas emite 'change' para atualizar UI
        this.emit('change', this.getState());
    }

    /**
     * Reseta navegação
     */
    reset() {
        this.state = {
            currentNode: this.structure,
            breadcrumbs: [],
            params: {}
        };
        this.emit('reset');
    }

    // ========================================
    // BUSCA NA ÁRVORE
    // ========================================

    /**
     * Busca nó por ID em toda a árvore
     * @param {string} id
     * @param {Object} [node] - Nó inicial (default: root)
     * @returns {Object|null}
     */
    findNodeById(id, node = this.structure) {
        if (node.id === id) return node;
        
        if (node.children) {
            for (const child of node.children) {
                const found = this.findNodeById(id, child);
                if (found) return found;
            }
        }
        
        return null;
    }

    /**
     * Busca nós por tipo
     * @param {string} type - category, brand, family, product
     * @param {Object} [node] - Nó inicial
     * @returns {Array}
     */
    findNodesByType(type, node = this.structure) {
        const results = [];
        
        if (node.type === type) {
            results.push(node);
        }
        
        if (node.children) {
            for (const child of node.children) {
                results.push(...this.findNodesByType(type, child));
            }
        }
        
        return results;
    }

    /**
     * Retorna caminho até um nó
     * @param {string} id
     * @param {Object} [node]
     * @param {Array} [path]
     * @returns {Array|null}
     */
    getPathTo(id, node = this.structure, path = []) {
        const currentPath = [...path, node];
        
        if (node.id === id) return currentPath;
        
        if (node.children) {
            for (const child of node.children) {
                const found = this.getPathTo(id, child, currentPath);
                if (found) return found;
            }
        }
        
        return null;
    }

    /**
     * Navega diretamente para um nó por ID
     * @param {string} id
     */
    navigateToId(id) {
        const path = this.getPathTo(id);
        
        if (!path) {
            console.warn('Nó não encontrado:', id);
            return false;
        }
        
        // Reset e navega pelo caminho
        this.goHome();
        
        // Navega por cada nó do caminho (exceto root e o próprio nó)
        for (let i = 1; i < path.length; i++) {
            this.navigateTo(path[i]);
        }
        
        return true;
    }

    // ========================================
    // ESTADO
    // ========================================

    /**
     * Retorna estado completo
     * @returns {Object}
     */
    getState() {
        const node = this.state.currentNode || {};
        return {
            currentNode: node,
            id: node.id,
            type: node.type,
            label: node.label,
            title: node.title,
            icon: node.icon,
            description: node.description,
            children: this.getChildren(),
            hasChildren: this.hasChildren(),
            isRoot: this.isRoot(),
            isProduct: this.isProduct(),
            breadcrumbs: this.getBreadcrumbs(),
            params: this.getParams(),
            canGoBack: this.canGoBack()
        };
    }

    /**
     * Carrega estado salvo
     * @param {Object} savedState
     */
    loadState(savedState) {
        if (savedState && savedState.nodeId) {
            this.navigateToId(savedState.nodeId);
        }
    }

    /**
     * Serializa estado para salvar
     * @returns {Object}
     */
    toJSON() {
        return {
            nodeId: this.state.currentNode?.id,
            params: this.state.params
        };
    }

    /**
     * Converte filhos atuais para formato de cards
     * @returns {Array}
     */
    getChildrenAsCards() {
        return this.getChildren().map(child => ({
            id: child.id,
            icon: child.icon,
            title: child.label || child.title,
            description: child.description || '',
            badge: child.badge,
            type: child.type,
            hasChildren: Array.isArray(child.children) && child.children.length > 0,
            corImagem: child.corImagem,  // ✅ NOVO
            corHex: child.corHex         // ✅ NOVO
        }));
    }
}
