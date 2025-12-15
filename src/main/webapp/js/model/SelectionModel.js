/**
 * SelectionModel.js
 * Model - Gerencia seleções de cards (checkboxes, seleção única/múltipla)
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SelectionModel extends EventEmitter {
    
    constructor() {
        super();
        
        // Estado das seleções por grupo
        this.selections = {
            // tipoVisao: { id: 'longe', nome: 'Longe', ... }  // ÚNICA
            // configuracao: Set(['material', 'ar', ...])      // MÚLTIPLA
        };
        
        // Configuração dos grupos
        this.groupConfig = {
            tipoVisao: {
                mode: 'single',     // Uma seleção por vez
                required: true,     // Obrigatório
                label: 'Tipo de Visão',
                badge: 'ÚNICA'
            },
            material: {
                mode: 'single',
                required: false,
                label: 'Material'
            },
            configuracao: {
                mode: 'multiple',   // Múltiplas seleções
                required: false,
                label: 'Configuração',
                badge: 'MÚLTIPLA'
            },
            tratamento: {
                mode: 'multiple',
                required: false,
                label: 'Tratamentos'
            },
            indice: {
                mode: 'single',
                required: false,
                label: 'Índice de Refração'
            }
        };
    }

    // ========================================
    // SELEÇÃO
    // ========================================

    /**
     * Seleciona um item
     * @param {string} group - Nome do grupo
     * @param {Object} item - Item a selecionar { id, codigo, nome, ... }
     * @returns {boolean} - Sucesso da operação
     */
    select(group, item) {
        const config = this.getGroupConfig(group);
        
        if (config.mode === 'single') {
            // Seleção única - substitui
            const previous = this.selections[group];
            this.selections[group] = item;
            
            this.emit('select', { group, item, previous, mode: 'single' });
            
            if (previous && previous.id !== item.id) {
                this.emit('deselect', { group, item: previous });
            }
        } else {
            // Seleção múltipla - adiciona ao Set
            if (!this.selections[group]) {
                this.selections[group] = new Set();
            }
            
            this.selections[group].add(item.id || item.codigo);
            this.emit('select', { group, item, mode: 'multiple' });
        }

        this.emit('change', { group, selections: this.getSelections(group) });
        return true;
    }

    /**
     * Remove seleção de um item
     * @param {string} group - Nome do grupo
     * @param {Object|string} item - Item ou ID a remover
     */
    deselect(group, item) {
        const config = this.getGroupConfig(group);
        const itemId = typeof item === 'string' ? item : (item.id || item.codigo);
        
        if (config.mode === 'single') {
            const previous = this.selections[group];
            if (previous && (previous.id === itemId || previous.codigo === itemId)) {
                delete this.selections[group];
                this.emit('deselect', { group, item: previous });
            }
        } else {
            if (this.selections[group]) {
                this.selections[group].delete(itemId);
                this.emit('deselect', { group, item: itemId });
            }
        }

        this.emit('change', { group, selections: this.getSelections(group) });
    }

    /**
     * Toggle seleção (seleciona/deseleciona)
     * @param {string} group
     * @param {Object} item
     */
    toggle(group, item) {
        if (this.isSelected(group, item)) {
            this.deselect(group, item);
        } else {
            this.select(group, item);
        }
    }

    /**
     * Limpa seleções de um grupo
     * @param {string} group
     */
    clearGroup(group) {
        const previous = this.selections[group];
        delete this.selections[group];
        
        this.emit('clear', { group, previous });
        this.emit('change', { group, selections: null });
    }

    /**
     * Limpa todas as seleções
     */
    clearAll() {
        const previous = { ...this.selections };
        this.selections = {};
        
        this.emit('clearAll', { previous });
        this.emit('change', { group: null, selections: null });
    }

    // ========================================
    // CONSULTAS
    // ========================================

    /**
     * Verifica se item está selecionado
     * @param {string} group
     * @param {Object|string} item
     * @returns {boolean}
     */
    isSelected(group, item) {
        const config = this.getGroupConfig(group);
        const itemId = typeof item === 'string' ? item : (item.id || item.codigo);
        
        if (config.mode === 'single') {
            const selected = this.selections[group];
            return selected && (selected.id === itemId || selected.codigo === itemId);
        } else {
            return this.selections[group] && this.selections[group].has(itemId);
        }
    }

    /**
     * Retorna seleção de um grupo
     * @param {string} group
     * @returns {Object|Array|null}
     */
    getSelections(group) {
        const config = this.getGroupConfig(group);
        const selection = this.selections[group];
        
        if (!selection) return config.mode === 'multiple' ? [] : null;
        
        if (config.mode === 'single') {
            return selection;
        } else {
            return Array.from(selection);
        }
    }

    /**
     * Retorna todas as seleções
     * @returns {Object}
     */
    getAllSelections() {
        const result = {};
        
        Object.keys(this.groupConfig).forEach(group => {
            const selection = this.getSelections(group);
            if (selection && (Array.isArray(selection) ? selection.length > 0 : true)) {
                result[group] = selection;
            }
        });
        
        return result;
    }

    /**
     * Retorna contagem de seleções em um grupo
     * @param {string} group
     * @returns {number}
     */
    getCount(group) {
        const selection = this.selections[group];
        if (!selection) return 0;
        
        if (selection instanceof Set) {
            return selection.size;
        }
        return 1;
    }

    /**
     * Retorna total de seleções
     * @returns {number}
     */
    getTotalCount() {
        let total = 0;
        Object.keys(this.selections).forEach(group => {
            total += this.getCount(group);
        });
        return total;
    }

    /**
     * Verifica se grupo tem seleção
     * @param {string} group
     * @returns {boolean}
     */
    hasSelection(group) {
        return this.getCount(group) > 0;
    }

    /**
     * Valida se seleções obrigatórias estão preenchidas
     * @returns {Object} { valid: boolean, missing: string[] }
     */
    validate() {
        const missing = [];
        
        Object.entries(this.groupConfig).forEach(([group, config]) => {
            if (config.required && !this.hasSelection(group)) {
                missing.push(config.label || group);
            }
        });
        
        return {
            valid: missing.length === 0,
            missing
        };
    }

    // ========================================
    // CONFIGURAÇÃO
    // ========================================

    /**
     * Retorna configuração de um grupo
     * @param {string} group
     * @returns {Object}
     */
    getGroupConfig(group) {
        return this.groupConfig[group] || { mode: 'single', required: false };
    }

    /**
     * Define configuração de um grupo
     * @param {string} group
     * @param {Object} config
     */
    setGroupConfig(group, config) {
        this.groupConfig[group] = { ...this.getGroupConfig(group), ...config };
    }

    // ========================================
    // PARÂMETROS PARA BACKEND
    // ========================================

    /**
     * Converte seleções para parâmetros do backend
     * @returns {Object}
     */
    toParams() {
        const params = {};
        
        Object.entries(this.selections).forEach(([group, selection]) => {
            if (!selection) return;
            
            if (selection instanceof Set) {
                params[group] = Array.from(selection).join(',');
            } else if (typeof selection === 'object') {
                params[group] = selection.codigo || selection.id || selection.nome;
            }
        });
        
        return params;
    }

    /**
     * Converte para URLSearchParams
     * @returns {URLSearchParams}
     */
    toURLParams() {
        return new URLSearchParams(this.toParams());
    }

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    /**
     * Serializa para JSON
     * @returns {Object}
     */
    toJSON() {
        const data = {};
        
        Object.entries(this.selections).forEach(([group, selection]) => {
            if (selection instanceof Set) {
                data[group] = Array.from(selection);
            } else {
                data[group] = selection;
            }
        });
        
        return data;
    }

    /**
     * Carrega de JSON
     * @param {Object} data
     */
    fromJSON(data) {
        if (!data) return;
        
        Object.entries(data).forEach(([group, selection]) => {
            const config = this.getGroupConfig(group);
            
            if (config.mode === 'multiple' && Array.isArray(selection)) {
                this.selections[group] = new Set(selection);
            } else {
                this.selections[group] = selection;
            }
        });
        
        this.emit('load', this.getAllSelections());
    }
}
