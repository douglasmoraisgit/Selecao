/**
 * CaixaModel.js
 * Gerencia o estado e dados do módulo de Caixa
 * 
 * Responsabilidades:
 * - Armazenar vendas pendentes de recebimento
 * - Gerenciar detalhes de pagamentos por venda
 * - Calcular totalizadores
 * - Persistir dados relevantes em localStorage
 */

// ✅ Usa o EventEmitter do projeto existente
import EventEmitter from '../util/EventEmitter.js';

export class CaixaModel extends EventEmitter {
    constructor() {
        super();
        
        // Estado principal
        this.state = {
            operador: null,
            loja: null,
            dataSelecionada: this._getToday(),
            
            // Vendas
            vendasPendentes: [],
            vendaSelecionada: null,
            
            // Pagamentos da venda selecionada
            pagamentos: [],
            
            // Totalizadores
            totais: {
                quantidadePendentes: 0,
                valorPendente: 0,
                valorRecebido: 0,
                porFormaPagamento: {
                    dinheiro: 0,
                    pix: 0,
                    debito: 0,
                    credito: 0,
                    convenio: 0
                }
            },
            
            // UI State
            loading: false,
            error: null
        };
    }

    // ===========================================
    // GETTERS
    // ===========================================
    
    getState() {
        return { ...this.state };
    }
    
    getVendasPendentes() {
        return [...this.state.vendasPendentes];
    }
    
    /**
     * Busca uma venda pelo ID
     * @param {number|string} idVenda - ID da venda
     * @returns {Object|null} - Venda encontrada ou null
     */
    getVendaById(idVenda) {
        const id = parseInt(idVenda);
        return this.state.vendasPendentes.find(v => 
            parseInt(v.idVenda) === id || 
            parseInt(v.id) === id || 
            parseInt(v.idPedido) === id
        ) || null;
    }
    
    getVendaSelecionada() {
        return this.state.vendaSelecionada;
    }
    
    getPagamentos() {
        return [...this.state.pagamentos];
    }
    
    getTotais() {
        return { ...this.state.totais };
    }
    
    getOperador() {
        return this.state.operador;
    }
    
    getLoja() {
        return this.state.loja;
    }
    
    getDataSelecionada() {
        return this.state.dataSelecionada;
    }
    
    isLoading() {
        return this.state.loading;
    }

    // ===========================================
    // SETTERS / MUTATIONS
    // ===========================================
    
    setOperador(operador) {
        this.state.operador = operador;
        this._saveToStorage();
        this.emit('operadorChanged', operador);
    }
    
    setLoja(loja) {
        this.state.loja = loja;
        this._saveToStorage();
        this.emit('lojaChanged', loja);
    }
    
    setDataSelecionada(data) {
        this.state.dataSelecionada = data;
        this.emit('dataChanged', data);
    }
    
    setLoading(loading) {
        this.state.loading = loading;
        this.emit('loadingChanged', loading);
    }
    
    setError(error) {
        this.state.error = error;
        this.emit('errorChanged', error);
    }
    
    // ===========================================
    // VENDAS
    // ===========================================
    
    /**
     * Define a lista de vendas pendentes
     * @param {Array} vendas - Lista de vendas do servidor
     */
    setVendasPendentes(vendas) {
        this.state.vendasPendentes = vendas.map(v => this._normalizeVenda(v));
        this._calcularTotais();
        this.emit('vendasChanged', this.state.vendasPendentes);
    }
    
    /**
     * Seleciona uma venda para ver detalhes
     * @param {Object} venda - Venda selecionada
     */
    selecionarVenda(venda) {
        this.state.vendaSelecionada = venda;
        this.state.pagamentos = [];
        this.emit('vendaSelecionada', venda);
    }
    
    /**
     * Limpa a venda selecionada
     */
    limparSelecao() {
        this.state.vendaSelecionada = null;
        this.state.pagamentos = [];
        this.emit('selecaoLimpa');
    }
    
    /**
     * Define os pagamentos da venda selecionada
     * @param {Array} pagamentos - Lista de formas de pagamento
     */
    setPagamentos(pagamentos) {
        this.state.pagamentos = pagamentos.map(p => this._normalizePagamento(p));
        this.emit('pagamentosChanged', this.state.pagamentos);
    }
    
    /**
     * Atualiza o status de um pagamento específico
     * @param {number} idFormaPagamento - ID do pagamento
     * @param {string} novoStatus - Novo status (aprovado, pendente)
     * @param {string} numeroAutorizacao - Número de autorização (para convênio)
     */
    atualizarStatusPagamento(idFormaPagamento, novoStatus, numeroAutorizacao = null) {
        const pagamento = this.state.pagamentos.find(p => p.idFormaPagamento === idFormaPagamento);
        
        if (pagamento) {
            pagamento.statusPagamento = novoStatus;
            if (numeroAutorizacao) {
                pagamento.numeroAutorizacao = numeroAutorizacao;
            }
            
            this.emit('pagamentoAtualizado', pagamento);
            this._verificarTodosPagamentosAprovados();
        }
    }
    
    /**
     * Remove uma venda da lista de pendentes (após confirmação completa)
     * @param {number} idVenda - ID da venda
     */
    removerVendaPendente(idVenda) {
        const index = this.state.vendasPendentes.findIndex(v => v.idVenda === idVenda || v.idPedido === idVenda);
        
        if (index !== -1) {
            const vendaRemovida = this.state.vendasPendentes.splice(index, 1)[0];
            this._calcularTotais();
            this.emit('vendaRemovida', vendaRemovida);
            this.emit('vendasChanged', this.state.vendasPendentes);
        }
    }

    // ===========================================
    // CÁLCULOS E TOTALIZADORES
    // ===========================================
    
