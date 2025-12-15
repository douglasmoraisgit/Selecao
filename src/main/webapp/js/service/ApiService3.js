/**
 * ApiService.js
 * Service - Comunicação com backend (Servlets)
 */

export default class ApiService {
    
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${this.baseUrl}${url}?${queryString}` : `${this.baseUrl}${url}`;
        
        return this.request(fullUrl, { method: 'GET' });
    }

    async post(url, data = {}) {
        return this.request(`${this.baseUrl}${url}`, {
            method: 'POST',
            body: new URLSearchParams(data)
        });
    }

    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...this.defaultHeaders, ...options.headers }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Métodos específicos do sistema
    async buscarProdutos(params) {
        return this.get('/api/produtos', params);
    }

    async buscarClientes(termo) {
        return this.get('/api/clientes', { termo });
    }

    async salvarOrcamento(dados) {
        return this.post('/api/orcamento', dados);
    }

    /**
     * Busca lentes no servlet SelecaoLentes
     * @param {Object} params - Parâmetros da receita e filtros
     * @returns {Promise<Object>} - Lentes agrupadas por marca/variante
     */
    async buscarLentes(params) {
        const defaultParams = {
            rod_esf: 0,
            rod_cil: 0,
            rod_eixo: 0,
            rod_adicao: 0,
            roe_esf: 0,
            roe_cil: 0,
            roe_eixo: 0,
            roe_adicao: 0,
            visao: 'longe'
        };
        
        const mergedParams = { ...defaultParams, ...params };
        return this.post('/SelecaoLentes', mergedParams);
    }
    
    /**
 * Busca tratamentos compatíveis com uma família ou vice-versa
 * @param {Object} params - { familia: 'Varilux' } ou { tratamento: 'Crizal...' }
 * @returns {Promise<Object>} - Lista de tratamentos ou famílias compatíveis
 */
    async buscarTratamentosCompativeis(params = {}) {
    return this.get('/TratamentosCompativeis', params);
    }
    
}
