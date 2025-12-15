/**
 * PagamentoController.js
 * Controller para Tela de Pagamento
 * 
 * RESPONSABILIDADES:
 * - Carregar formas de pagamento, bandeiras e convênios
 * - Coordenar PagamentoView
 * - Salvar venda no servidor
 * - Emitir eventos para AppController
 * 
 * EVENTOS EMITIDOS (para AppController):
 * - 'vendaConfirmada'  → { venda } - Venda salva com sucesso
 * - 'vendaCancelada'   → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class PagamentoController extends EventEmitter {
    
    constructor({ pagamentoView, carrinhoModel }) {
        super();
        
        this.view = pagamentoView;
        this.carrinhoModel = carrinhoModel;
        this.baseUrl = this.detectContextPath();
        
        // Dados de configuração
        this.formasPagamento = [];
        this.bandeiras = [];
        this.convenios = [];
        this.configCarregada = false;
        
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Confirmar venda
        this.view.on('confirmarVenda', async (dados) => {
            await this.salvarVenda(dados);
        });
        
        // Cancelar
        this.view.on('cancelar', () => {
            this.emit('vendaCancelada');
        });
        
        // Log de eventos
        this.view.on('adicionarPagamento', (pag) => {
            console.log('💳 Pagamento adicionado:', pag);
        });
        
        this.view.on('removerPagamento', ({ index }) => {
            console.log('🗑️ Pagamento removido:', index);
        });
        
        this.view.on('aplicarDesconto', ({ tipo, valor }) => {
            console.log('🏷️ Desconto aplicado:', tipo, valor);
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Abre a tela de pagamento
     */
    async abrir() {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  💳 ABRINDO TELA DE PAGAMENTO                                  ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        // Verifica se carrinho tem itens
        if (this.carrinhoModel.estaVazio()) {
            alert('O carrinho está vazio!');
            return;
        }
        
        // Carrega configurações se necessário
        if (!this.configCarregada) {
            await this.carregarConfiguracoes();
        }
        
        // Prepara dados do carrinho
        const carrinho = {
            cliente: this.carrinhoModel.getCliente(),
            itens: this.carrinhoModel.getTodosItens(),
            total: this.carrinhoModel.getTotal()
        };
        
        console.log('📦 Carrinho:', carrinho.itens.length, 'itens');
        console.log('💰 Total:', carrinho.total);
        
        // Abre a view
        this.view.abrir(carrinho, this.formasPagamento, this.bandeiras, this.convenios);
    }

    /**
     * Fecha a tela
     */
    fechar() {
        this.view.fechar();
    }

    // ========================================
    // CARREGAR CONFIGURAÇÕES
    // ========================================

    async carregarConfiguracoes() {
        console.log('⚙️ Carregando configurações de pagamento...');
        
        try {
            const response = await fetch(`${this.baseUrl}/ConfiguracoesPagamento`);
            const data = await response.json();
            
            if (data.success) {
                this.formasPagamento = data.formasPagamento || [];
                this.bandeiras = data.bandeiras || [];
                this.convenios = data.convenios || [];
                this.configCarregada = true;
                
                console.log('✅ Configurações carregadas:');
                console.log('   Formas:', this.formasPagamento.length);
                console.log('   Bandeiras:', this.bandeiras.length);
                console.log('   Convênios:', this.convenios.length);
            } else {
                throw new Error(data.message || 'Erro ao carregar configurações');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            
            // Configurações padrão em caso de erro
            this.formasPagamento = [
                { codigo: 'DINHEIRO', nome: 'Dinheiro', icon: '💵', permite_parcelamento: false, max_parcelas: 1 },
                { codigo: 'CREDITO', nome: 'Cartão de Crédito', icon: '💳', permite_parcelamento: true, max_parcelas: 12, requer_bandeira: true },
                { codigo: 'DEBITO', nome: 'Cartão de Débito', icon: '💳', permite_parcelamento: false, max_parcelas: 1, requer_bandeira: true },
                { codigo: 'PIX', nome: 'PIX', icon: '📱', permite_parcelamento: false, max_parcelas: 1 },
                { codigo: 'CHEQUE', nome: 'Cheque', icon: '📄', permite_parcelamento: true, max_parcelas: 6 },
                { codigo: 'CONVENIO', nome: 'Convênio', icon: '🏢', permite_parcelamento: true, max_parcelas: 12, requer_convenio: true, requer_autorizacao: true },
                { codigo: 'CREDIARIO', nome: 'Crediário', icon: '📋', permite_parcelamento: true, max_parcelas: 24 },
                { codigo: 'SALDO_RECEBER', nome: 'Saldo a Receber', icon: '⏳', permite_parcelamento: false, max_parcelas: 1 }
            ];
            
            this.bandeiras = [
                { codigo: 'VISA', nome: 'Visa' },
                { codigo: 'MASTERCARD', nome: 'Mastercard' },
                { codigo: 'ELO', nome: 'Elo' },
                { codigo: 'HIPERCARD', nome: 'Hipercard' },
                { codigo: 'AMEX', nome: 'Amex' }
            ];
            
            this.convenios = [];
            this.configCarregada = true;
        }
    }

    // ========================================
    // SALVAR VENDA
    // ========================================

    async salvarVenda(dados) {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  💾 SALVANDO VENDA                                             ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('Cliente:', dados.cliente.nome);
        console.log('Total:', dados.total);
        console.log('Pagamentos:', dados.pagamentos.length);
        
        try {
            // Prepara payload
            const payload = {
                // Cliente
                id_cliente: dados.cliente.id || null,  // ✅ ID do cliente cadastrado
                cliente_nome: dados.cliente.nome,
                cliente_cpf: dados.cliente.cpf || null,
                cliente_telefone: dados.cliente.telefone || null,
                
                // Valores
                subtotal: this.carrinhoModel.getTotal(),
                desconto_tipo: dados.desconto?.tipo || 'valor',
                desconto_valor: dados.desconto?.valor || 0,
                total: dados.total,
                
                // Itens do carrinho
                itens: this.carrinhoModel.getTodosItens().map(item => ({
                    tipo: item.tipo,
                    codigo: item.codigo,
                    codigo_web: item.codigoWeb,
                    descricao: item.descricao,
                    marca: item.marca,
                    familia: item.familia,
                    olho: item.olho || null,
                    quantidade: item.quantidade,
                    preco_unitario: item.precoUnitario,
                    preco_total: item.precoTotal,
                    unidade: item.unidade,
                    tratamentos: item.tratamentos || [],
                    coloracao: item.coloracao || null
                })),
                
                // Pagamentos
                pagamentos: dados.pagamentos.map(pag => ({
                    forma: pag.forma,
                    valor: pag.valor,
                    parcelas: pag.parcelas,
                    bandeira: pag.bandeira,
                    convenio_id: pag.convenioId,
                    autorizacao: pag.autorizacao
                })),
                
                // Observações
                observacoes: dados.observacoes || null
            };
            
            console.log('📤 Enviando payload:', payload);
            
            const response = await fetch(`${this.baseUrl}/SalvarVenda`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Venda salva com sucesso!');
                console.log('   ID:', result.vendaId);
                console.log('   Pedido:', result.idPedido);
                
                // Guarda os itens ANTES de limpar o carrinho
                const itensVenda = this.carrinhoModel.getTodosItens();
                
                // Limpa o carrinho
                this.carrinhoModel.limpar();
                
                // Fecha a tela
                this.view.fechar();
                
                // Emite evento com dados completos para o comprovante
                this.emit('vendaConfirmada', {
                    id: result.vendaId,
                    idPedido: result.idPedido,
                    cliente: dados.cliente,
                    subtotal: payload.subtotal,
                    desconto: dados.desconto,
                    total: dados.total,
                    itens: itensVenda,
                    pagamentos: dados.pagamentos,
                    observacoes: dados.observacoes
                });
                
                // Notificação de sucesso (removida - agora mostra no comprovante)
                // this.mostrarToast(`✅ Venda #${result.idPedido} salva com sucesso!`);
                
            } else {
                throw new Error(result.message || 'Erro ao salvar venda');
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar venda:', error);
            alert('Erro ao salvar venda: ' + error.message);
        }
    }

    // ========================================
    // HELPERS
    // ========================================

    detectContextPath() {
        const path = window.location.pathname;
        const match = path.match(/^\/[^\/]+/);
        return match ? match[0] : '';
    }

    mostrarToast(mensagem) {
        // Verifica se existe função global de toast
        if (typeof window.showToast === 'function') {
            window.showToast(mensagem);
        } else {
            console.log('🔔', mensagem);
            // Fallback: alert
            // alert(mensagem);
        }
    }
}
