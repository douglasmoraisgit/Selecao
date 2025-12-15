/**
 * config.js
 * Configurações da aplicação
 * @author OptoFreela
 */

const Config = {
    
    // ========================================
    // 🌐 ENDPOINTS DA API
    // ========================================
    
    // Contexto base da aplicação no Tomcat
    // Altere conforme o deploy: /Vendas3.0, /optofreela, etc
    CONTEXT_PATH: '',  // Deixe vazio se estiver no mesmo contexto
    
    // Endpoints dos servlets
    ENDPOINTS: {
        SELECAO_LENTES: 'SelecaoLentes',
        // Adicione outros endpoints conforme necessário
        // CLIENTES: 'Clientes',
        // ORCAMENTO: 'Orcamento',
    },
    
    // ========================================
    // 🔧 MÉTODOS HELPER
    // ========================================
    
    /**
     * Retorna URL completa do endpoint
     * @param {string} endpoint - Nome do endpoint (ex: 'SELECAO_LENTES')
     */
    getEndpoint(endpoint) {
        const path = this.ENDPOINTS[endpoint] || endpoint;
        return this.CONTEXT_PATH ? `${this.CONTEXT_PATH}/${path}` : path;
    },
    
    /**
     * Retorna URL do servlet de seleção de lentes
     */
    getSelecaoLentesUrl() {
        return this.getEndpoint('SELECAO_LENTES');
    },
    
    // ========================================
    // ⚙️ OUTRAS CONFIGURAÇÕES
    // ========================================
    
    // Timeout para requisições (ms)
    REQUEST_TIMEOUT: 30000,
    
    // Debounce para busca automática (ms)
    SEARCH_DEBOUNCE: 300,
    
    // Mostrar logs de debug
    DEBUG: true,
    
    /**
     * Log condicional
     */
    log(...args) {
        if (this.DEBUG) {
            console.log(...args);
        }
    }
};

// Congela para evitar modificações acidentais
Object.freeze(Config.ENDPOINTS);

export default Config;
