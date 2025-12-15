/**
 * SearchModel.js
 * Model - Gerencia estado da busca na toolbar
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SearchModel extends EventEmitter {
    
    constructor() {
        super();
        
        // Estado da busca
        this.state = {
            query: '',
            results: [],
            loading: false,
            focused: false,
            history: [],
            suggestions: []
        };
        
        // Configurações
        this.config = {
            minLength: 2,           // Mínimo de caracteres para buscar
            debounceMs: 300,        // Delay antes de buscar
            maxHistory: 10,         // Máximo de buscas no histórico
            maxSuggestions: 5       // Máximo de sugestões
        };
        
        // Timer para debounce
        this._debounceTimer = null;
    }

    // ========================================
    // QUERY
    // ========================================

    /**
     * Define query de busca
     * @param {string} query
     * @param {boolean} [immediate=false] - Buscar imediatamente
     */
    setQuery(query, immediate = false) {
        this.state.query = query;
        this.emit('queryChange', { query });
        
        // Cancela busca anterior
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        
        // Verifica mínimo de caracteres
        if (query.length < this.config.minLength) {
            this.clearResults();
            return;
        }
        
        // Busca com debounce ou imediata
        if (immediate) {
            this.emit('search', { query });
        } else {
            this._debounceTimer = setTimeout(() => {
                this.emit('search', { query });
            }, this.config.debounceMs);
        }
    }

    /**
     * Retorna query atual
     * @returns {string}
     */
    getQuery() {
        return this.state.query;
    }

    /**
     * Limpa query
     */
    clearQuery() {
        this.state.query = '';
        this.clearResults();
        this.emit('clear');
    }

    // ========================================
    // RESULTADOS
    // ========================================

    /**
     * Define resultados da busca
     * @param {Array} results
     */
    setResults(results) {
        this.state.results = results || [];
        this.state.loading = false;
        
        this.emit('results', { 
            results: this.state.results,
            count: this.state.results.length,
            query: this.state.query
        });
    }

    /**
     * Retorna resultados
     * @returns {Array}
     */
    getResults() {
        return [...this.state.results];
    }

    /**
     * Limpa resultados
     */
    clearResults() {
        this.state.results = [];
        this.emit('resultsCleared');
    }

    /**
     * Verifica se tem resultados
     * @returns {boolean}
     */
    hasResults() {
        return this.state.results.length > 0;
    }

    /**
     * Retorna contagem de resultados
     * @returns {number}
     */
    getResultCount() {
        return this.state.results.length;
    }

    // ========================================
    // LOADING
    // ========================================

    /**
     * Define estado de loading
     * @param {boolean} loading
     */
    setLoading(loading) {
        this.state.loading = loading;
        this.emit('loading', { loading });
    }

    /**
     * Verifica se está carregando
     * @returns {boolean}
     */
    isLoading() {
        return this.state.loading;
    }

    // ========================================
    // FOCUS
    // ========================================

    /**
     * Define estado de focus
     * @param {boolean} focused
     */
    setFocused(focused) {
        this.state.focused = focused;
        this.emit('focus', { focused });
    }

    /**
     * Verifica se está focado
     * @returns {boolean}
     */
    isFocused() {
        return this.state.focused;
    }

    // ========================================
    // HISTÓRICO
    // ========================================

    /**
     * Adiciona ao histórico
     * @param {string} query
     */
    addToHistory(query) {
        if (!query || query.length < this.config.minLength) return;
        
        // Remove duplicatas
        this.state.history = this.state.history.filter(h => h !== query);
        
        // Adiciona no início
        this.state.history.unshift(query);
        
        // Limita tamanho
        if (this.state.history.length > this.config.maxHistory) {
            this.state.history = this.state.history.slice(0, this.config.maxHistory);
        }
        
        this.emit('historyUpdate', { history: this.getHistory() });
    }

    /**
     * Retorna histórico
     * @returns {Array}
     */
    getHistory() {
        return [...this.state.history];
    }

    /**
     * Limpa histórico
     */
    clearHistory() {
        this.state.history = [];
        this.emit('historyUpdate', { history: [] });
    }

    // ========================================
    // SUGESTÕES
    // ========================================

    /**
     * Define sugestões
     * @param {Array} suggestions
     */
    setSuggestions(suggestions) {
        this.state.suggestions = (suggestions || []).slice(0, this.config.maxSuggestions);
        this.emit('suggestions', { suggestions: this.getSuggestions() });
    }

    /**
     * Retorna sugestões
     * @returns {Array}
     */
    getSuggestions() {
        return [...this.state.suggestions];
    }

    /**
     * Gera sugestões baseadas na query
     * @param {Array} allItems - Todos os itens disponíveis
     */
    generateSuggestions(allItems) {
        const query = this.state.query.toLowerCase();
        
        if (!query || query.length < this.config.minLength) {
            this.setSuggestions([]);
            return;
        }
        
        const suggestions = allItems
            .filter(item => {
                const text = (item.nome || item.title || item.text || '').toLowerCase();
                return text.includes(query);
            })
            .slice(0, this.config.maxSuggestions);
        
        this.setSuggestions(suggestions);
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
            query: this.state.query,
            results: this.getResults(),
            loading: this.state.loading,
            focused: this.state.focused,
            hasResults: this.hasResults(),
            resultCount: this.getResultCount()
        };
    }

    /**
     * Reset estado
     */
    reset() {
        this.clearQuery();
        this.clearResults();
        this.state.loading = false;
        this.state.focused = false;
        this.emit('reset');
    }

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    /**
     * Serializa para JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            history: this.state.history
        };
    }

    /**
     * Carrega de JSON
     * @param {Object} data
     */
    fromJSON(data) {
        if (data?.history) {
            this.state.history = data.history.slice(0, this.config.maxHistory);
        }
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchModel;
}
