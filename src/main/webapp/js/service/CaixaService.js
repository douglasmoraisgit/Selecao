/**
 * CaixaService.js
 * Serviço para comunicação com o backend do Caixa
 * 
 * Endpoints utilizados:
 * - GET  CaixaServlet?data=YYYY-MM-DD      → Listar vendas do dia
 * - GET  ReceberPagamentosServlet?idVenda= → Buscar pagamentos de uma venda
 * - POST AprovarPagamentosIndividual       → Aprovar pagamento individual
 */

export class CaixaService {
    constructor() {
        this.baseUrl = '';  // Relativo ao contexto da aplicação
    }

    // ===========================================
    // VENDAS
    // ===========================================
    
    /**
     * Busca vendas pendentes de recebimento para uma data
     * @param {string} data - Data no formato YYYY-MM-DD
     * @param {number} idLoja - ID da loja
     * @returns {Promise<Array>} Lista de vendas
     */
    async buscarVendasPendentes(data, idLoja) {
        try {
            const params = new URLSearchParams({
                data: data,
                idLoja: idLoja,
                action: 'listarPendentes'
            });
            
            const response = await fetch(`CaixaRecebimentoServlet?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar vendas: ${response.status}`);
            }
            
            const data_response = await response.json();
            return data_response.vendas || data_response || [];
            
        } catch (error) {
            console.error('❌ Erro ao buscar vendas pendentes:', error);
            throw error;
        }
    }
    
    /**
     * Busca totalizadores do caixa para uma data
     * @param {string} data - Data no formato YYYY-MM-DD
     * @param {number} idLoja - ID da loja
     * @returns {Promise<Object>} Totalizadores
     */
    async buscarTotalizadores(data, idLoja) {
        try {
            const params = new URLSearchParams({
                data: data,
                idLoja: idLoja,
                action: 'totalizadores'
            });
            
            const response = await fetch(`CaixaRecebimentoServlet?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar totalizadores: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ Erro ao buscar totalizadores:', error);
            throw error;
        }
    }

    // ===========================================
    // PAGAMENTOS
    // ===========================================
    
    /**
     * Busca os pagamentos de uma venda específica
     * @param {number} idVenda - ID da venda (id_pedido)
     * @returns {Promise<Object>} Dados da venda com pagamentos
     */
    async buscarPagamentosVenda(idVenda) {
        try {
            const response = await fetch(`ReceberPagamentosServlet?idVenda=${idVenda}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao buscar pagamentos: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ Erro ao buscar pagamentos da venda:', error);
            throw error;
        }
    }
    
    /**
     * Confirma recebimento de um pagamento individual
     * @param {number} idPagamento - ID do pagamento
     * @param {string} numeroAutorizacao - Número de autorização (para convênio)
     * @returns {Promise<Object>} Resultado da operação
     */
    async aprovarPagamento(idPedido, idPagamento, numeroAutorizacao = null) {
        try {
            const body = {
                idPagamento: idPagamento
            };
            
            if (numeroAutorizacao) {
                body.numeroAutorizacao = numeroAutorizacao;
            }
            
            console.log('📤 Confirmando pagamento:', body);
            
            const response = await fetch('ConfirmarPagamentoServlet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erro ao confirmar pagamento');
            }
            
            const resultado = await response.json();
            console.log('✅ Pagamento confirmado:', resultado);
            
            return resultado;
            
        } catch (error) {
            console.error('❌ Erro ao confirmar pagamento:', error);
            throw error;
        }
    }
    
    /**
     * Atualiza o status de pagamento da venda para "pago"
     * @param {number} idPedido - ID do pedido
     * @returns {Promise<Object>} Resultado da operação
     */
    async finalizarRecebimentoVenda(idPedido) {
        try {
            const response = await fetch('AtualizarStatusVendaServlet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `idPedido=${idPedido}&status=pago`
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao finalizar recebimento: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('❌ Erro ao finalizar recebimento:', error);
            throw error;
        }
    }

    // ===========================================
    // MOVIMENTAÇÕES DE CAIXA
    // ===========================================
    
    /**
     * Registra movimento de caixa (entrada por venda)
     * @param {Object} movimento - Dados do movimento
     * @returns {Promise<Object>} Resultado
     */
    async registrarMovimentoCaixa(movimento) {
        try {
            const params = new URLSearchParams({
                tipoMovimento: 'ENTRADA',
                valor: movimento.valor,
                formaPagamento: movimento.formaPagamento,
                origem: 'VENDA',
                idVenda: movimento.idVenda,
                observacoes: movimento.observacoes || 'Pagamento confirmado pelo caixa'
            });
            
            const response = await fetch('RegistrarMovimentoCaixaServlet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao registrar movimento: ${response.status}`);
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Erro ao registrar movimento:', error);
            throw error;
        }
    }

    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    /**
     * Verifica se o servidor está acessível
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        try {
            const response = await fetch('CaixaRecebimentoServlet?action=health', {
                method: 'GET'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}
