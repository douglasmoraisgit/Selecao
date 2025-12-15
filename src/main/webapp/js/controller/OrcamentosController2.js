/**
 * OrcamentosController.js
 * Controller para gerenciar orçamentos
 * 
 * RESPONSABILIDADES:
 * - Carregar orçamentos do servidor
 * - Coordenar OrcamentosView
 * - Emitir eventos para AppController
 * 
 * EVENTOS EMITIDOS (para AppController):
 * - 'orcamentoRecuperado'  → Orçamento carregado no carrinho { orcamento }
 * - 'orcamentoConvertido'  → Orçamento convertido em venda { orcamento }
 * - 'orcamentoExcluido'    → Orçamento excluído { id }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class OrcamentosController extends EventEmitter {
    
    constructor({ orcamentosView, carrinhoModel }) {
        super();
        
        this.view = orcamentosView;
        this.carrinhoModel = carrinhoModel;
        this.orcamentos = [];
        this.baseUrl = this.detectContextPath();
        
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Buscar orçamentos
        this.view.on('buscar', ({ termo }) => {
            // Filtro local já feito na view
            console.log('🔍 Buscando orçamentos:', termo);
        });
        
        // Filtrar por status
        this.view.on('filtrar', ({ status }) => {
            console.log('🔍 Filtrando por status:', status);
        });
        
        // Recuperar orçamento (carregar no carrinho)
        this.view.on('recuperar', ({ orcamento }) => {
            this.recuperarOrcamento(orcamento);
        });
        
        // Converter em venda
        this.view.on('converter', ({ orcamento }) => {
            this.converterOrcamento(orcamento);
        });
        
        // Excluir orçamento
        this.view.on('excluir', ({ id }) => {
            this.excluirOrcamento(id);
        });
        
        // Ao abrir, carrega orçamentos
        this.view.on('abrir', () => {
            this.carregarOrcamentos();
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Abre o modal de orçamentos
     */
    abrir() {
        this.view.abrir();
    }

    /**
     * Fecha o modal
     */
    fechar() {
        this.view.fechar();
    }

    /**
     * Carrega orçamentos do servidor
     */
    async carregarOrcamentos(filtros = {}) {
        this.view.showLoading();
        
        try {
            const params = new URLSearchParams();
            if (filtros.cliente) params.append('cliente', filtros.cliente);
            if (filtros.status) params.append('status', filtros.status);
            if (filtros.limit) params.append('limit', filtros.limit);
            
            const url = `${this.baseUrl}/ListarOrcamentos?${params.toString()}`;
            
            console.log('📋 Carregando orçamentos:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.orcamentos = data.orcamentos || [];
                this.view.render(this.orcamentos);
                
                console.log(`✅ ${this.orcamentos.length} orçamentos carregados`);
            } else {
                throw new Error(data.message || 'Erro ao carregar orçamentos');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar orçamentos:', error);
            this.view.showError(error.message);
        }
    }

    /**
     * Recupera orçamento e carrega no carrinho
     */
    async recuperarOrcamento(orcamento) {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🔄 RECUPERANDO ORÇAMENTO                                      ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('Orçamento:', orcamento.id, '-', orcamento.clienteNome);
        
        try {
            // Limpa carrinho atual (com confirmação se não estiver vazio)
            if (!this.carrinhoModel.estaVazio()) {
                const confirma = confirm(
                    'O carrinho atual não está vazio.\n\n' +
                    'Deseja substituir pelo orçamento selecionado?'
                );
                if (!confirma) return;
            }
            
            // Limpa carrinho
            this.carrinhoModel.limpar();
            
            // Define cliente
            if (orcamento.clienteNome) {
                this.carrinhoModel.setCliente({
                    id: orcamento.clienteId,
                    nome: orcamento.clienteNome
                });
            }
            
            // Adiciona itens do orçamento
            const itens = orcamento.itens || [];
            
            for (const item of itens) {
                if (item.tipo === 'lente') {
                    // Reconstrói objeto da lente
                    const lente = this.reconstruirLente(item);
                    
                    console.log('📦 Recuperando lente:', lente.descricao);
                    console.log('   Tratamentos:', lente.tratamentos);
                    console.log('   Coloração:', lente.coloracao);
                    
                    // Passa tratamentos e coloração reconstruídos
                    this.carrinhoModel.adicionarLente(lente, item.olho, lente.tratamentos, lente.coloracao);
                } else if (item.tipo === 'produto') {
                    // Reconstrói objeto do produto
                    const produto = this.reconstruirProduto(item);
                    this.carrinhoModel.adicionarProduto(produto);
                }
            }
            
            console.log('✅ Orçamento recuperado!');
            console.log('   Itens no carrinho:', this.carrinhoModel.getQuantidadeItens());
            
            // Emite evento
            this.emit('orcamentoRecuperado', { orcamento });
            
            // Fecha modal de orçamentos
            this.view.fechar();
            
            // Mostra toast
            this.mostrarToast(`✅ Orçamento #${orcamento.id} carregado no carrinho!`);
            
        } catch (error) {
            console.error('❌ Erro ao recuperar orçamento:', error);
            this.mostrarToast('❌ Erro ao recuperar orçamento');
        }
    }

    /**
     * Converte orçamento em venda
     */
    async converterOrcamento(orcamento) {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  💳 CONVERTENDO ORÇAMENTO EM VENDA                             ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        const confirma = confirm(
            `Converter orçamento #${orcamento.id} em venda?\n\n` +
            `Cliente: ${orcamento.clienteNome}\n` +
            `Total: R$ ${this.formatarValor(orcamento.total)}`
        );
        
        if (!confirma) return;
        
        try {
            // Primeiro recupera no carrinho
            await this.recuperarOrcamento(orcamento);
            
            // Atualiza status do orçamento no servidor
            await this.atualizarStatus(orcamento.id, 'CONVERTIDO');
            
            // Emite evento para ir direto ao pagamento
            this.emit('orcamentoConvertido', { orcamento });
            
        } catch (error) {
            console.error('❌ Erro ao converter orçamento:', error);
            this.mostrarToast('❌ Erro ao converter orçamento');
        }
    }

    /**
     * Exclui um orçamento
     */
    async excluirOrcamento(id) {
        console.log('🗑️ Excluindo orçamento:', id);
        
        try {
            const url = `${this.baseUrl}/ExcluirOrcamento?id=${id}`;
            
            const response = await fetch(url, { method: 'DELETE' });
            const data = await response.json();
            
            if (data.success) {
                // Remove da lista local
                this.orcamentos = this.orcamentos.filter(o => o.id != id);
                this.view.render(this.orcamentos);
                
                this.mostrarToast('✅ Orçamento excluído');
                this.emit('orcamentoExcluido', { id });
            } else {
                throw new Error(data.message || 'Erro ao excluir');
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir orçamento:', error);
            this.mostrarToast('❌ Erro ao excluir orçamento');
        }
    }

    /**
     * Atualiza status de um orçamento
     */
    async atualizarStatus(id, status) {
        try {
            const url = `${this.baseUrl}/AtualizarOrcamento`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${id}&status=${status}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Atualiza na lista local
                const orc = this.orcamentos.find(o => o.id == id);
                if (orc) orc.status = status;
                this.view.render(this.orcamentos);
            }
            
            return data;
            
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw error;
        }
    }

    // ========================================
    // MÉTODOS PRIVADOS
    // ========================================

    /**
     * Reconstrói objeto de lente a partir do item do orçamento
     */
    reconstruirLente(item) {
        // Parse tratamentos se vier como string JSON
        let tratamentos = [];
        if (item.tratamentos) {
            try {
                tratamentos = typeof item.tratamentos === 'string' 
                    ? JSON.parse(item.tratamentos) 
                    : item.tratamentos;
            } catch (e) {
                tratamentos = [];
            }
        }
        
        // Parse coloração se vier como string JSON
        let coloracao = null;
        if (item.coloracao) {
            try {
                coloracao = typeof item.coloracao === 'string' 
                    ? JSON.parse(item.coloracao) 
                    : item.coloracao;
            } catch (e) {
                coloracao = null;
            }
        }
        
        return {
            id: item.id,
            tipo: 'lente',
            codigo: item.codigo,
            codigoWeb: item.codigoWeb,
            marca: item.marca,
            familia: item.familia,
            descricao: item.descricao,
            olho: item.olho,
            esf: item.esf || 0,
            cil: item.cil || 0,
            eixo: item.eixo || 0,
            adicao: item.adicao || 0,
            unidade: 'par',
            quantidade: item.quantidade || 0.5,
            precoUnitario: item.precoUnitario,
            precoTotal: item.precoTotal,
            tratamentos: tratamentos,
            coloracao: coloracao
        };
    }

    /**
     * Reconstrói objeto de produto a partir do item do orçamento
     */
    reconstruirProduto(item) {
        return {
            id: item.id,
            tipo: 'produto',
            codigo: item.codigo,
            descricao: item.descricao,
            marca: item.marca,
            unidade: item.unidade || 'un',
            quantidade: item.quantidade || 1,
            precoUnitario: item.precoUnitario,
            precoTotal: item.precoTotal
        };
    }

    /**
     * Detecta contexto da aplicação
     */
    detectContextPath() {
        const path = window.location.pathname;
        const match = path.match(/^\/[^\/]+/);
        return match ? match[0] : '';
    }

    /**
     * Formata valor monetário
     */
    formatarValor(valor) {
        if (valor === null || valor === undefined) return '0,00';
        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Mostra toast de notificação
     */
    mostrarToast(mensagem) {
        let toast = document.getElementById('orcamentoToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'orcamentoToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-weight: 600;
                z-index: 10002;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.3s ease;
                box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = mensagem;
        
        // Anima entrada
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Anima saída
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
        }, 3000);
    }
}
