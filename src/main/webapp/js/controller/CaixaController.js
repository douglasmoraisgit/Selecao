/**
 * CaixaController.js
 * Coordena a comunicação entre CaixaModel, CaixaView e CaixaService
 * 
 * Responsabilidades:
 * - Inicializar o módulo de Caixa
 * - Orquestrar fluxo de dados
 * - Gerenciar eventos entre componentes
 * - Tratar erros e feedback ao usuário
 */

// ✅ Usa o EventEmitter do projeto existente
import EventEmitter from '../util/EventEmitter.js';
import { CaixaModel } from '../model/CaixaModel.js';
import { CaixaView } from '../view/CaixaView.js';
import { CaixaService } from '../service/CaixaService.js';

export class CaixaController extends EventEmitter {
    constructor() {
        super();
        
        this.model = new CaixaModel();
        this.view = new CaixaView();
        this.service = new CaixaService();
        
        // Dados temporários para operações em andamento
        this._vendaEmProcessamento = null;
        this._pagamentosEmProcessamento = [];
        
        // Aba atual (pendentes ou recebidas)
        this._currentTab = 'pendentes';
    }

    // ===========================================
    // INICIALIZAÇÃO
    // ===========================================
    
    /**
     * Inicializa o módulo de Caixa
     * @param {string} containerId - ID do elemento container
     * @param {Object} config - Configurações iniciais (operador, loja)
     */
    async init(containerId, config = {}) {
        console.log('🚀 Inicializando CaixaController...');
        
        // ✅ Primeiro: Buscar dados da sessão do servidor
        const sessaoData = await this._carregarSessao();
        
        if (!sessaoData || !sessaoData.logado) {
            console.warn('⚠️ Usuário não autenticado - redirecionando para login');
            window.location.href = 'login.html?error=session';
            return;
        }
        
        // Aplicar dados da sessão
        if (sessaoData.usuario) {
            this.model.setOperador(sessaoData.usuario.nome);
        }
        if (sessaoData.loja) {
            this.model.setLoja(sessaoData.loja.nome);
            this.model.state.idLoja = sessaoData.loja.id;
        }
        if (sessaoData.perfil) {
            this.model.state.perfil = sessaoData.perfil.nome;
        }
        
        // Carregar configurações salvas (fallback)
        this.model.loadFromStorage();
        
        // Aplicar configurações passadas (override)
        if (config.operador) {
            this.model.setOperador(config.operador);
        }
        if (config.loja) {
            this.model.setLoja(config.loja);
        }
        if (config.idLoja) {
            this.model.state.idLoja = config.idLoja;
        }
        
        // Inicializar View
        this.view.init(containerId);
        
        // Configurar bindings
        this._bindModelEvents();
        this._bindViewEvents();
        
        // Atualizar UI inicial
        this._updateUI();
        
        // Carregar dados iniciais
        await this.carregarVendas();
        
        console.log('✅ CaixaController inicializado');
        console.log('👤 Operador:', this.model.getOperador());
        console.log('🏪 Loja:', this.model.getLoja());
    }
    
    /**
     * Carrega dados da sessão do servidor
     * @returns {Promise<Object>} Dados da sessão
     */
    async _carregarSessao() {
        try {
            const response = await fetch('SessionServlet', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error('Erro ao buscar sessão:', response.status);
                return null;
            }
            
            const data = await response.json();
            console.log('📋 Dados da sessão:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Erro ao carregar sessão:', error);
            return null;
        }
    }
    
    _bindModelEvents() {
        // Quando vendas mudam
        this.model.on('vendasChanged', (vendas) => {
            this.view.renderVendas(vendas);
        });
        
        // Quando totais mudam
        this.model.on('totaisChanged', (totais) => {
            this.view.updateTotais(totais);
        });
        
        // NOTA: Removido listener 'pagamentosChanged' para evitar renderização dupla
        // O showModal() já chama renderPagamentos() internamente
        
        // Quando um pagamento é atualizado
        this.model.on('pagamentoAtualizado', (pagamento) => {
            const index = this._pagamentosEmProcessamento.findIndex(
                p => p.idFormaPagamento === pagamento.idFormaPagamento
            );
            if (index !== -1) {
                this.view.updatePagamentoAprovado(index);
            }
        });
        
        // NOTA: Não usamos mais o evento todosPagamentosAprovados
        // O aprovarPagamento já trata tudo quando recebe todosConfirmados do servidor
        
        // Loading
        this.model.on('loadingChanged', (loading) => {
            if (loading) {
                this.view.showSpinner();
            } else {
                this.view.hideSpinner();
            }
        });
    }
    
