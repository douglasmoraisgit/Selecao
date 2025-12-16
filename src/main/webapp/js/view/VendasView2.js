/**
 * VendasView.js
 * View para Listagem e Gestão de Vendas
 * 
 * FUNCIONALIDADES:
 * - Listar vendas com filtros (status, período, busca)
 * - Visualizar detalhes da venda
 * - Reimprimir comprovante
 * - Excluir/Cancelar venda
 * 
 * EVENTOS EMITIDOS:
 * - 'abrir'            → {}
 * - 'fechar'           → {}
 * - 'buscar'           → { termo }
 * - 'filtrar'          → { status, periodo }
 * - 'verDetalhes'      → { venda }
 * - 'imprimir'         → { venda }
 * - 'excluir'          → { vendaId }
 * - 'irParaCaixa'      → { vendaId }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class VendasView extends EventEmitter {
    
    constructor() {
        super();
        this.container = null;
        this.vendas = [];
        this.vendaSelecionada = null;
        this.filtros = {
            status: '',
            periodo: 'mes',
            termo: ''
        };
        
        this.injectStyles();
        this.createModal();
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if (document.getElementById('vendas-lista-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'vendas-lista-styles';
        style.textContent = `
            /* ========================================
               MODAL DE VENDAS
            ======================================== */
            
            .vendas-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .vendas-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .vendas-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: #f8fafc;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                z-index: 10001;
                width: 95%;
                max-width: 1100px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .vendas-overlay.active .vendas-modal {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            /* Header */
            .vendas-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                border-radius: 16px 16px 0 0;
                color: white;
            }
            
            .vendas-header h2 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .vendas-stats {
                display: flex;
                gap: 20px;
            }
            
            .vendas-stat {
                text-align: center;
            }
            
            .vendas-stat .valor {
                font-size: 1.4rem;
                font-weight: 700;
            }
            
            .vendas-stat .label {
                font-size: 0.75rem;
                opacity: 0.9;
            }
            
            .vendas-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .vendas-close:hover {
                background: rgba(255,255,255,0.3);
            }
            
            /* Toolbar */
            .vendas-toolbar {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px 24px;
                background: white;
                border-bottom: 1px solid #e5e7eb;
                flex-wrap: wrap;
            }
            
            .vendas-search {
                flex: 1;
                min-width: 200px;
                position: relative;
            }
            
            .vendas-search input {
                width: 100%;
                padding: 10px 16px 10px 40px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.95rem;
            }
            
            .vendas-search input:focus {
                outline: none;
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
            
            .vendas-search::before {
                content: '🔍';
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1rem;
            }
            
            .vendas-filtros {
                display: flex;
                gap: 8px;
            }
            
            .filtro-btn {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s;
            }
            
            .filtro-btn:hover {
                border-color: #2563eb;
            }
            
            .filtro-btn.active {
                background: #2563eb;
                color: white;
                border-color: #2563eb;
            }
            
            .filtro-select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.85rem;
            }
            
            /* Conteúdo */
            .vendas-content {
                flex: 1;
                display: grid;
                grid-template-columns: 1fr 380px;
                overflow: hidden;
            }
            
            /* Lista de Vendas */
            .vendas-lista {
                overflow-y: auto;
                padding: 16px;
            }
            
            .venda-card {
                background: white;
                border-radius: 10px;
                padding: 16px;
                margin-bottom: 12px;
                border: 2px solid transparent;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .venda-card:hover {
                border-color: #bfdbfe;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
            }
            
            .venda-card.selected {
                border-color: #2563eb;
                background: #eff6ff;
            }
            
            .venda-card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }
            
            .venda-numero {
                font-size: 1.1rem;
                font-weight: 700;
                color: #2563eb;
            }
            
            .venda-data {
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .venda-status {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            .venda-status.pendente {
                background: #fef3c7;
                color: #92400e;
            }
            
            .venda-status.parcial {
                background: #dbeafe;
                color: #1e40af;
            }
            
            .venda-status.pago {
                background: #d1fae5;
                color: #065f46;
            }
            
            .venda-status.cancelado {
                background: #fee2e2;
                color: #991b1b;
            }
            
            .venda-card-body {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .venda-cliente {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .cliente-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.85rem;
            }
            
            .cliente-info .nome {
                font-weight: 600;
                color: #111827;
            }
            
            .cliente-info .meta {
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .venda-total {
                text-align: right;
            }
            
            .venda-total .valor {
                font-size: 1.2rem;
                font-weight: 700;
                color: #059669;
            }
            
            .venda-total .label {
                font-size: 0.75rem;
                color: #6b7280;
            }
            
            /* Painel de Detalhes */
            .vendas-detalhes {
                background: white;
                border-left: 1px solid #e5e7eb;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .detalhes-empty {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #9ca3af;
                padding: 40px;
                text-align: center;
            }
            
            .detalhes-empty .icon {
                font-size: 4rem;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            .detalhes-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                background: #eff6ff;
            }
            
            .detalhes-header h3 {
                margin: 0 0 4px 0;
                font-size: 1.1rem;
                color: #2563eb;
            }
            
            .detalhes-header .meta {
                font-size: 0.85rem;
                color: #6b7280;
            }
            
            .detalhes-content {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            }
            
            /* Seções do detalhe */
            .detalhe-secao {
                margin-bottom: 20px;
            }
            
            .detalhe-secao h4 {
                font-size: 0.8rem;
                text-transform: uppercase;
                color: #6b7280;
                margin: 0 0 10px 0;
                padding-bottom: 6px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detalhe-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 0.9rem;
                border-bottom: 1px dashed #f3f4f6;
            }
            
            .detalhe-item:last-child {
                border-bottom: none;
            }
            
            .detalhe-item .label {
                color: #6b7280;
            }
            
            .detalhe-item .valor {
                font-weight: 500;
                color: #111827;
            }
            
            /* Totalizador */
            .detalhe-totais {
                background: #f0fdf4;
                padding: 12px;
                border-radius: 8px;
                margin-top: 16px;
            }
            
            .detalhe-totais .total-linha {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
            }
            
            .detalhe-totais .total-linha.destaque {
                font-weight: 700;
                font-size: 1.1rem;
                color: #059669;
                border-top: 1px solid #bbf7d0;
                padding-top: 8px;
                margin-top: 4px;
            }
            
            /* Footer de ações */
            .detalhes-footer {
                padding: 16px;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .detalhes-footer .btn-row {
                display: flex;
                gap: 8px;
            }
            
            .btn-acao {
                flex: 1;
                padding: 10px 12px;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s;
            }
            
            .btn-imprimir {
                background: #2563eb;
                color: white;
            }
            
            .btn-imprimir:hover {
                background: #1d4ed8;
            }
            
            .btn-caixa {
                background: #7c3aed;
                color: white;
            }
            
            .btn-caixa:hover {
                background: #6d28d9;
            }
            
            .btn-excluir {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .btn-excluir:hover {
                background: #fecaca;
            }
            
            /* Lista vazia */
            .lista-vazia {
                text-align: center;
                padding: 60px 20px;
                color: #9ca3af;
            }
            
            .lista-vazia .icon {
                font-size: 4rem;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            .lista-vazia h3 {
                color: #6b7280;
                margin-bottom: 8px;
            }
            
            /* Loading */
            .vendas-loading {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .vendas-loading .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e5e7eb;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Responsivo */
            @media (max-width: 900px) {
                .vendas-content {
                    grid-template-columns: 1fr;
                }
                
                .vendas-detalhes {
                    position: fixed;
                    top: 0;
                    right: -100%;
                    width: 100%;
                    height: 100%;
                    z-index: 10002;
                    border-left: none;
                    transition: right 0.3s ease;
                }
                
                .vendas-detalhes.open {
                    right: 0;
                }
                
                .vendas-stats {
                    display: none;
                }
            }
            
            @media (max-width: 640px) {
                .vendas-modal {
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
                
                .vendas-header {
                    border-radius: 0;
                }
                
                .vendas-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .vendas-filtros {
                    overflow-x: auto;
                    padding-bottom: 8px;
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
        this.container.className = 'vendas-overlay';
        this.container.innerHTML = `
            <div class="vendas-modal">
                <div class="vendas-header">
                    <h2>🧾 Vendas</h2>
                    <div class="vendas-stats">
                        <div class="vendas-stat">
                            <div class="valor" id="statTotalVendas">0</div>
                            <div class="label">Vendas</div>
                        </div>
                        <div class="vendas-stat">
                            <div class="valor" id="statValorTotal">R$ 0</div>
                            <div class="label">Total</div>
                        </div>
                    </div>
                    <button class="vendas-close" title="Fechar">✕</button>
                </div>
                
                <div class="vendas-toolbar">
                    <div class="vendas-search">
                        <input type="text" id="vendasSearch" placeholder="Buscar por cliente, pedido ou CPF...">
                    </div>
                    <div class="vendas-filtros">
                        <button class="filtro-btn active" data-status="">Todas</button>
                        <button class="filtro-btn" data-status="Pendente">Pendentes</button>
                        <button class="filtro-btn" data-status="Pago">Pagas</button>
                        <button class="filtro-btn" data-status="Cancelado">Canceladas</button>
                    </div>
                    <select class="filtro-select" id="filtroPeriodo">
                        <option value="hoje">Hoje</option>
                        <option value="semana">Esta Semana</option>
                        <option value="mes" selected>Este Mês</option>
                        <option value="todos">Todos</option>
                    </select>
                </div>
                
                <div class="vendas-content">
                    <div class="vendas-lista" id="vendasLista">
                        <!-- Lista de vendas -->
                    </div>
                    
                    <div class="vendas-detalhes" id="vendasDetalhes">
                        <div class="detalhes-empty">
                            <div class="icon">📋</div>
                            <h3>Selecione uma venda</h3>
                            <p>Clique em uma venda para ver os detalhes</p>
                        </div>
                    </div>
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
        this.container.querySelector('.vendas-close').addEventListener('click', () => this.fechar());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.fechar();
        });
        
        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container.classList.contains('active')) {
                this.fechar();
            }
        });
        
        // Busca
        let searchTimeout;
        this.container.querySelector('#vendasSearch').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filtros.termo = e.target.value;
                this.emit('buscar', { termo: e.target.value });
            }, 300);
        });
        
        // Filtros de status
        this.container.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtros.status = btn.dataset.status;
                this.emit('filtrar', { ...this.filtros });
            });
        });
        
        // Filtro de período
        this.container.querySelector('#filtroPeriodo').addEventListener('change', (e) => {
            this.filtros.periodo = e.target.value;
            this.emit('filtrar', { ...this.filtros });
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    abrir() {
        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.emit('abrir');
    }

    fechar() {
        this.container.classList.remove('active');
        document.body.style.overflow = '';
        this.vendaSelecionada = null;
        this.emit('fechar');
    }

    showLoading() {
        this.container.querySelector('#vendasLista').innerHTML = `
            <div class="vendas-loading">
                <div class="spinner"></div>
                <p>Carregando vendas...</p>
            </div>
        `;
    }

    // ========================================
    // RENDERIZAÇÃO
    // ========================================

    render(vendas) {
        this.vendas = vendas || [];
        this.renderLista();
        this.renderStats();
        
        // Atualiza detalhes se venda selecionada ainda existe
        if (this.vendaSelecionada) {
            const ainda = this.vendas.find(v => v.id === this.vendaSelecionada.id);
            if (ainda) {
                this.renderDetalhes(ainda);
            } else {
                this.vendaSelecionada = null;
                this.renderDetalhesVazio();
            }
        }
    }

    renderStats() {
        const total = this.vendas.length;
        const valorTotal = this.vendas.reduce((sum, v) => sum + (v.total || 0), 0);
        
        this.container.querySelector('#statTotalVendas').textContent = total;
        this.container.querySelector('#statValorTotal').textContent = `R$ ${this.formatarValor(valorTotal)}`;
    }

    renderLista() {
        const container = this.container.querySelector('#vendasLista');
        
        if (this.vendas.length === 0) {
            container.innerHTML = `
                <div class="lista-vazia">
                    <div class="icon">🧾</div>
                    <h3>Nenhuma venda encontrada</h3>
                    <p>Tente ajustar os filtros</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.vendas.map(venda => this.renderVendaCard(venda)).join('');
        
        // Bind clicks
        container.querySelectorAll('.venda-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                const venda = this.vendas.find(v => v.id === id);
                this.selecionarVenda(venda);
            });
        });
    }

    renderVendaCard(venda) {
        const statusClass = this.getStatusClass(venda.status_pagamento || venda.status);
        const statusLabel = venda.status === 'Cancelado' ? 'Cancelado' : (venda.status_pagamento || 'Pendente');
        const iniciais = this.getIniciais(venda.cliente);
        const isSelected = this.vendaSelecionada?.id === venda.id;
        
        return `
            <div class="venda-card ${isSelected ? 'selected' : ''}" data-id="${venda.id}">
                <div class="venda-card-header">
                    <div>
                        <span class="venda-numero">#${venda.id_pedido || venda.id}</span>
                        <div class="venda-data">${this.formatarData(venda.data)}</div>
                    </div>
                    <span class="venda-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="venda-card-body">
                    <div class="venda-cliente">
                        <div class="cliente-avatar">${iniciais}</div>
                        <div class="cliente-info">
                            <div class="nome">${venda.cliente || 'Cliente não informado'}</div>
                            <div class="meta">${venda.qtd_itens || '?'} itens • ${venda.vendedor || ''}</div>
                        </div>
                    </div>
                    <div class="venda-total">
                        <div class="valor">R$ ${this.formatarValor(venda.total)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    selecionarVenda(venda) {
        this.vendaSelecionada = venda;
        
        // Atualiza visual da lista
        this.container.querySelectorAll('.venda-card').forEach(card => {
            card.classList.toggle('selected', parseInt(card.dataset.id) === venda.id);
        });
        
        // Renderiza detalhes
        this.renderDetalhes(venda);
        
        // Em mobile, abre painel
        this.container.querySelector('#vendasDetalhes').classList.add('open');
        
        this.emit('verDetalhes', { venda });
    }

    renderDetalhes(venda) {
        const container = this.container.querySelector('#vendasDetalhes');
        const isCancelado = venda.status === 'Cancelado';
        const isPago = venda.status_pagamento === 'Pago';
        
        container.innerHTML = `
            <div class="detalhes-header">
                <h3>Venda #${venda.id_pedido || venda.id}</h3>
                <div class="meta">${this.formatarData(venda.data)}</div>
            </div>
            
            <div class="detalhes-content">
                <!-- Cliente -->
                <div class="detalhe-secao">
                    <h4>👤 Cliente</h4>
                    <div class="detalhe-item">
                        <span class="label">Nome</span>
                        <span class="valor">${venda.cliente || '---'}</span>
                    </div>
                    ${venda.cpf ? `
                        <div class="detalhe-item">
                            <span class="label">CPF</span>
                            <span class="valor">${venda.cpf}</span>
                        </div>
                    ` : ''}
                    ${venda.telefone ? `
                        <div class="detalhe-item">
                            <span class="label">Telefone</span>
                            <span class="valor">${venda.telefone}</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Itens -->
                <div class="detalhe-secao">
                    <h4>📦 Itens (${venda.itens?.length || venda.qtd_itens || 0})</h4>
                    ${this.renderItensResumo(venda.itens || [])}
                </div>
                
                <!-- Pagamentos -->
                <div class="detalhe-secao">
                    <h4>💳 Pagamentos</h4>
                    ${this.renderPagamentosResumo(venda.pagamentos || [])}
                </div>
                
                <!-- Totais -->
                <div class="detalhe-totais">
                    <div class="total-linha">
                        <span>Subtotal</span>
                        <span>R$ ${this.formatarValor(venda.subtotal || venda.total)}</span>
                    </div>
                    ${venda.desconto > 0 ? `
                        <div class="total-linha" style="color: #059669;">
                            <span>Desconto</span>
                            <span>- R$ ${this.formatarValor(venda.desconto)}</span>
                        </div>
                    ` : ''}
                    <div class="total-linha destaque">
                        <span>Total</span>
                        <span>R$ ${this.formatarValor(venda.total)}</span>
                    </div>
                </div>
                
                <!-- Status -->
                <div style="margin-top: 16px; padding: 12px; background: ${this.getStatusBackground(venda)}; border-radius: 8px; text-align: center;">
                    <span style="font-weight: 600;">
                        ${this.getStatusIcon(venda)} ${this.getStatusTexto(venda)}
                    </span>
                </div>
            </div>
            
            <div class="detalhes-footer">
                <div class="btn-row">
                    <button class="btn-acao btn-imprimir" data-id="${venda.id}">
                        🖨️ Imprimir
                    </button>
                    ${!isPago && !isCancelado ? `
                        <button class="btn-acao btn-caixa" data-id="${venda.id}">
                            🏧 Ir para Caixa
                        </button>
                    ` : ''}
                </div>
                ${!isCancelado ? `
                    <button class="btn-acao btn-excluir" data-id="${venda.id}">
                        🗑️ Cancelar Venda
                    </button>
                ` : ''}
            </div>
        `;
        
        this.bindDetalhesEvents(venda);
    }

    renderItensResumo(itens) {
        if (!itens || itens.length === 0) {
            return '<p style="color: #9ca3af; font-size: 0.9rem;">Carregando itens...</p>';
        }
        
        return itens.slice(0, 4).map(item => `
            <div class="detalhe-item">
                <span class="label">${item.quantidade}x ${item.descricao}</span>
                <span class="valor">R$ ${this.formatarValor(item.subtotal)}</span>
            </div>
        `).join('') + (itens.length > 4 ? `
            <div class="detalhe-item" style="color: #6b7280;">
                <span class="label">+ ${itens.length - 4} mais itens...</span>
            </div>
        ` : '');
    }

    renderPagamentosResumo(pagamentos) {
        if (!pagamentos || pagamentos.length === 0) {
            return '<p style="color: #9ca3af; font-size: 0.9rem;">Carregando pagamentos...</p>';
        }
        
        return pagamentos.map(pag => {
            const icon = this.getIconePagamento(pag.forma_pagamento);
            const nome = this.getNomePagamento(pag.forma_pagamento);
            const statusPag = pag.status === 'CONFIRMADO' ? '✓' : '⏳';
            
            return `
                <div class="detalhe-item">
                    <span class="label">${icon} ${nome} ${statusPag}</span>
                    <span class="valor">R$ ${this.formatarValor(pag.valor)}</span>
                </div>
            `;
        }).join('');
    }

    renderDetalhesVazio() {
        this.container.querySelector('#vendasDetalhes').innerHTML = `
            <div class="detalhes-empty">
                <div class="icon">📋</div>
                <h3>Selecione uma venda</h3>
                <p>Clique em uma venda para ver os detalhes</p>
            </div>
        `;
    }

    bindDetalhesEvents(venda) {
        const container = this.container.querySelector('#vendasDetalhes');
        
        // Imprimir
        const btnImprimir = container.querySelector('.btn-imprimir');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => {
                this.emit('imprimir', { venda });
            });
        }
        
        // Ir para caixa
        const btnCaixa = container.querySelector('.btn-caixa');
        if (btnCaixa) {
            btnCaixa.addEventListener('click', () => {
                this.emit('irParaCaixa', { vendaId: venda.id });
            });
        }
        
        // Excluir/Cancelar
        const btnExcluir = container.querySelector('.btn-excluir');
        if (btnExcluir) {
            btnExcluir.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja cancelar a venda #${venda.id_pedido || venda.id}?`)) {
                    this.emit('excluir', { vendaId: venda.id });
                }
            });
        }
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

    formatarData(data) {
        if (!data) return '';
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    getIniciais(nome) {
        if (!nome) return '?';
        const partes = nome.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    }

    getStatusClass(status) {
        const map = {
            'Pendente': 'pendente',
            'Parcial': 'parcial',
            'Pago': 'pago',
            'Cancelado': 'cancelado'
        };
        return map[status] || 'pendente';
    }

    getStatusBackground(venda) {
        if (venda.status === 'Cancelado') return '#fee2e2';
        if (venda.status_pagamento === 'Pago') return '#d1fae5';
        if (venda.status_pagamento === 'Parcial') return '#dbeafe';
        return '#fef3c7';
    }

    getStatusIcon(venda) {
        if (venda.status === 'Cancelado') return '❌';
        if (venda.status_pagamento === 'Pago') return '✅';
        if (venda.status_pagamento === 'Parcial') return '⏳';
        return '⏳';
    }

    getStatusTexto(venda) {
        if (venda.status === 'Cancelado') return 'Venda Cancelada';
        if (venda.status_pagamento === 'Pago') return 'Pagamento Confirmado';
        if (venda.status_pagamento === 'Parcial') return 'Pagamento Parcial';
        return 'Aguardando Pagamento';
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
            'CREDITO': 'Crédito',
            'DEBITO': 'Débito',
            'PIX': 'PIX',
            'CHEQUE': 'Cheque',
            'CONVENIO': 'Convênio',
            'CREDIARIO': 'Crediário',
            'SALDO_RECEBER': 'Saldo'
        };
        return nomes[forma] || forma;
    }
}
