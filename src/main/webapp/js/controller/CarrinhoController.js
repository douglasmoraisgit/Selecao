/**
 * CarrinhoController.js
 * Controller - Coordena CarrinhoModel e CarrinhoView
 * 
 * RESPONSABILIDADES:
 * - Escutar eventos da View e atualizar Model
 * - Escutar eventos do Model e atualizar View
 * - Emitir eventos para o AppController
 * - Gerenciar fluxo de adicionar itens
 * 
 * EVENTOS EMITIDOS (para AppController):
 * - 'carrinhoAberto'      → Carrinho foi aberto
 * - 'carrinhoFechado'     → Carrinho foi fechado
 * - 'itemAdicionado'      → Item foi adicionado { item, tipo }
 * - 'itemRemovido'        → Item foi removido { item, tipo }
 * - 'carrinhoLimpo'       → Carrinho foi limpo
 * - 'irParaPagamento'     → Usuário quer ir para tela de pagamento
 * - 'finalizarPedido'     → Usuário quer finalizar { dados } (legado)
 * - 'salvarOrcamento'     → Usuário quer salvar orçamento { dados }
 * - 'voltarParaProdutos'  → Usuário quer adicionar mais itens
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class CarrinhoController extends EventEmitter {
    
    constructor({ carrinhoModel, carrinhoView }) {
        super();
        
        // Dependências injetadas
        this.model = carrinhoModel;
        this.view = carrinhoView;
        
        // Bind de eventos
        this.bindModelEvents();
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindModelEvents() {
        // Quando o model muda, atualiza a view
        this.model.on('change', (resumo) => {
            this.atualizarView();
        });
        
        this.model.on('itemAdicionado', ({ item, tipo }) => {
            console.log('🛒 Item adicionado ao carrinho:', item.descricao);
            this.emit('itemAdicionado', { item, tipo });
        });
        
        this.model.on('itemRemovido', ({ item, tipo }) => {
            console.log('🗑️ Item removido do carrinho:', item.descricao);
            this.emit('itemRemovido', { item, tipo });
        });
        
        this.model.on('limpo', () => {
            console.log('🧹 Carrinho limpo');
            this.emit('carrinhoLimpo');
        });
    }

    bindViewEvents() {
        // Incrementar quantidade
        this.view.on('incrementar', ({ id }) => {
            this.model.incrementar(id);
        });
        
        // Decrementar quantidade
        this.view.on('decrementar', ({ id }) => {
            this.model.decrementar(id);
        });
        
        // Remover item
        this.view.on('remover', ({ id }) => {
            this.model.removerItem(id);
        });
        
        // Limpar carrinho
        this.view.on('limpar', () => {
            if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                this.model.limpar();
                this.view.showEmpty();
            }
        });
        
        // Cliente alterado
        this.view.on('clienteChange', ({ nome }) => {
            this.model.setCliente({ nome });
        });
        
        // ✅ NOVO - Ir para tela de pagamento
        this.view.on('irParaPagamento', () => {
            console.log('💳 CarrinhoController: irParaPagamento recebido');
            if (this.model.estaVazio()) {
                alert('O carrinho está vazio!');
                return;
            }
            this.emit('irParaPagamento');
        });
        
        // Finalizar pedido (legado - mantido para compatibilidade)
        this.view.on('finalizar', () => {
            this.finalizarPedido();
        });
        
        // Salvar orçamento
        this.view.on('salvarOrcamento', () => {
            this.salvarOrcamento();
        });
        
        // Adicionar item (volta para produtos)
        this.view.on('adicionarItem', () => {
            this.view.fechar();
            this.emit('voltarParaProdutos');
        });
        
        // Troca de aba
        this.view.on('abaChange', ({ aba }) => {
            this.atualizarView();
        });
        
        // Abrir/Fechar
        this.view.on('abrir', () => {
            this.emit('carrinhoAberto');
        });
        
        this.view.on('fechar', () => {
            this.emit('carrinhoFechado');
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Abre o modal do carrinho
     */
    abrir() {
        this.atualizarView();
        this.view.abrir();
    }

    /**
     * Fecha o modal do carrinho
     */
    fechar() {
        this.view.fechar();
    }

    /**
     * Toggle do modal
     */
    toggle() {
        if (this.view.isAberto()) {
            this.fechar();
        } else {
            this.abrir();
        }
    }

    /**
     * Adiciona lente ao carrinho
     * Chamado pelo AppController quando usuário clica em "Adicionar"
     * @param {Object} produto - Produto do DisplayProdutosView
     */
    adicionarProduto(produto) {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🛒 ADICIONANDO AO CARRINHO                                    ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('📦 Produto:', produto);
        
        // Extrai tratamentos e coloração do produto (se houver)
        const info = produto.od || produto.oe;
        const tratamentos = [];
        const coloracao = null;
        
        // Se tem tratamento adicional (sempre anti-reflexo)
        if (info.origemTratamento === 'ADICIONAL' && info.tratamentoAdicionalNome) {
            tratamentos.push({
                tipo: 'antireflexo',  // ✅ Tipo do tratamento
                codigo: info.tratamentoAdicionalCodigo || 0,
                nome: info.tratamentoAdicionalNome,
                valor: info.tratamentoAdicionalValor || 0
            });
        }
        
        // Se tem coloração
        let coloracaoObj = null;
        if (info.coloracao && info.coloracao !== 'Sem Coloração') {
            coloracaoObj = {
                nome: info.coloracao,
                tipo: info.coloracaoTipo,
                valor: info.coloracaoValor || 0,
                hex: info.coloracaoHex || '#888888'
            };
        }
        
        // Adiciona par de lentes (OD + OE)
        const itens = this.model.adicionarParLentes(produto, tratamentos, coloracaoObj);
        
        console.log('✅ Itens adicionados:', itens.length);
        
        // Mostra feedback
        this.mostrarToastAdicionado(itens.length);
        
        return itens;
    }

    /**
     * Adiciona lente individual
     */
    adicionarLenteIndividual(dadosLente, olho, tratamentos = [], coloracao = null) {
        return this.model.adicionarLente(dadosLente, olho, tratamentos, coloracao);
    }

    /**
     * Retorna quantidade de itens no carrinho
     */
    getQuantidadeItens() {
        return this.model.getQuantidadeItens();
    }

    /**
     * Retorna resumo do carrinho
     */
    getResumo() {
        return this.model.getResumo();
    }

    /**
     * Verifica se carrinho está vazio
     */
    estaVazio() {
        return this.model.estaVazio();
    }

    // ========================================
    // MÉTODOS PRIVADOS
    // ========================================

    /**
     * Atualiza a view com dados do model
     */
    atualizarView() {
        const dados = {
            lentes: this.model.getLentes(),
            produtos: this.model.getProdutos(),
            cliente: this.model.getCliente(),
            total: this.model.getTotal()
        };
        
        this.view.render(dados);
    }

    /**
     * Finaliza o pedido (legado)
     */
    async finalizarPedido() {
        if (this.model.estaVazio()) {
            alert('O carrinho está vazio!');
            return;
        }
        
        const cliente = this.model.getCliente();
        if (!cliente.nome) {
            alert('Por favor, informe o nome do cliente.');
            document.getElementById('inputCliente')?.focus();
            return;
        }
        
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  💳 FINALIZANDO PEDIDO                                         ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        // Monta payload
        const payload = this.model.toURLSearchParams();
        
        console.log('📤 Payload:', payload.toString());
        
        // Emite evento para o AppController tratar o envio
        this.emit('finalizarPedido', {
            payload,
            resumo: this.model.getResumo(),
            lentes: this.model.getLentes(),
            produtos: this.model.getProdutos(),
            cliente: this.model.getCliente(),
            total: this.model.getTotal()
        });
    }

    /**
     * Salva orçamento para consulta futura
     */
    async salvarOrcamento() {
        if (this.model.estaVazio()) {
            alert('O carrinho está vazio!');
            return;
        }
        
        const cliente = this.model.getCliente();
        if (!cliente.nome) {
            alert('Por favor, informe o nome do cliente para salvar o orçamento.');
            document.getElementById('inputCliente')?.focus();
            return;
        }
        
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  💾 SALVANDO ORÇAMENTO                                         ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        // Monta payload com flag de orçamento
        const payload = this.model.toURLSearchParams();
        payload.append('tipo', 'orcamento');
        
        console.log('📤 Payload:', payload.toString());
        
        // Emite evento para o AppController tratar o salvamento
        this.emit('salvarOrcamento', {
            payload,
            resumo: this.model.getResumo(),
            lentes: this.model.getLentes(),
            produtos: this.model.getProdutos(),
            cliente: this.model.getCliente(),
            total: this.model.getTotal()
        });
    }

    /**
     * Mostra toast de item adicionado
     */
    mostrarToastAdicionado(quantidade) {
        let toast = document.getElementById('carrinhoToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'carrinhoToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-weight: 600;
                z-index: 10001;
                opacity: 0;
                transform: translateX(100px);
                transition: all 0.3s ease;
                box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
                display: flex;
                align-items: center;
                gap: 12px;
            `;
            document.body.appendChild(toast);
        }
        
        const total = this.model.getQuantidadeItens();
        toast.innerHTML = `
            <span style="font-size: 24px;">🛒</span>
            <div>
                <div style="font-size: 14px;">${quantidade > 1 ? quantidade + ' lentes adicionadas' : 'Lente adicionada'}</div>
                <div style="font-size: 12px; opacity: 0.8;">${total} ${total === 1 ? 'item' : 'itens'} no carrinho</div>
            </div>
        `;
        
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

    /**
     * Atualiza badge do botão do carrinho (se existir)
     */
    atualizarBadge() {
        const badge = document.getElementById('carrinhoBadge');
        if (badge) {
            const quantidade = this.model.getQuantidadeItens();
            badge.textContent = quantidade;
            badge.style.display = quantidade > 0 ? 'flex' : 'none';
        }
    }
}