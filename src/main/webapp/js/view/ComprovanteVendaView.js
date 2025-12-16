/**
 * ComprovanteVendaView.js
 * View para exibir e imprimir comprovante da venda
 * 
 * FUNCIONALIDADES:
 * - Exibir resumo da venda após confirmação
 * - Mostrar itens, pagamentos, cliente, totais
 * - Imprimir comprovante para cliente levar ao caixa
 * - Opção de visualizar venda posteriormente
 * 
 * EVENTOS EMITIDOS:
 * - 'fechar'     → {}
 * - 'imprimir'   → { vendaId }
 * - 'novaVenda'  → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class ComprovanteVendaView extends EventEmitter {
    
    constructor() {
        super();
        this.container = null;
        this.venda = null;
        
        this.injectStyles();
        this.createModal();
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if (document.getElementById('comprovante-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'comprovante-styles';
        style.textContent = `
            /* ========================================
               MODAL DO COMPROVANTE
            ======================================== */
            
            .comprovante-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 10100;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .comprovante-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .comprovante-modal {
                background: white;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                transform: scale(0.9) translateY(20px);
                transition: all 0.3s ease;
            }
            
            .comprovante-overlay.active .comprovante-modal {
                transform: scale(1) translateY(0);
            }
            
            /* Header com sucesso */
            .comprovante-header {
                padding: 24px;
                text-align: center;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 16px 16px 0 0;
                color: white;
            }
            
            .comprovante-header .icon-sucesso {
                width: 64px;
                height: 64px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin: 0 auto 16px;
            }
            
            .comprovante-header h2 {
                margin: 0 0 8px 0;
                font-size: 1.4rem;
                font-weight: 700;
            }
            
            .comprovante-header .numero-pedido {
                font-size: 1.1rem;
                opacity: 0.95;
            }
            
            /* Corpo do comprovante */
            .comprovante-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            /* Seção */
            .comprovante-secao {
                margin-bottom: 20px;
            }
            
            .comprovante-secao h4 {
                font-size: 0.8rem;
                text-transform: uppercase;
                color: #6b7280;
                margin: 0 0 10px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Cliente */
            .cliente-info {
                background: #f9fafb;
                padding: 12px;
                border-radius: 8px;
            }
            
            .cliente-info .nome {
                font-weight: 600;
                font-size: 1rem;
                color: #111827;
            }
            
            .cliente-info .detalhe {
                font-size: 0.85rem;
                color: #6b7280;
                margin-top: 4px;
            }
            
            /* Itens */
            .comprovante-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px dashed #e5e7eb;
            }
            
            .comprovante-item:last-child {
                border-bottom: none;
            }
            
            .item-desc {
                flex: 1;
            }
            
            .item-desc .nome {
                font-weight: 500;
                color: #111827;
            }
            
            .item-desc .detalhe {
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .item-valor {
                font-weight: 600;
                color: #111827;
                white-space: nowrap;
                margin-left: 16px;
            }
            
            /* Pagamentos */
            .pagamento-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px dashed #e5e7eb;
            }
            
            .pagamento-item:last-child {
                border-bottom: none;
            }
            
            .pagamento-item .icon {
                font-size: 1.3rem;
                margin-right: 12px;
            }
            
            .pagamento-item .info {
                flex: 1;
            }
            
            .pagamento-item .forma {
                font-weight: 500;
                color: #111827;
            }
            
            .pagamento-item .detalhe {
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .pagamento-item .valor {
                font-weight: 600;
                color: #059669;
            }
            
            /* Totais */
            .comprovante-totais {
                background: #f0fdf4;
                padding: 16px;
                border-radius: 8px;
                margin-top: 16px;
            }
            
            .total-linha {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
            }
            
            .total-linha.destaque {
                font-size: 1.2rem;
                font-weight: 700;
                color: #059669;
                border-top: 2px solid #bbf7d0;
                padding-top: 12px;
                margin-top: 8px;
            }
            
            /* Status */
            .comprovante-status {
                text-align: center;
                padding: 16px;
                background: #fef3c7;
                border-radius: 8px;
                margin-top: 16px;
            }
            
            .comprovante-status .badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: #f59e0b;
                color: white;
                border-radius: 20px;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .comprovante-status .instrucao {
                margin-top: 10px;
                font-size: 0.85rem;
                color: #92400e;
            }
            
            /* Footer */
            .comprovante-footer {
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
            }
            
            .comprovante-footer .btn {
                flex: 1;
                padding: 14px;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-imprimir {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                color: white;
            }
            
            .btn-imprimir:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            }
            
            .btn-nova-venda {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
            }
            
            .btn-nova-venda:hover {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
            }
            
            .btn-fechar {
                background: #f3f4f6;
                color: #374151;
                flex: 0 0 auto;
                padding: 14px 20px;
            }
            
            .btn-fechar:hover {
                background: #e5e7eb;
            }
            
            /* ========================================
               ESTILOS DE IMPRESSÃO
            ======================================== */
            
            @media print {
                body * {
                    visibility: hidden;
                }
                
                .comprovante-overlay,
                .comprovante-overlay * {
                    visibility: visible;
                }
                
                .comprovante-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    background: white !important;
                    padding: 0 !important;
                }
                
                .comprovante-modal {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    max-width: 100% !important;
                    max-height: none !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                }
                
                .comprovante-header {
                    background: white !important;
                    color: black !important;
                    border-bottom: 2px solid #000;
                    border-radius: 0 !important;
                }
                
                .comprovante-header .icon-sucesso {
                    display: none !important;
                }
                
                .comprovante-footer {
                    display: none !important;
                }
                
                .comprovante-totais {
                    background: white !important;
                    border: 2px solid #000;
                }
                
                .comprovante-status {
                    background: white !important;
                    border: 2px dashed #000;
                }
                
                .comprovante-status .badge {
                    background: white !important;
                    color: black !important;
                    border: 2px solid #000;
                }
            }
            
            /* Responsivo */
            @media (max-width: 540px) {
                .comprovante-modal {
                    max-height: 100vh;
                    border-radius: 0;
                }
                
                .comprovante-header {
                    border-radius: 0;
                }
                
                .comprovante-footer {
                    flex-direction: column;
                }
                
                .comprovante-footer .btn {
                    flex: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // ========================================
    // CRIAR MODAL
    // ========================================

    createModal() {
        this.container = document.createElement('div');
        this.container.className = 'comprovante-overlay';
        this.container.innerHTML = `
            <div class="comprovante-modal">
                <div class="comprovante-header">
                    <div class="icon-sucesso">✓</div>
                    <h2>Venda Confirmada!</h2>
                    <div class="numero-pedido">Pedido #<span id="comprovanteNumeroPedido">---</span></div>
                </div>
                
                <div class="comprovante-body" id="comprovanteBody">
                    <!-- Conteúdo dinâmico -->
                </div>
                
                <div class="comprovante-footer">
                    <button class="btn btn-fechar" id="btnFecharComprovante">✕</button>
                    <button class="btn btn-imprimir" id="btnImprimirComprovante">
                        🖨️ Imprimir
                    </button>
                    <button class="btn btn-nova-venda" id="btnNovaVenda">
                        ➕ Nova Venda
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.container);
        this.bindEvents();
    }

    // ========================================
    // EVENTOS
    // ========================================

    bindEvents() {
        // Fechar
        this.container.querySelector('#btnFecharComprovante').addEventListener('click', () => {
            this.fechar();
        });
        
        // Click fora do modal
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.fechar();
            }
        });
        
        // Imprimir
        this.container.querySelector('#btnImprimirComprovante').addEventListener('click', () => {
            this.imprimir();
        });
        
        // Nova venda
        this.container.querySelector('#btnNovaVenda').addEventListener('click', () => {
            this.fechar();
            this.emit('novaVenda');
        });
        
        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container.classList.contains('active')) {
                this.fechar();
            }
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Abre o comprovante com os dados da venda
     * @param {Object} venda - Dados da venda
     */
    abrir(venda) {
        this.venda = venda;
        this.render();
        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    fechar() {
        this.container.classList.remove('active');
        document.body.style.overflow = '';
        this.emit('fechar');
    }

    imprimir() {
        window.print();
        this.emit('imprimir', { vendaId: this.venda?.id });
    }

    // ========================================
    // RENDERIZAÇÃO
    // ========================================

    render() {
        if (!this.venda) return;
        
        // Número do pedido no header
        this.container.querySelector('#comprovanteNumeroPedido').textContent = 
            this.venda.idPedido || this.venda.id_pedido || this.venda.id;
        
        // Corpo do comprovante
        const body = this.container.querySelector('#comprovanteBody');
        body.innerHTML = `
            <!-- Cliente -->
            <div class="comprovante-secao">
                <h4>👤 Cliente</h4>
                <div class="cliente-info">
                    <div class="nome">${this.venda.cliente?.nome || this.venda.cliente || '---'}</div>
                    ${this.venda.cliente?.cpf ? `<div class="detalhe">CPF: ${this.venda.cliente.cpf}</div>` : ''}
                    ${this.venda.cliente?.telefone ? `<div class="detalhe">Tel: ${this.venda.cliente.telefone}</div>` : ''}
                </div>
            </div>
            
            <!-- Itens -->
            <div class="comprovante-secao">
                <h4>📦 Itens (${this.venda.itens?.length || 0})</h4>
                ${this.renderItens()}
            </div>
            
            <!-- Pagamentos -->
            <div class="comprovante-secao">
                <h4>💳 Forma de Pagamento</h4>
                ${this.renderPagamentos()}
            </div>
            
            <!-- Totais -->
            <div class="comprovante-totais">
                <div class="total-linha">
                    <span>Subtotal</span>
                    <span>R$ ${this.formatarValor(this.venda.subtotal || this.venda.total)}</span>
                </div>
                ${this.venda.desconto?.valor > 0 ? `
                    <div class="total-linha" style="color: #059669;">
                        <span>Desconto</span>
                        <span>- R$ ${this.formatarValor(this.venda.desconto.valor)}</span>
                    </div>
                ` : ''}
                <div class="total-linha destaque">
                    <span>Total</span>
                    <span>R$ ${this.formatarValor(this.venda.total)}</span>
                </div>
            </div>
            
            <!-- Status -->
            <div class="comprovante-status">
                <div class="badge">
                    ⏳ Aguardando Pagamento no Caixa
                </div>
                <div class="instrucao">
                    Apresente este comprovante no caixa para efetuar o pagamento
                </div>
            </div>
            
            <!-- Data/Hora -->
            <div style="text-align: center; margin-top: 16px; font-size: 0.8rem; color: #9ca3af;">
                ${this.formatarDataHora(new Date())}
            </div>
        `;
    }

    renderItens() {
        if (!this.venda.itens || this.venda.itens.length === 0) {
            return '<p style="color: #9ca3af;">Nenhum item</p>';
        }
        
        return this.venda.itens.map(item => {
            const olho = item.olho ? `(${item.olho})` : '';
            const quantidade = item.quantidade || 1;
            const valor = item.precoTotal || item.preco_total || item.subtotal || 0;
            
            // ✅ CORRIGIDO: Parse tratamentos (pode vir como string JSON do banco)
            let tratamentosStr = '';
            let coloracaoNome = '';
            
            if (item.tratamentos) {
                try {
                    // Parse se for string JSON
                    const tratamentos = typeof item.tratamentos === 'string' 
                        ? JSON.parse(item.tratamentos) 
                        : item.tratamentos;
                    
                    if (Array.isArray(tratamentos) && tratamentos.length > 0) {
                        // Separa tratamentos normais e coloração
                        const tratamentosNormais = tratamentos.filter(t => t.tipo !== 'coloracao');
                        const coloracaoItem = tratamentos.find(t => t.tipo === 'coloracao');
                        
                        // Monta string de tratamentos
                        if (tratamentosNormais.length > 0) {
                            tratamentosStr = tratamentosNormais.map(t => t.nome || t).join(', ');
                        }
                        
                        // Pega coloração
                        if (coloracaoItem) {
                            coloracaoNome = coloracaoItem.nome || '';
                        }
                    }
                } catch (e) {
                    // Se falhar o parse, usa como string direta
                    tratamentosStr = String(item.tratamentos);
                }
            }
            
            // ✅ Coloração pode vir também como campo separado (vendas novas antes da correção)
            if (!coloracaoNome && item.coloracao) {
                try {
                    const coloracao = typeof item.coloracao === 'string'
                        ? JSON.parse(item.coloracao)
                        : item.coloracao;
                    coloracaoNome = coloracao.nome || coloracao;
                } catch (e) {
                    coloracaoNome = String(item.coloracao);
                }
            }
            
            return `
                <div class="comprovante-item">
                    <div class="item-desc">
                        <div class="nome">${quantidade}x ${item.descricao} ${olho}</div>
                        ${tratamentosStr ? `<div class="detalhe">${tratamentosStr}</div>` : ''}
                        ${coloracaoNome ? `<div class="detalhe">Coloração: ${coloracaoNome}</div>` : ''}
                    </div>
                    <div class="item-valor">R$ ${this.formatarValor(valor * quantidade)}</div>
                </div>
            `;
        }).join('');
    }

    renderPagamentos() {
        if (!this.venda.pagamentos || this.venda.pagamentos.length === 0) {
            return '<p style="color: #9ca3af;">Nenhum pagamento</p>';
        }
        
        return this.venda.pagamentos.map(pag => {
            const icon = this.getIconePagamento(pag.forma);
            const nome = this.getNomePagamento(pag.forma);
            
            let detalhe = '';
            if (pag.parcelas > 1) {
                detalhe = `${pag.parcelas}x de R$ ${this.formatarValor(pag.valor / pag.parcelas)}`;
            }
            if (pag.bandeira) {
                detalhe += (detalhe ? ' • ' : '') + pag.bandeira;
            }
            
            return `
                <div class="pagamento-item">
                    <span class="icon">${icon}</span>
                    <div class="info">
                        <div class="forma">${nome}</div>
                        ${detalhe ? `<div class="detalhe">${detalhe}</div>` : ''}
                    </div>
                    <div class="valor">R$ ${this.formatarValor(pag.valor)}</div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // HELPERS
    // ========================================

    formatarValor(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatarDataHora(data) {
        return data.toLocaleDateString('pt-BR') + ' às ' + 
               data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    getIconePagamento(forma) {
        const icones = {
            'DINHEIRO': '💵',
            'CREDITO': '💳',
            'DEBITO': '💳',
            'PIX': '📱',
            'CHEQUE': '📄',
            'CONVENIO': '🏢',
            'CREDIARIO': '📋',
            'SALDO_RECEBER': '⏳'
        };
        return icones[forma] || '💰';
    }

    getNomePagamento(forma) {
        const nomes = {
            'DINHEIRO': 'Dinheiro',
            'CREDITO': 'Cartão de Crédito',
            'DEBITO': 'Cartão de Débito',
            'PIX': 'PIX',
            'CHEQUE': 'Cheque',
            'CONVENIO': 'Convênio',
            'CREDIARIO': 'Crediário',
            'SALDO_RECEBER': 'Pagar na Retirada'
        };
        return nomes[forma] || forma;
    }
}