    _calcularTotais() {
        const vendas = this.state.vendasPendentes;
        
        // Resetar totais
        const totais = {
            quantidadePendentes: vendas.length,
            valorPendente: 0,
            valorRecebido: 0,
            porFormaPagamento: {
                dinheiro: 0,
                pix: 0,
                debito: 0,
                credito: 0,
                convenio: 0
            }
        };
        
        vendas.forEach(venda => {
            if (venda.statusPagamento === 'pendente' || venda.statusPagamento === 'Pendente') {
                totais.valorPendente += venda.valorTotal || 0;
            } else {
                totais.valorRecebido += venda.valorTotal || 0;
            }
        });
        
        this.state.totais = totais;
        this.emit('totaisChanged', totais);
    }
    
    /**
     * Verifica se todos os pagamentos da venda selecionada foram aprovados
     */
    _verificarTodosPagamentosAprovados() {
        const pagamentos = this.state.pagamentos;
        const todosAprovados = pagamentos.every(p => 
            p.statusPagamento?.toLowerCase() === 'aprovado'
        );
        
        if (todosAprovados && pagamentos.length > 0) {
            this.emit('todosPagamentosAprovados', this.state.vendaSelecionada);
        }
    }
    
    /**
     * Calcula progresso de aprovação dos pagamentos
     * @returns {Object} { aprovados, total, percentual }
     */
    getProgressoAprovacao() {
        const pagamentos = this.state.pagamentos;
        const total = pagamentos.length;
        const aprovados = pagamentos.filter(p => 
            p.statusPagamento?.toLowerCase() === 'aprovado'
        ).length;
        
        return {
            aprovados,
            total,
            percentual: total > 0 ? Math.round((aprovados / total) * 100) : 0
        };
    }

    // ===========================================
    // NORMALIZAÇÃO DE DADOS
    // ===========================================
    
    _normalizeVenda(venda) {
        return {
            idVenda: venda.idVenda || venda.id,
            idPedido: venda.idPedido || venda.id_pedido,
            idLoja: venda.idLoja || venda.id_loja,
            cliente: venda.cliente || venda.nomeCliente || 'Cliente não informado',
            idCliente: venda.idCliente || venda.id_cliente,
            vendedor: venda.vendedor || venda.nomeVendedor || 'Vendedor não informado',
            valorTotal: parseFloat(venda.valorTotal || venda.total || 0),
            data: venda.data || venda.dataVenda,
            hora: venda.horaFormatada || this._formatHora(venda.data),
            statusPagamento: venda.statusPagamento || venda.status_pagamento || 'pendente',
            formasPagamento: venda.formasPagamento || []
        };
    }
    
    _normalizePagamento(pagamento) {
        return {
            idFormaPagamento: pagamento.idFormaPagamento || pagamento.id || pagamento.idForma_pagamento,
            tipoPagamento: pagamento.tipoPagamento || pagamento.tipo_pagamento || 'Não informado',
            valor: parseFloat(pagamento.valor || 0),
            bandeira: pagamento.bandeira || '',
            parcelas: pagamento.parcelas || 1,
            statusPagamento: pagamento.statusPagamento || pagamento.status_pagamento || 'pendente',
            numeroAutorizacao: pagamento.numeroAutorizacao || null
        };
    }

    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    _getToday() {
        return new Date().toISOString().split('T')[0];
    }
    
    _formatHora(dataString) {
        if (!dataString) return '';
        try {
            const data = new Date(dataString);
            return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }
    
    // ===========================================
    // PERSISTÊNCIA LOCAL
    // ===========================================
    
    _saveToStorage() {
        const dataToSave = {
            operador: this.state.operador,
            loja: this.state.loja
        };
        localStorage.setItem('caixa_config', JSON.stringify(dataToSave));
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('caixa_config');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.operador = data.operador || null;
                this.state.loja = data.loja || null;
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações do caixa:', e);
        }
    }
    
    // ===========================================
    // HELPERS PARA TIPOS DE PAGAMENTO
    // ===========================================
    
    /**
     * Verifica se um tipo de pagamento é convênio
     * @param {string} tipo - Tipo de pagamento
     * @returns {boolean}
     */
    isConvenio(tipo) {
        if (!tipo) return false;
        const tipoLower = tipo.toLowerCase();
        const palavrasConvenio = ['convênio', 'convenio', 'convencio', 'rhotoplas', 'rhoto'];
        return palavrasConvenio.some(p => tipoLower.includes(p));
    }
    
    /**
     * Retorna ícone e cor para cada tipo de pagamento
     * @param {string} tipo - Tipo de pagamento
     * @returns {Object} { icone, cor, classe }
     */
    getInfoTipoPagamento(tipo) {
        if (!tipo) return { icone: '💳', cor: '#6c757d', classe: 'outro' };
        
        const tipoLower = tipo.toLowerCase();
        
        if (tipoLower.includes('dinheiro')) {
            return { icone: '💵', cor: '#28a745', classe: 'dinheiro' };
        }
        if (tipoLower.includes('pix')) {
            return { icone: '📱', cor: '#00b894', classe: 'pix' };
        }
        if (tipoLower.includes('débito') || tipoLower.includes('debito')) {
            return { icone: '💳', cor: '#0984e3', classe: 'debito' };
        }
        if (tipoLower.includes('crédito') || tipoLower.includes('credito')) {
            return { icone: '💳', cor: '#6c5ce7', classe: 'credito' };
        }
        if (this.isConvenio(tipo)) {
            return { icone: '🏢', cor: '#00cec9', classe: 'convenio' };
        }
        
        return { icone: '💳', cor: '#6c757d', classe: 'outro' };
    }
}
