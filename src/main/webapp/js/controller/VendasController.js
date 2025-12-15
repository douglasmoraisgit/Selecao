/**
 * VendasController.js
 * Controller para Gestão de Vendas
 * 
 * RESPONSABILIDADES:
 * - Carregar lista de vendas
 * - Carregar detalhes de venda
 * - Cancelar/Excluir vendas
 * - Coordenar com VendasView
 * 
 * EVENTOS EMITIDOS (para AppController):
 * - 'vendaCancelada'   → { vendaId }
 * - 'abrirCaixa'       → { vendaId }
 * - 'imprimirVenda'    → { venda }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class VendasController extends EventEmitter {
    
    constructor({ vendasView, comprovanteView }) {
        super();
        
        this.view = vendasView;
        this.comprovanteView = comprovanteView;
        this.baseUrl = this.detectContextPath();
        
        this.vendas = [];
        this.filtros = {
            status: '',
            periodo: 'mes',
            termo: ''
        };
        
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Ao abrir, carrega vendas
        this.view.on('abrir', () => {
            this.carregarVendas();
        });
        
        // Buscar
        this.view.on('buscar', ({ termo }) => {
            this.filtros.termo = termo;
            this.filtrarLocal();
        });
        
        // Filtrar
        this.view.on('filtrar', ({ status, periodo }) => {
            this.filtros.status = status;
            this.filtros.periodo = periodo;
            this.carregarVendas();
        });
        
        // Ver detalhes
        this.view.on('verDetalhes', async ({ venda }) => {
            await this.carregarDetalhesVenda(venda.id);
        });
        
        // Imprimir
        this.view.on('imprimir', ({ venda }) => {
            this.imprimirVenda(venda);
        });
        
        // Excluir/Cancelar
        this.view.on('excluir', async ({ vendaId }) => {
            await this.cancelarVenda(vendaId);
        });
        
        // Ir para caixa
        this.view.on('irParaCaixa', ({ vendaId }) => {
            this.view.fechar();
            this.emit('abrirCaixa', { vendaId });
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    abrir() {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🧾 ABRINDO GESTÃO DE VENDAS                                   ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        this.view.abrir();
    }

    fechar() {
        this.view.fechar();
    }

    // ========================================
    // CARREGAR DADOS
    // ========================================

    async carregarVendas() {
        console.log('📋 Carregando vendas...');
        this.view.showLoading();
        
        try {
            const params = new URLSearchParams();
            if (this.filtros.status) params.append('status', this.filtros.status);
            if (this.filtros.periodo) params.append('periodo', this.filtros.periodo);
            
            const url = `${this.baseUrl}/ListarVendas?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.vendas = data.vendas || [];
                console.log(`✅ ${this.vendas.length} vendas carregadas`);
                this.filtrarLocal();
            } else {
                throw new Error(data.message || 'Erro ao carregar vendas');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar vendas:', error);
            this.vendas = [];
            this.view.render([]);
            this.mostrarToast('❌ Erro ao carregar vendas');
        }
    }

    async carregarDetalhesVenda(vendaId) {
        try {
            const url = `${this.baseUrl}/DetalhesVenda?id=${vendaId}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                // Atualiza venda na lista local
                const index = this.vendas.findIndex(v => v.id === vendaId);
                if (index >= 0) {
                    this.vendas[index] = { ...this.vendas[index], ...data.venda };
                }
                
                // Atualiza view
                this.view.renderDetalhes(data.venda);
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar detalhes:', error);
        }
    }

    filtrarLocal() {
        let resultado = [...this.vendas];
        
        // Filtro por termo de busca
        if (this.filtros.termo) {
            const termo = this.filtros.termo.toLowerCase();
            resultado = resultado.filter(v => 
                v.cliente?.toLowerCase().includes(termo) ||
                v.id_pedido?.toString().includes(termo) ||
                v.id?.toString().includes(termo) ||
                v.cpf?.includes(termo)
            );
        }
        
        this.view.render(resultado);
    }

    // ========================================
    // AÇÕES
    // ========================================

    async cancelarVenda(vendaId) {
        console.log(`🗑️ Cancelando venda ${vendaId}...`);
        
        try {
            const url = `${this.baseUrl}/CancelarVenda`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `vendaId=${vendaId}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Venda cancelada!');
                this.mostrarToast('✅ Venda cancelada');
                
                // Atualiza status na lista local
                const index = this.vendas.findIndex(v => v.id === vendaId);
                if (index >= 0) {
                    this.vendas[index].status = 'Cancelado';
                    this.vendas[index].status_pagamento = 'Cancelado';
                }
                
                // Re-renderiza
                this.view.render(this.vendas);
                
                // Emite evento
                this.emit('vendaCancelada', { vendaId });
                
            } else {
                throw new Error(data.message || 'Erro ao cancelar');
            }
            
        } catch (error) {
            console.error('❌ Erro ao cancelar venda:', error);
            this.mostrarToast('❌ Erro ao cancelar venda');
        }
    }

    imprimirVenda(venda) {
        console.log('🖨️ Imprimindo venda:', venda.id);
        
        // Usa o ComprovanteVendaView para imprimir
        if (this.comprovanteView) {
            // Formata dados para o comprovante
            const dadosComprovante = {
                id: venda.id,
                idPedido: venda.id_pedido,
                cliente: {
                    nome: venda.cliente,
                    cpf: venda.cpf,
                    telefone: venda.telefone
                },
                subtotal: venda.subtotal || venda.total,
                desconto: venda.desconto ? { valor: venda.desconto } : null,
                total: venda.total,
                itens: venda.itens || [],
                pagamentos: (venda.pagamentos || []).map(p => ({
                    forma: p.forma_pagamento,
                    valor: p.valor,
                    parcelas: p.parcelas,
                    bandeira: p.bandeira
                }))
            };
            
            this.comprovanteView.abrir(dadosComprovante);
            
            // Aguarda um pouco e imprime
            setTimeout(() => {
                this.comprovanteView.imprimir();
            }, 500);
        } else {
            // Fallback: abre em nova janela
            this.imprimirViaJanela(venda);
        }
        
        this.emit('imprimirVenda', { venda });
    }

    imprimirViaJanela(venda) {
        const url = `${this.baseUrl}/ImprimirVenda?id=${venda.id}`;
        window.open(url, '_blank', 'width=400,height=600');
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
        if (typeof window.showToast === 'function') {
            window.showToast(mensagem);
        } else {
            console.log('🔔', mensagem);
        }
    }
}
