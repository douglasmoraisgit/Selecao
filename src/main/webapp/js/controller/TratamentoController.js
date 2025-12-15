/**
 * TratamentoController.js
 * Sub-Controller - Gerencia seleção de tratamentos
 * 
 * RESPONSABILIDADES:
 * - Buscar tratamentos permitidos para uma lente/família
 * - Coordenar Model e View de tratamentos
 * - Validar seleção de tratamentos
 * - Emitir eventos para AppController
 * 
 * EVENTOS EMITIDOS:
 * - 'tratamentosCarregados'    → { tratamentos, contexto }
 * - 'selecaoConfirmada'        → { tratamentos, lente }
 * - 'selecaoCancelada'         → {}
 * - 'erroTratamentos'          → { mensagem }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class TratamentoController extends EventEmitter {
    
    constructor({ tratamentoModel, tratamentoSelectorView, apiService }) {
        super();
        
        // Dependências injetadas
        this.model = tratamentoModel;
        this.view = tratamentoSelectorView;
        this.api = apiService;
        
        // Contexto atual (lente sendo configurada)
        this.lenteAtual = null;
        this.opcoesLente = null; // { odSelecionado, oeSelecionado }
        
        // Bind de eventos
        this.bindModelEvents();
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindModelEvents() {
        // Disponíveis atualizados
        this.model.on('disponiveisAtualizados', ({ tratamentos, contexto }) => {
            this.emit('tratamentosCarregados', { tratamentos, contexto });
        });

        // Seleção alterada
        this.model.on('selecaoAlterada', ({ selecionados, valorTotal }) => {
            this.view.atualizarSelecao(selecionados);
        });

        // Erro ao remover obrigatório
        this.model.on('erroRemocao', ({ codigo, mensagem }) => {
            this.emit('erroTratamentos', { mensagem });
        });
    }

    bindViewEvents() {
        // Toggle de tratamento
        this.view.on('tratamentoToggle', ({ codigo }) => {
            this.model.toggle(codigo);
        });

        // Confirmar seleção
        this.view.on('confirmar', ({ tratamentos }) => {
            this.confirmarSelecao();
        });

        // Cancelar
        this.view.on('cancelar', () => {
            this.cancelarSelecao();
        });
    }

    // ========================================
    // FLUXO PRINCIPAL
    // ========================================

    /**
     * Inicia fluxo de seleção de tratamentos para uma lente
     * @param {Object} lente - Lente selecionada
     * @param {Object} opcoes - { odSelecionado, oeSelecionado }
     */
    async iniciarSelecao(lente, opcoes = {}) {
        this.lenteAtual = lente;
        this.opcoesLente = opcoes;
        
        try {
            // Busca tratamentos permitidos
            await this.carregarTratamentosPermitidos(lente);
            
            // Se não há tratamentos disponíveis, emite confirmação direto
            if (!this.model.temDisponiveis()) {
                console.log('Nenhum tratamento disponível para esta lente');
                this.confirmarSelecao();
                return;
            }
            
            // Mostra modal de seleção
            this.view.show(
                this.model.getDisponiveis(),
                this.model.getSelecionados(),
                {
                    descricaoLente: lente.descricao,
                    marca: lente.marca,
                    familia: lente.familia
                }
            );
            
        } catch (error) {
            console.error('Erro ao iniciar seleção de tratamentos:', error);
            this.emit('erroTratamentos', { mensagem: 'Erro ao carregar tratamentos' });
        }
    }

    /**
     * Carrega tratamentos permitidos do backend
     */
    async carregarTratamentosPermitidos(lente) {
        try {
            // Tenta buscar por lente específica
            let response = await this.api.get('/TratamentosPermitidos', {
                lenteId: lente.id || lente.codigo
            });
            
            // Se não encontrar, tenta por família
            if (!response || !response.tratamentos || response.tratamentos.length === 0) {
                response = await this.api.get('/TratamentosPermitidos', {
                    familiaId: lente.familiaId || lente.familia
                });
            }
            
            // Se não encontrar, tenta por marca
            if (!response || !response.tratamentos || response.tratamentos.length === 0) {
                response = await this.api.get('/TratamentosPermitidos', {
                    marcaId: lente.marcaId || lente.marca
                });
            }
            
            const tratamentos = response?.tratamentos || [];
            
            // Atualiza model
            this.model.setDisponiveis(tratamentos, {
                lenteId: lente.id || lente.codigo,
                familiaId: lente.familiaId,
                marcaId: lente.marcaId
            });
            
            return tratamentos;
            
        } catch (error) {
            console.error('Erro ao buscar tratamentos:', error);
            // Em caso de erro, limpa tratamentos
            this.model.limparDisponiveis();
            return [];
        }
    }

    /**
     * Confirma seleção e emite evento
     */
    confirmarSelecao() {
        const tratamentosSelecionados = this.model.getSelecionados();
        
        this.emit('selecaoConfirmada', {
            lente: this.lenteAtual,
            tratamentos: tratamentosSelecionados,
            opcoes: this.opcoesLente,
            valorTratamentos: this.model.getValorTotal()
        });
        
        // Limpa contexto
        this.lenteAtual = null;
        this.opcoesLente = null;
    }

    /**
     * Cancela seleção
     */
    cancelarSelecao() {
        this.emit('selecaoCancelada');
        
        // Limpa contexto
        this.lenteAtual = null;
        this.opcoesLente = null;
        this.model.limparSelecao();
    }

    // ========================================
    // SELEÇÃO MANUAL
    // ========================================

    /**
     * Seleciona um tratamento
     */
    selecionarTratamento(codigo) {
        return this.model.selecionar(codigo);
    }

    /**
     * Remove seleção de um tratamento
     */
    desselecionarTratamento(codigo) {
        return this.model.desselecionar(codigo);
    }

    /**
     * Alterna seleção
     */
    toggleTratamento(codigo) {
        return this.model.toggle(codigo);
    }

    /**
     * Define seleção completa
     */
    setSelecao(codigos) {
        this.model.setSelecao(codigos);
    }

    /**
     * Limpa seleção
     */
    limparSelecao() {
        this.model.limparSelecao();
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna tratamentos disponíveis
     */
    getDisponiveis() {
        return this.model.getDisponiveis();
    }

    /**
     * Retorna tratamentos selecionados
     */
    getSelecionados() {
        return this.model.getSelecionados();
    }

    /**
     * Retorna valor total dos tratamentos
     */
    getValorTotal() {
        return this.model.getValorTotal();
    }

    /**
     * Verifica se há tratamentos disponíveis
     */
    temDisponiveis() {
        return this.model.temDisponiveis();
    }

    /**
     * Verifica se há tratamentos selecionados
     */
    temSelecionados() {
        return this.model.temSelecionados();
    }

    /**
     * Exporta selecionados para envio ao backend
     */
    exportarParaBackend() {
        return this.model.toSelectedTreatmentsArray();
    }

    // ========================================
    // CACHE DE TRATAMENTOS
    // ========================================

    /**
     * Cache local de tratamentos por família (otimização)
     */
    static cache = new Map();

    async carregarComCache(lente) {
        const cacheKey = `familia_${lente.familiaId || lente.familia}`;
        
        if (TratamentoController.cache.has(cacheKey)) {
            const cached = TratamentoController.cache.get(cacheKey);
            this.model.setDisponiveis(cached.tratamentos, cached.contexto);
            return cached.tratamentos;
        }
        
        const tratamentos = await this.carregarTratamentosPermitidos(lente);
        
        if (tratamentos.length > 0) {
            TratamentoController.cache.set(cacheKey, {
                tratamentos,
                contexto: this.model.getContexto()
            });
        }
        
        return tratamentos;
    }

    /**
     * Limpa cache
     */
    static limparCache() {
        TratamentoController.cache.clear();
    }
}
