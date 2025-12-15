/**
 * OrcamentosView.js
 * View para listar e gerenciar orçamentos salvos
 * 
 * FUNCIONALIDADES:
 * - Lista orçamentos em cards
 * - Busca por cliente
 * - Filtro por status
 * - Expande detalhes do orçamento
 * - Recupera orçamento para o carrinho
 * - Converte orçamento em venda
 * 
 * EVENTOS EMITIDOS:
 * - 'buscar'           → { termo }
 * - 'filtrar'          → { status }
 * - 'recuperar'        → { orcamento }
 * - 'converter'        → { orcamento }
 * - 'excluir'          → { id }
 * - 'fechar'           → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class OrcamentosView extends EventEmitter {
    
    constructor() {
        super();
        this.container = null;
        this.orcamentos = [];
        this.filtroStatus = 'TODOS';
        this.termoBusca = '';
        this.orcamentoExpandido = null;
        
        this.injectStyles();
        this.createModal();
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if (document.getElementById('orcamentos-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'orcamentos-styles';
        style.textContent = `
            /* ========================================
               MODAL ORÇAMENTOS
            ======================================== */
            
            .orcamentos-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .orcamentos-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .orcamentos-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                z-index: 10001;
                width: 95%;
                max-width: 1100px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .orcamentos-overlay.active .orcamentos-modal {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            /* Header */
            .orcamentos-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
                background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                border-radius: 16px 16px 0 0;
                color: white;
            }
            
            .orcamentos-header h2 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .orcamentos-header h2 .icon {
                font-size: 1.5rem;
            }
            
            .orcamentos-close {
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
            
            .orcamentos-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            /* Toolbar de busca/filtros */
            .orcamentos-toolbar {
                display: flex;
                gap: 12px;
                padding: 16px 24px;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                flex-wrap: wrap;
            }
            
            .orcamentos-search {
                flex: 1;
                min-width: 200px;
                position: relative;
            }
            
            .orcamentos-search input {
                width: 100%;
                padding: 10px 16px 10px 42px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 0.95rem;
                transition: all 0.2s;
            }
            
            .orcamentos-search input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .orcamentos-search .search-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.1rem;
                opacity: 0.5;
            }
            
            .orcamentos-filtros {
                display: flex;
                gap: 8px;
            }
            
            .filtro-btn {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 20px;
                background: white;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .filtro-btn:hover {
                border-color: #6366f1;
                color: #6366f1;
            }
            
            .filtro-btn.active {
                background: #6366f1;
                border-color: #6366f1;
                color: white;
            }
            
            .filtro-btn .count {
                background: rgba(0,0,0,0.1);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.75rem;
            }
            
            .filtro-btn.active .count {
                background: rgba(255,255,255,0.2);
            }
            
            /* Lista de orçamentos */
            .orcamentos-lista {
                flex: 1;
                overflow-y: auto;
                padding: 16px 24px;
            }
            
            .orcamentos-empty {
                text-align: center;
                padding: 60px 20px;
                color: #6b7280;
            }
            
            .orcamentos-empty .icon {
                font-size: 4rem;
                margin-bottom: 16px;
                opacity: 0.3;
            }
            
            .orcamentos-empty h3 {
                margin: 0 0 8px 0;
                color: #374151;
            }
            
            /* Card de orçamento */
            .orcamento-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                margin-bottom: 12px;
                overflow: hidden;
                transition: all 0.2s;
            }
            
            .orcamento-card:hover {
                border-color: #6366f1;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
            }
            
            .orcamento-card.expanded {
                border-color: #6366f1;
            }
            
            .orcamento-header {
                display: grid;
                grid-template-columns: 56px 1fr auto auto;
                align-items: center;
                padding: 20px;
                cursor: pointer;
                gap: 20px;
            }
            
            .orcamento-avatar {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.3rem;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .orcamento-info {
                flex: 1;
                min-width: 0;
            }
            
            .orcamento-cliente {
                font-weight: 600;
                color: #111827;
                font-size: 1.1rem;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .orcamento-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                font-size: 0.9rem;
                color: #6b7280;
            }
            
            .orcamento-meta span {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .orcamento-valor {
                text-align: right;
                min-width: 140px;
            }
            
            .orcamento-total {
                font-size: 1.4rem;
                font-weight: 700;
                color: #059669;
            }
            
            .orcamento-status {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                margin-top: 4px;
            }
            
            .orcamento-status.PENDENTE {
                background: #fef3c7;
                color: #d97706;
            }
            
            .orcamento-status.CONVERTIDO {
                background: #d1fae5;
                color: #059669;
            }
            
            .orcamento-status.EXPIRADO {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .orcamento-expand {
                color: #9ca3af;
                font-size: 1.2rem;
                transition: transform 0.2s;
            }
            
            .orcamento-card.expanded .orcamento-expand {
                transform: rotate(180deg);
            }
            
            /* Detalhes do orçamento */
            .orcamento-detalhes {
                display: none;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
            }
            
            .orcamento-card.expanded .orcamento-detalhes {
                display: block;
            }
            
            .orcamento-itens {
                padding: 20px 24px;
            }
            
            .orcamento-itens h4 {
                margin: 0 0 16px 0;
                font-size: 0.95rem;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .item-lista {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .item-row {
                display: grid;
                grid-template-columns: 40px 1fr auto;
                align-items: center;
                gap: 16px;
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .item-olho {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 700;
                flex-shrink: 0;
            }
            
            .item-olho.OD {
                background: #dbeafe;
                color: #2563eb;
            }
            
            .item-olho.OE {
                background: #fce7f3;
                color: #db2777;
            }
            
            .item-olho.PROD {
                background: #f3e8ff;
                color: #9333ea;
            }
            
            .item-desc {
                flex: 1;
                min-width: 0;
            }
            
            .item-desc .nome {
                font-weight: 500;
                color: #111827;
                font-size: 0.95rem;
                margin-bottom: 4px;
            }
            
            .item-desc .detalhes {
                font-size: 0.85rem;
                color: #6b7280;
            }
            
            .item-valor {
                font-weight: 600;
                font-size: 1rem;
                color: #059669;
                white-space: nowrap;
                text-align: right;
                min-width: 100px;
            }
            
            /* Item completo com extras */
            .item-row-completo {
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                overflow: hidden;
            }
            
            .item-row-completo .item-row {
                border: none;
                border-radius: 0;
            }
            
            /* Extras (tratamentos e coloração) */
            .item-extras {
                padding: 8px 16px 12px 68px;
                border-top: 1px dashed #e5e7eb;
            }
            
            .extra-tratamentos,
            .extra-coloracao {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .extra-label {
                font-size: 0.8rem;
                color: #6b7280;
                font-weight: 500;
            }
            
            .extra-tag {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 16px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .extra-tag.tratamento {
                background: #ede9fe;
                color: #7c3aed;
            }
            
            .extra-tag.coloracao {
                background: #fce7f3;
                color: #db2777;
            }
            
            .extra-valor {
                font-size: 0.75rem;
                opacity: 0.8;
            }
            
            .cor-amostra {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                border: 2px solid rgba(255,255,255,0.5);
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            
            /* Ações do orçamento */
            .orcamento-acoes {
                display: flex;
                gap: 8px;
                padding: 12px 16px;
                border-top: 1px solid #e5e7eb;
                background: white;
            }
            
            .orcamento-btn {
                flex: 1;
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .orcamento-btn-recuperar {
                background: #6366f1;
                color: white;
            }
            
            .orcamento-btn-recuperar:hover {
                background: #4f46e5;
            }
            
            .orcamento-btn-converter {
                background: #059669;
                color: white;
            }
            
            .orcamento-btn-converter:hover {
                background: #047857;
            }
            
            .orcamento-btn-imprimir {
                background: #0ea5e9;
                color: white;
            }
            
            .orcamento-btn-imprimir:hover {
                background: #0284c7;
            }
            
            .orcamento-btn-excluir {
                background: #fee2e2;
                color: #dc2626;
                flex: 0;
                padding: 10px 14px;
            }
            
            .orcamento-btn-excluir:hover {
                background: #fecaca;
            }
            
            /* Loading */
            .orcamentos-loading {
                text-align: center;
                padding: 40px;
            }
            
            .orcamentos-loading .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e5e7eb;
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Responsivo */
            @media (max-width: 640px) {
                .orcamentos-modal {
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
                
                .orcamentos-header {
                    border-radius: 0;
                }
                
                .orcamentos-toolbar {
                    flex-direction: column;
                }
                
                .orcamentos-filtros {
                    overflow-x: auto;
                    padding-bottom: 4px;
                }
                
                .orcamento-header {
                    flex-wrap: wrap;
                }
                
                .orcamento-valor {
                    width: 100%;
                    text-align: left;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #e5e7eb;
                }
                
                .orcamento-acoes {
                    flex-wrap: wrap;
                }
                
                .orcamento-btn {
                    min-width: calc(50% - 4px);
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
        this.container.className = 'orcamentos-overlay';
        this.container.innerHTML = `
            <div class="orcamentos-modal">
                <!-- Header -->
                <div class="orcamentos-header">
                    <h2>
                        <span class="icon">📋</span>
                        Orçamentos Salvos
                    </h2>
                    <button class="orcamentos-close" title="Fechar">✕</button>
                </div>
                
                <!-- Toolbar -->
                <div class="orcamentos-toolbar">
                    <div class="orcamentos-search">
                        <span class="search-icon">🔍</span>
                        <input type="text" placeholder="Buscar por cliente..." id="orcamentoBusca">
                    </div>
                    <div class="orcamentos-filtros">
                        <button class="filtro-btn active" data-status="TODOS">
                            Todos <span class="count" id="countTodos">0</span>
                        </button>
                        <button class="filtro-btn" data-status="PENDENTE">
                            ⏳ Pendentes <span class="count" id="countPendentes">0</span>
                        </button>
                        <button class="filtro-btn" data-status="CONVERTIDO">
                            ✅ Convertidos <span class="count" id="countConvertidos">0</span>
                        </button>
                        <button class="filtro-btn" data-status="EXPIRADO">
                            ⌛ Expirados <span class="count" id="countExpirados">0</span>
                        </button>
                    </div>
                </div>
                
                <!-- Lista -->
                <div class="orcamentos-lista" id="orcamentosLista">
                    <div class="orcamentos-loading">
                        <div class="spinner"></div>
                        <p>Carregando orçamentos...</p>
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
        const $ = (sel) => this.container.querySelector(sel);
        const $$ = (sel) => this.container.querySelectorAll(sel);
        
        // Fechar modal
        $('.orcamentos-close').addEventListener('click', () => this.fechar());
        
        // Fechar ao clicar fora
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
        let buscaTimeout;
        $('#orcamentoBusca').addEventListener('input', (e) => {
            clearTimeout(buscaTimeout);
            buscaTimeout = setTimeout(() => {
                this.termoBusca = e.target.value;
                this.emit('buscar', { termo: this.termoBusca });
                this.filtrarLista();
            }, 300);
        });
        
        // Filtros de status
        $$('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.filtro-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtroStatus = btn.dataset.status;
                this.emit('filtrar', { status: this.filtroStatus });
                this.filtrarLista();
            });
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Abre o modal de orçamentos
     */
    abrir() {
        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.emit('abrir');
    }

    /**
     * Fecha o modal
     */
    fechar() {
        this.container.classList.remove('active');
        document.body.style.overflow = '';
        this.emit('fechar');
    }

    /**
     * Renderiza a lista de orçamentos
     */
    render(orcamentos) {
        this.orcamentos = orcamentos || [];
        this.atualizarContadores();
        this.filtrarLista();
    }

    /**
     * Mostra estado de loading
     */
    showLoading() {
        const lista = this.container.querySelector('#orcamentosLista');
        lista.innerHTML = `
            <div class="orcamentos-loading">
                <div class="spinner"></div>
                <p>Carregando orçamentos...</p>
            </div>
        `;
    }

    /**
     * Mostra erro
     */
    showError(mensagem) {
        const lista = this.container.querySelector('#orcamentosLista');
        lista.innerHTML = `
            <div class="orcamentos-empty">
                <div class="icon">❌</div>
                <h3>Erro ao carregar</h3>
                <p>${mensagem}</p>
            </div>
        `;
    }

    // ========================================
    // MÉTODOS PRIVADOS
    // ========================================

    /**
     * Atualiza contadores dos filtros
     */
    atualizarContadores() {
        const counts = {
            TODOS: this.orcamentos.length,
            PENDENTE: this.orcamentos.filter(o => o.status === 'PENDENTE').length,
            CONVERTIDO: this.orcamentos.filter(o => o.status === 'CONVERTIDO').length,
            EXPIRADO: this.orcamentos.filter(o => o.status === 'EXPIRADO').length
        };
        
        this.container.querySelector('#countTodos').textContent = counts.TODOS;
        this.container.querySelector('#countPendentes').textContent = counts.PENDENTE;
        this.container.querySelector('#countConvertidos').textContent = counts.CONVERTIDO;
        this.container.querySelector('#countExpirados').textContent = counts.EXPIRADO;
    }

    /**
     * Filtra e renderiza a lista
     */
    filtrarLista() {
        let filtrados = [...this.orcamentos];
        
        // Filtra por status
        if (this.filtroStatus !== 'TODOS') {
            filtrados = filtrados.filter(o => o.status === this.filtroStatus);
        }
        
        // Filtra por termo de busca
        if (this.termoBusca) {
            const termo = this.termoBusca.toLowerCase();
            filtrados = filtrados.filter(o => 
                o.clienteNome?.toLowerCase().includes(termo) ||
                o.id?.toString().includes(termo)
            );
        }
        
        this.renderLista(filtrados);
    }

    /**
     * Renderiza a lista filtrada
     */
    renderLista(orcamentos) {
        const lista = this.container.querySelector('#orcamentosLista');
        
        if (orcamentos.length === 0) {
            lista.innerHTML = `
                <div class="orcamentos-empty">
                    <div class="icon">📋</div>
                    <h3>Nenhum orçamento encontrado</h3>
                    <p>${this.termoBusca ? 'Tente buscar com outros termos' : 'Salve um orçamento para vê-lo aqui'}</p>
                </div>
            `;
            return;
        }
        
        lista.innerHTML = orcamentos.map(orc => this.renderCard(orc)).join('');
        
        // Bind eventos dos cards
        this.bindCardEvents();
    }

    /**
     * Renderiza um card de orçamento
     */
    renderCard(orc) {
        const iniciais = this.getIniciais(orc.clienteNome || 'Cliente');
        const dataFormatada = this.formatarData(orc.dataHora);
        const totalItens = (orc.qtdLentes || 0) + (orc.qtdProdutos || 0);
        
        return `
            <div class="orcamento-card" data-id="${orc.id}">
                <div class="orcamento-header">
                    <div class="orcamento-avatar">${iniciais}</div>
                    <div class="orcamento-info">
                        <div class="orcamento-cliente">
                            ${orc.clienteNome || 'Cliente não informado'}
                        </div>
                        <div class="orcamento-meta">
                            <span>📅 ${dataFormatada}</span>
                            <span>🔢 #${orc.id}</span>
                            <span>📦 ${totalItens} ${totalItens === 1 ? 'item' : 'itens'}</span>
                        </div>
                    </div>
                    <div class="orcamento-valor">
                        <div class="orcamento-total">R$ ${this.formatarValor(orc.total)}</div>
                        <div class="orcamento-status ${orc.status}">${this.getStatusLabel(orc.status)}</div>
                    </div>
                    <div class="orcamento-expand">▼</div>
                </div>
                
                <div class="orcamento-detalhes">
                    ${this.renderItens(orc)}
                    
                    <div class="orcamento-acoes">
                        <button class="orcamento-btn orcamento-btn-recuperar" data-action="recuperar">
                            🛒 Carregar no Carrinho
                        </button>
                        <button class="orcamento-btn orcamento-btn-imprimir" data-action="imprimir">
                            🖨️ Imprimir / PDF
                        </button>
                        ${orc.status === 'PENDENTE' ? `
                            <button class="orcamento-btn orcamento-btn-converter" data-action="converter">
                                💳 Converter em Venda
                            </button>
                        ` : ''}
                        <button class="orcamento-btn orcamento-btn-excluir" data-action="excluir" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza os itens do orçamento
     */
    renderItens(orc) {
        const itens = orc.itens || [];
        
        if (itens.length === 0) {
            return `
                <div class="orcamento-itens">
                    <p style="color: #6b7280; text-align: center;">Sem itens detalhados</p>
                </div>
            `;
        }
        
        const lentes = itens.filter(i => i.tipo === 'lente');
        const produtos = itens.filter(i => i.tipo === 'produto');
        
        let html = '<div class="orcamento-itens">';
        
        if (lentes.length > 0) {
            html += `
                <h4>👓 Lentes (${lentes.length})</h4>
                <div class="item-lista">
                    ${lentes.map(item => {
                        // Parse tratamentos e coloração
                        const tratamentos = this.parseTratamentos(item.tratamentos);
                        const coloracao = this.parseColoracao(item.coloracao);
                        
                        return `
                            <div class="item-row-completo">
                                <div class="item-row">
                                    <div class="item-olho ${item.olho || 'OD'}">${item.olho || '?'}</div>
                                    <div class="item-desc">
                                        <div class="nome">${item.descricao || 'Lente'}</div>
                                        <div class="detalhes">
                                            ${item.marca || ''} 
                                            ${item.quantidade ? `• Qtd: ${item.quantidade}` : ''}
                                        </div>
                                    </div>
                                    <div class="item-valor">R$ ${this.formatarValor(item.precoTotal)}</div>
                                </div>
                                ${tratamentos.length > 0 ? `
                                    <div class="item-extras">
                                        <div class="extra-tratamentos">
                                            <span class="extra-label">💎 Tratamentos:</span>
                                            ${tratamentos.map(t => `
                                                <span class="extra-tag tratamento">
                                                    ${t.nome} 
                                                    <span class="extra-valor">(R$ ${this.formatarValor(t.valor)})</span>
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${coloracao ? `
                                    <div class="item-extras">
                                        <div class="extra-coloracao">
                                            <span class="extra-label">🎨 Coloração:</span>
                                            <span class="extra-tag coloracao">
                                                <span class="cor-amostra" style="background: ${coloracao.hex || '#888'}"></span>
                                                ${coloracao.nome}
                                                <span class="extra-valor">(R$ ${this.formatarValor(coloracao.valor)})</span>
                                            </span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        if (produtos.length > 0) {
            html += `
                <h4 style="margin-top: 20px;">📦 Produtos (${produtos.length})</h4>
                <div class="item-lista">
                    ${produtos.map(item => `
                        <div class="item-row">
                            <div class="item-olho PROD">📦</div>
                            <div class="item-desc">
                                <div class="nome">${item.descricao || 'Produto'}</div>
                                <div class="detalhes">
                                    ${item.marca || ''} 
                                    ${item.quantidade ? `• Qtd: ${item.quantidade}` : ''}
                                </div>
                            </div>
                            <div class="item-valor">R$ ${this.formatarValor(item.precoTotal)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Parse tratamentos de string JSON ou array
     */
    parseTratamentos(tratamentos) {
        if (!tratamentos) return [];
        try {
            if (typeof tratamentos === 'string') {
                return JSON.parse(tratamentos);
            }
            return Array.isArray(tratamentos) ? tratamentos : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Parse coloração de string JSON ou objeto
     */
    parseColoracao(coloracao) {
        if (!coloracao) return null;
        try {
            if (typeof coloracao === 'string') {
                return JSON.parse(coloracao);
            }
            return coloracao;
        } catch (e) {
            return null;
        }
    }

    /**
     * Bind eventos dos cards
     */
    bindCardEvents() {
        const cards = this.container.querySelectorAll('.orcamento-card');
        
        cards.forEach(card => {
            const id = card.dataset.id;
            const orcamento = this.orcamentos.find(o => o.id == id);
            
            // Expandir/colapsar
            const header = card.querySelector('.orcamento-header');
            header.addEventListener('click', () => {
                card.classList.toggle('expanded');
                this.orcamentoExpandido = card.classList.contains('expanded') ? id : null;
            });
            
            // Botões de ação
            const btns = card.querySelectorAll('.orcamento-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    
                    if (action === 'recuperar') {
                        this.emit('recuperar', { orcamento });
                    } else if (action === 'converter') {
                        this.emit('converter', { orcamento });
                    } else if (action === 'imprimir') {
                        this.emit('imprimir', { orcamento, id });
                    } else if (action === 'excluir') {
                        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
                            this.emit('excluir', { id });
                        }
                    }
                });
            });
        });
    }

    // ========================================
    // HELPERS
    // ========================================

    getIniciais(nome) {
        if (!nome) return '?';
        const partes = nome.trim().split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
        }
        return partes[0].substring(0, 2).toUpperCase();
    }

    formatarData(dataStr) {
        if (!dataStr) return 'Data não informada';
        try {
            const data = new Date(dataStr);
            return data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dataStr;
        }
    }

    formatarValor(valor) {
        if (valor === null || valor === undefined) return '0,00';
        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    getStatusLabel(status) {
        const labels = {
            'PENDENTE': '⏳ Pendente',
            'CONVERTIDO': '✅ Convertido',
            'EXPIRADO': '⌛ Expirado'
        };
        return labels[status] || status;
    }
}