    _bindViewEvents() {
        // Refresh
        this.view.on('refresh', () => {
            this.carregarVendas();
        });
        
        // Venda selecionada
        this.view.on('vendaSelected', async (idVenda) => {
            await this.abrirDetalhesVenda(idVenda);
        });
        
        // Aprovar pagamento
        this.view.on('aprovarPagamento', async ({ index, numeroAutorizacao }) => {
            await this.aprovarPagamento(index, numeroAutorizacao);
        });
        
        // Modal fechado
        this.view.on('modalClosed', () => {
            this._vendaEmProcessamento = null;
            this._pagamentosEmProcessamento = [];
            this.model.limparSelecao();
        });
        
        // Mudança de aba
        this.view.on('tabChanged', async (tab) => {
            console.log(`📑 Aba alterada para: ${tab}`);
            this._currentTab = tab;
            await this.carregarVendas();
        });
    }
    
    _updateUI() {
        const state = this.model.getState();
        
        this.view.updateOperadorInfo(state.operador, state.loja?.nome || state.loja);
        this.view.updateDataAtual(state.dataSelecionada);
        this.view.updateTotais(state.totais);
    }

    // ===========================================
    // CARREGAMENTO DE DADOS
    // ===========================================
    
    /**
     * Carrega as vendas de acordo com a aba selecionada
     */
    async carregarVendas() {
        const data = this.model.getDataSelecionada();
        const idLoja = this.model.state.idLoja || 1;
        const tab = this._currentTab || 'pendentes';
        
        this.view.showLoading();
        
        try {
            const vendas = await this.service.buscarVendasPendentes(data, idLoja);
            
            // Separar vendas pendentes e recebidas
            const vendasPendentes = vendas.filter(v => {
                const status = (v.statusPagamento || v.status_pagamento || '').toLowerCase();
                return status !== 'pago' && status !== 'aprovado';
            });
            
            const vendasRecebidas = vendas.filter(v => {
                const status = (v.statusPagamento || v.status_pagamento || '').toLowerCase();
                return status === 'pago' || status === 'aprovado';
            });
            
            // Atualizar contadores das abas
            this.view.updateTabCounts(vendasPendentes.length, vendasRecebidas.length);
            
            // Mostrar vendas conforme aba selecionada
            let vendasFiltradas;
            if (tab === 'pendentes') {
                vendasFiltradas = vendasPendentes;
                console.log(`📋 ${vendasFiltradas.length} vendas pendentes carregadas`);
            } else {
                vendasFiltradas = vendasRecebidas;
                console.log(`✅ ${vendasFiltradas.length} vendas recebidas carregadas`);
            }
            
            this.model.setVendasPendentes(vendasFiltradas);
            
        } catch (error) {
            console.error('❌ Erro ao carregar vendas:', error);
            this.view.hideLoading();
            this.view.showToast('Erro ao carregar vendas. Tente novamente.', 'error');
            
            // Em caso de erro, usar dados mockados para desenvolvimento
            if (this._isDevMode()) {
                this._loadMockData();
            }
        }
    }
    
    /**
     * Abre os detalhes de uma venda específica
     * @param {number} idVenda - ID da venda
     */
    async abrirDetalhesVenda(idVenda) {
        this.model.setLoading(true);
        
        try {
            // Buscar dados da venda que já estão no model
            const vendaDoModel = this.model.getVendaById(idVenda);
            
            if (!vendaDoModel) {
                throw new Error('Venda não encontrada');
            }
            
            // Buscar pagamentos do servlet
            const dados = await this.service.buscarPagamentosVenda(idVenda);
            
            // Usar dados da venda do model (já carregados)
            const venda = {
                idVenda: vendaDoModel.idVenda,
                idPedido: vendaDoModel.idPedido,
                cliente: vendaDoModel.cliente || 'Cliente não informado',
                vendedor: vendaDoModel.vendedor || 'Vendedor não informado',
                valorTotal: parseFloat(vendaDoModel.valorTotal || 0)
            };
            
            const pagamentos = dados.pagamentos || [];
            
            console.log('📋 Venda:', venda);
            console.log('💳 Pagamentos:', pagamentos);
            
            // Guardar referência
            this._vendaEmProcessamento = venda;
            this._pagamentosEmProcessamento = pagamentos;
            
            // Atualizar model e exibir modal
            this.model.selecionarVenda(venda);
            this.model.setPagamentos(pagamentos);
            
            this.view.showModal(venda, pagamentos);
            
        } catch (error) {
            console.error('❌ Erro ao buscar detalhes da venda:', error);
            this.view.showToast('Erro ao carregar detalhes da venda.', 'error');
        } finally {
            this.model.setLoading(false);
        }
    }

    // ===========================================
    // APROVAÇÃO DE PAGAMENTOS
    // ===========================================
    
    /**
     * Aprova um pagamento individual
     * @param {number} index - Índice do pagamento na lista
     * @param {string} numeroAutorizacao - Número de autorização (para convênio)
     */
    async aprovarPagamento(index, numeroAutorizacao = null) {
        const pagamento = this._pagamentosEmProcessamento[index];
        
        if (!pagamento) {
            console.error('Pagamento não encontrado no índice:', index);
            return;
        }
        
        if (!this._vendaEmProcessamento) {
            console.error('Nenhuma venda em processamento');
            return;
        }
        
        this.model.setLoading(true);
        
        try {
            // Chamar API para confirmar pagamento
            const resultado = await this.service.aprovarPagamento(
                this._vendaEmProcessamento.idPedido,
                pagamento.id || pagamento.idFormaPagamento,
                numeroAutorizacao
            );
            
            // Atualizar no model
            this.model.atualizarStatusPagamento(
                pagamento.id || pagamento.idFormaPagamento,
                'aprovado',
                numeroAutorizacao
            );
            
            // Atualizar referência local
            this._pagamentosEmProcessamento[index].statusPagamento = 'aprovado';
            if (numeroAutorizacao) {
                this._pagamentosEmProcessamento[index].numeroAutorizacao = numeroAutorizacao;
            }
            
            // Atualizar UI
            this.view.updatePagamentoAprovado(index);
            this.view.showToast('Pagamento confirmado!', 'success');
            
            // Verificar se todos foram confirmados (resposta do servidor)
            if (resultado.todosConfirmados) {
                console.log('🎉 Todos pagamentos confirmados! Venda finalizada.');
                
                // Aguardar um pouco para o usuário ver a mensagem
                setTimeout(() => {
                    // Fechar modal
                    this.view.hideModal();
                    
                    // Remover venda da lista de pendentes
                    this.model.removerVendaPendente(this._vendaEmProcessamento.idVenda);
                    
                    // Limpar referências
                    this._vendaEmProcessamento = null;
                    this._pagamentosEmProcessamento = [];
                    
                    this.view.showToast('✅ Venda finalizada com sucesso!', 'success');
                    
                    // Recarregar lista de vendas
                    this.carregarVendas();
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Erro ao confirmar pagamento:', error);
            this.view.showToast('Erro ao confirmar pagamento: ' + error.message, 'error');
        } finally {
            this.model.setLoading(false);
        }
    }
    
    /**
     * Finaliza o recebimento de uma venda (todos pagamentos aprovados)
     * NOTA: O ConfirmarPagamentoServlet já atualizou o status da venda
     * @param {Object} venda - Venda finalizada
     */
    async _finalizarRecebimento(venda) {
        try {
            // O status já foi atualizado pelo ConfirmarPagamentoServlet
            // Aqui apenas fazemos as ações de UI
            
            // Fechar modal
            this.view.hideModal();
            
            // Remover venda da lista de pendentes
            this.model.removerVendaPendente(venda.idVenda);
            
            // Feedback
            this.view.showToast(`✅ Recebimento da venda #${venda.idPedido} concluído!`, 'success');
            
            // Limpar referências
            this._vendaEmProcessamento = null;
            this._pagamentosEmProcessamento = [];
            
            // Recarregar lista
            await this.carregarVendas();
            
        } catch (error) {
            console.error('❌ Erro ao finalizar recebimento:', error);
            this.view.showToast('Erro ao finalizar recebimento: ' + error.message, 'error');
        }
    }

    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    /**
     * Define a data para consulta
     * @param {string} data - Data no formato YYYY-MM-DD
     */
    setData(data) {
        this.model.setDataSelecionada(data);
        this.view.updateDataAtual(data);
        this.carregarVendas();
    }
    
    /**
     * Atualiza configurações do operador
     * @param {Object} config - { operador, loja, idLoja }
     */
    setConfig(config) {
        if (config.operador) this.model.setOperador(config.operador);
        if (config.loja) this.model.setLoja(config.loja);
        if (config.idLoja) this.model.state.idLoja = config.idLoja;
        this._updateUI();
    }
    
    /**
     * Verifica se está em modo de desenvolvimento
     */
    _isDevMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }
    
    /**
     * Carrega dados mockados para desenvolvimento
     */
    _loadMockData() {
        console.log('🔧 Carregando dados mockados para desenvolvimento...');
        
        const mockVendas = [
            {
                idVenda: 1,
                idPedido: 1234,
                cliente: 'João Silva',
                vendedor: 'Maria Santos',
                valorTotal: 450.00,
                hora: '14:30',
                statusPagamento: 'pendente'
            },
            {
                idVenda: 2,
                idPedido: 1235,
                cliente: 'Ana Costa',
                vendedor: 'Pedro Lima',
                valorTotal: 280.00,
                hora: '15:45',
                statusPagamento: 'pendente'
            },
            {
                idVenda: 3,
                idPedido: 1236,
                cliente: 'Carlos Oliveira',
                vendedor: 'Maria Santos',
                valorTotal: 890.00,
                hora: '16:20',
                statusPagamento: 'pendente'
            }
        ];
        
        this.model.setVendasPendentes(mockVendas);
        
        // Mock para buscar pagamentos
        this.service.buscarPagamentosVenda = async (idVenda) => {
            return {
                idPedido: idVenda,
                cliente: 'Cliente Mock',
                vendedor: 'Vendedor Mock',
                valorTotal: 450.00,
                pagamentos: [
                    {
                        idFormaPagamento: 1,
                        tipoPagamento: 'Cartão de Crédito',
                        valor: 250.00,
                        bandeira: 'Visa',
                        parcelas: 2,
                        statusPagamento: 'pendente'
                    },
                    {
                        idFormaPagamento: 2,
                        tipoPagamento: 'Dinheiro',
                        valor: 200.00,
                        statusPagamento: 'pendente'
                    }
                ]
            };
        };
        
        // Mock para aprovar pagamento
        this.service.aprovarPagamento = async () => {
            return { success: true };
        };
        
        // Mock para finalizar recebimento
        this.service.finalizarRecebimentoVenda = async () => {
            return { success: true };
        };
        
        // Mock para registrar movimento
        this.service.registrarMovimentoCaixa = async () => {
            return { success: true };
        };
    }
    
    /**
     * Destrói o controller e limpa recursos
     */
    destroy() {
        this.model.removeAllListeners();
        this.view.removeAllListeners();
        this._vendaEmProcessamento = null;
        this._pagamentosEmProcessamento = [];
    }
}

// ===========================================
// FACTORY FUNCTION
// ===========================================

/**
 * Cria e inicializa uma instância do CaixaController
 * @param {string} containerId - ID do container
 * @param {Object} config - Configurações
 * @returns {CaixaController}
 */
export async function createCaixaModule(containerId, config = {}) {
    const controller = new CaixaController();
    await controller.init(containerId, config);
    return controller;
}
