/**
 * CaixaView.js
 * Renderização da interface do módulo de Caixa
 * 
 * Responsabilidades:
 * - Renderizar header com info do operador
 * - Renderizar cards de totalizadores
 * - Renderizar lista de vendas pendentes
 * - Renderizar modal de detalhes/confirmação de pagamentos
 * - Gerenciar estados visuais (loading, empty, error)
 */

// ✅ Usa o EventEmitter do projeto existente
import EventEmitter from '../util/EventEmitter.js';

export class CaixaView extends EventEmitter {
    constructor() {
        super();
        
        this.container = null;
        this.elements = {};
        
        // Bind dos métodos
        this._onVendaClick = this._onVendaClick.bind(this);
        this._onAprovarPagamento = this._onAprovarPagamento.bind(this);
        this._onModalBodyClick = this._onModalBodyClick.bind(this);
        this._onFecharModal = this._onFecharModal.bind(this);
    }

    // ===========================================
    // INICIALIZAÇÃO
    // ===========================================
    
    init(containerId) {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error('Container não encontrado:', containerId);
            return;
        }
        
        this._injectStyles();
        this._renderStructure();
        this._cacheElements();
        this._bindEvents();
    }
    
    _cacheElements() {
        this.elements = {
            // Header
            operadorNome: document.getElementById('caixa-operador-nome'),
            lojaNome: document.getElementById('caixa-loja-nome'),
            dataAtual: document.getElementById('caixa-data-atual'),
            
            // Cards
            cardPendentes: document.getElementById('card-pendentes'),
            cardRecebido: document.getElementById('card-recebido'),
            cardDinheiro: document.getElementById('card-dinheiro'),
            cardCartoes: document.getElementById('card-cartoes'),
            
            // Lista de vendas
            vendasContainer: document.getElementById('vendas-container'),
            vendasLista: document.getElementById('vendas-lista'),
            vendasEmpty: document.getElementById('vendas-empty'),
            vendasLoading: document.getElementById('vendas-loading'),
            
            // Modal
            modal: document.getElementById('modal-pagamentos'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalContent: document.getElementById('modal-content'),
            modalHeader: document.getElementById('modal-header'),
            modalBody: document.getElementById('modal-body'),
            modalClose: document.getElementById('modal-close'),
            
            // Modal de autorização convênio
            modalConvenio: document.getElementById('modal-convenio'),
            inputAutorizacao: document.getElementById('input-autorizacao'),
            btnConfirmarConvenio: document.getElementById('btn-confirmar-convenio'),
            
            // Spinner global
            spinner: document.getElementById('caixa-spinner')
        };
    }

    // ===========================================
    // ESTRUTURA BASE
    // ===========================================
    
    _renderStructure() {
        this.container.innerHTML = `
            <div class="caixa-app">
                <!-- Header -->
                <header class="caixa-header">
                    <div class="header-left">
                        <div class="header-icon">💰</div>
                        <div class="header-info">
                            <h1>Caixa - Recebimentos</h1>
                            <span id="caixa-data-atual" class="header-date"></span>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="operador-info">
                            <span class="operador-label">OPERADOR:</span>
                            <span id="caixa-operador-nome" class="operador-nome">-</span>
                        </div>
                        <div class="loja-info">
                            <span class="loja-label">LOJA:</span>
                            <span id="caixa-loja-nome" class="loja-nome">-</span>
                        </div>
                        
                        <!-- Menu Dropdown -->
                        <div class="menu-dropdown">
                            <button id="btn-menu" class="btn-menu" title="Menu">
                                <span class="menu-icon">☰</span>
                            </button>
                            <div id="dropdown-content" class="dropdown-content">
                                <a href="#" id="menu-perfil" class="dropdown-item">
                                    <span class="item-icon">👤</span>
                                    <span>Meu Perfil</span>
                                </a>
                                <a href="#" id="menu-config" class="dropdown-item">
                                    <span class="item-icon">⚙️</span>
                                    <span>Configurações</span>
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" id="menu-logout" class="dropdown-item dropdown-logout">
                                    <span class="item-icon">🚪</span>
                                    <span>Sair</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </header>
                
                <!-- Cards de Totalizadores -->
                <section class="caixa-cards">
                    <div id="card-pendentes" class="card-stat card-pendente">
                        <div class="card-icon">⏳</div>
                        <div class="card-content">
                            <span class="card-value">0</span>
                            <span class="card-label">Vendas Pendentes</span>
                        </div>
                    </div>
                    
                    <div id="card-recebido" class="card-stat card-recebido">
                        <div class="card-icon">✅</div>
                        <div class="card-content">
                            <span class="card-value">R$ 0,00</span>
                            <span class="card-label">Recebido Hoje</span>
                        </div>
                    </div>
                    
                    <div id="card-dinheiro" class="card-stat card-dinheiro">
                        <div class="card-icon">💵</div>
                        <div class="card-content">
                            <span class="card-value">R$ 0,00</span>
                            <span class="card-label">Dinheiro</span>
                        </div>
                    </div>
                    
                    <div id="card-cartoes" class="card-stat card-cartoes">
                        <div class="card-icon">💳</div>
                        <div class="card-content">
                            <span class="card-value">R$ 0,00</span>
                            <span class="card-label">Cartões / Pix</span>
                        </div>
                    </div>
                </section>
                
                <!-- Lista de Vendas -->
                <section class="caixa-vendas">
                    <div class="vendas-header">
                        <h2>📋 Vendas Aguardando Recebimento</h2>
                        <button id="btn-atualizar" class="btn-refresh" title="Atualizar lista">
                            🔄 Atualizar
                        </button>
                    </div>
                    
                    <div id="vendas-container" class="vendas-container">
                        <!-- Loading -->
                        <div id="vendas-loading" class="vendas-loading" style="display: none;">
                            <div class="loading-spinner"></div>
                            <span>Carregando vendas...</span>
                        </div>
                        
                        <!-- Empty State -->
                        <div id="vendas-empty" class="vendas-empty" style="display: none;">
                            <div class="empty-icon">🎉</div>
                            <h3>Nenhuma venda pendente</h3>
                            <p>Todas as vendas do dia já foram recebidas!</p>
                        </div>
                        
                        <!-- Lista -->
                        <div id="vendas-lista" class="vendas-lista"></div>
                    </div>
                </section>
                
                <!-- Modal de Pagamentos -->
                <div id="modal-overlay" class="modal-overlay" style="display: none;">
                    <div id="modal-pagamentos" class="modal-pagamentos">
                        <div id="modal-header" class="modal-header">
                            <div class="modal-title">
                                <span class="modal-icon">💳</span>
                                <div class="modal-title-info">
                                    <h3 id="modal-venda-id">Venda #</h3>
                                    <span id="modal-cliente-nome">Cliente</span>
                                </div>
                            </div>
                            <button id="modal-close" class="modal-close">✕</button>
                        </div>
                        
                        <div class="modal-summary">
                            <div class="summary-item">
                                <span class="summary-label">Vendedor</span>
                                <span id="modal-vendedor" class="summary-value">-</span>
                            </div>
                            <div class="summary-item summary-total">
                                <span class="summary-label">Total da Venda</span>
                                <span id="modal-total" class="summary-value">R$ 0,00</span>
                            </div>
                        </div>
                        
                        <div class="modal-progress">
                            <div class="progress-info">
                                <span id="modal-progress-text">0 de 0 pagamentos aprovados</span>
                            </div>
                            <div class="progress-bar">
                                <div id="modal-progress-fill" class="progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <div id="modal-body" class="modal-body">
                            <!-- Pagamentos serão renderizados aqui -->
                        </div>
                        
                        <div class="modal-footer">
                            <button id="modal-btn-fechar" class="btn-secondary">Fechar</button>
                        </div>
                    </div>
                </div>
                
                <!-- Modal de Autorização Convênio -->
                <div id="modal-convenio" class="modal-convenio" style="display: none;">
                    <div class="modal-convenio-content">
                        <div class="modal-convenio-header">
                            <span>🏢 Autorização de Convênio</span>
                            <button class="modal-convenio-close" onclick="this.closest('.modal-convenio').style.display='none'">✕</button>
                        </div>
                        <div class="modal-convenio-body">
                            <label for="input-autorizacao">Número de Autorização:</label>
                            <input type="text" id="input-autorizacao" placeholder="Digite o número de autorização" maxlength="50" />
                            <p class="input-hint">Informe o código de autorização fornecido pelo convênio</p>
                        </div>
                        <div class="modal-convenio-footer">
                            <button class="btn-secondary" onclick="document.getElementById('modal-convenio').style.display='none'">Cancelar</button>
                            <button id="btn-confirmar-convenio" class="btn-primary">Confirmar</button>
                        </div>
                    </div>
                </div>
                
                <!-- Spinner Global -->
                <div id="caixa-spinner" class="caixa-spinner" style="display: none;">
                    <div class="spinner-content">
                        <div class="spinner-circle"></div>
                        <span>Processando...</span>
                    </div>
                </div>
                
                <!-- Toast de Notificações -->
                <div id="toast-container" class="toast-container"></div>
            </div>
        `;
    }
    
    _bindEvents() {
        // Botão atualizar
        const btnAtualizar = document.getElementById('btn-atualizar');
        if (btnAtualizar) {
            btnAtualizar.addEventListener('click', () => this.emit('refresh'));
        }
        
        // Fechar modal
        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', this._onFecharModal);
        }
        
        const btnFechar = document.getElementById('modal-btn-fechar');
        if (btnFechar) {
            btnFechar.addEventListener('click', this._onFecharModal);
        }
        
        // Fechar modal ao clicar no overlay
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.modalOverlay) {
                    this._onFecharModal();
                }
            });
        }
        
        // Tecla Escape fecha modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._onFecharModal();
                // Também fecha o dropdown
                const dropdown = document.getElementById('dropdown-content');
                if (dropdown) dropdown.classList.remove('show');
            }
        });
        
        // Menu Dropdown
        const btnMenu = document.getElementById('btn-menu');
        const dropdownContent = document.getElementById('dropdown-content');
        
        if (btnMenu && dropdownContent) {
            // Toggle dropdown ao clicar no botão
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownContent.classList.toggle('show');
            });
            
            // Fechar dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!btnMenu.contains(e.target) && !dropdownContent.contains(e.target)) {
                    dropdownContent.classList.remove('show');
                }
            });
        }
        
        // Menu Logout
        const menuLogout = document.getElementById('menu-logout');
        if (menuLogout) {
            menuLogout.addEventListener('click', (e) => {
                e.preventDefault();
                this._onLogout();
            });
        }
        
        // Menu Perfil (placeholder)
        const menuPerfil = document.getElementById('menu-perfil');
        if (menuPerfil) {
            menuPerfil.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Funcionalidade em desenvolvimento', 'info');
            });
        }
        
        // Menu Configurações (placeholder)
        const menuConfig = document.getElementById('menu-config');
        if (menuConfig) {
            menuConfig.addEventListener('click', (e) => {
                e.preventDefault();
                this.showToast('Funcionalidade em desenvolvimento', 'info');
            });
        }
    }
    
    /**
     * Realiza logout do usuário
     */
    _onLogout() {
        // Confirmação
        if (confirm('Deseja realmente sair do sistema?')) {
            // Limpar localStorage se houver
            localStorage.removeItem('caixa_state');
            
            // Redirecionar para logout
            window.location.href = 'LogoutServlet';
        }
    }

    // ===========================================
    // ATUALIZAÇÕES DE UI
    // ===========================================
    
    updateOperadorInfo(operador, loja) {
        if (this.elements.operadorNome) {
            this.elements.operadorNome.textContent = operador || '-';
        }
        if (this.elements.lojaNome) {
            this.elements.lojaNome.textContent = loja || '-';
        }
    }
    
    updateDataAtual(data) {
        if (this.elements.dataAtual) {
            const dataFormatada = this._formatDate(data);
            this.elements.dataAtual.textContent = dataFormatada;
        }
    }
    
    updateTotais(totais) {
        // Card Pendentes
        const pendentesValue = this.elements.cardPendentes?.querySelector('.card-value');
        if (pendentesValue) {
            pendentesValue.textContent = totais.quantidadePendentes || 0;
        }
        
        // Card Recebido
        const recebidoValue = this.elements.cardRecebido?.querySelector('.card-value');
        if (recebidoValue) {
            recebidoValue.textContent = this._formatCurrency(totais.valorRecebido || 0);
        }
        
        // Card Dinheiro
        const dinheiroValue = this.elements.cardDinheiro?.querySelector('.card-value');
        if (dinheiroValue) {
            dinheiroValue.textContent = this._formatCurrency(totais.porFormaPagamento?.dinheiro || 0);
        }
        
        // Card Cartões
        const cartoesValue = this.elements.cardCartoes?.querySelector('.card-value');
        if (cartoesValue) {
            const totalCartoes = (totais.porFormaPagamento?.pix || 0) + 
                                 (totais.porFormaPagamento?.debito || 0) + 
                                 (totais.porFormaPagamento?.credito || 0);
            cartoesValue.textContent = this._formatCurrency(totalCartoes);
        }
    }

    // ===========================================
    // LISTA DE VENDAS
    // ===========================================
    
    showLoading() {
        if (this.elements.vendasLoading) this.elements.vendasLoading.style.display = 'flex';
        if (this.elements.vendasLista) this.elements.vendasLista.style.display = 'none';
        if (this.elements.vendasEmpty) this.elements.vendasEmpty.style.display = 'none';
    }
    
    hideLoading() {
        if (this.elements.vendasLoading) this.elements.vendasLoading.style.display = 'none';
    }
    
    showEmpty() {
        if (this.elements.vendasEmpty) this.elements.vendasEmpty.style.display = 'flex';
        if (this.elements.vendasLista) this.elements.vendasLista.style.display = 'none';
    }
    
    renderVendas(vendas) {
        this.hideLoading();
        
        if (!vendas || vendas.length === 0) {
            this.showEmpty();
            return;
        }
        
        if (this.elements.vendasEmpty) this.elements.vendasEmpty.style.display = 'none';
        if (this.elements.vendasLista) this.elements.vendasLista.style.display = 'block';
        
        const html = vendas.map(venda => this._renderVendaCard(venda)).join('');
        
        if (this.elements.vendasLista) {
            this.elements.vendasLista.innerHTML = html;
            
            // Bind eventos dos cards
            this.elements.vendasLista.querySelectorAll('.venda-card').forEach(card => {
                card.addEventListener('click', this._onVendaClick);
            });
        }
    }
    
    _renderVendaCard(venda) {
        const statusClass = venda.statusPagamento?.toLowerCase() === 'pago' ? 'status-pago' : 'status-pendente';
        const statusText = venda.statusPagamento?.toLowerCase() === 'pago' ? 'Pago' : 'Pendente';
        
        return `
            <div class="venda-card ${statusClass}" data-id="${venda.idVenda}">
                <div class="venda-header">
                    <div class="venda-id">
                        <span class="venda-numero">#${venda.idPedido || venda.idVenda}</span>
                        <span class="venda-hora">${venda.hora || ''}</span>
                    </div>
                    <div class="venda-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="venda-body">
                    <div class="venda-cliente">
                        <span class="icon">👤</span>
                        <span class="text">${venda.cliente}</span>
                    </div>
                    <div class="venda-vendedor">
                        <span class="icon">🏷️</span>
                        <span class="text">Vendedor: ${venda.vendedor}</span>
                    </div>
                </div>
                
                <div class="venda-footer">
                    <div class="venda-valor">
                        <span class="valor-label">Total:</span>
                        <span class="valor-numero">${this._formatCurrency(venda.valorTotal)}</span>
                    </div>
                    <button class="btn-confirmar">
                        Confirmar Recebimento →
                    </button>
                </div>
            </div>
        `;
    }
    
    _onVendaClick(e) {
        const card = e.currentTarget;
        const idVenda = card.dataset.id;
        this.emit('vendaSelected', idVenda);
    }

    // ===========================================
    // MODAL DE PAGAMENTOS
    // ===========================================
    
    showModal(venda, pagamentos) {
        // Atualizar header do modal
        const modalVendaId = document.getElementById('modal-venda-id');
        const modalCliente = document.getElementById('modal-cliente-nome');
        const modalVendedor = document.getElementById('modal-vendedor');
        const modalTotal = document.getElementById('modal-total');
        
        if (modalVendaId) modalVendaId.textContent = `Venda #${venda.idPedido || venda.idVenda}`;
        if (modalCliente) modalCliente.textContent = venda.cliente;
        if (modalVendedor) modalVendedor.textContent = venda.vendedor;
        if (modalTotal) modalTotal.textContent = this._formatCurrency(venda.valorTotal);
        
        // Renderizar pagamentos
        this.renderPagamentos(pagamentos);
        
        // Mostrar modal
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideModal() {
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    renderPagamentos(pagamentos) {
        const modalBody = document.getElementById('modal-body');
        if (!modalBody) {
            console.error('❌ modal-body não encontrado!');
            return;
        }
        
        console.log('🔄 Renderizando pagamentos:', pagamentos.length);
        
        // Calcular progresso
        const total = pagamentos.length;
        const aprovados = pagamentos.filter(p => p.statusPagamento?.toLowerCase() === 'aprovado').length;
        
        this._updateProgress(aprovados, total);
        
        // Renderizar cada pagamento
        const html = pagamentos.map((pag, idx) => this._renderPagamentoCard(pag, idx)).join('');
        modalBody.innerHTML = html;
        
        // Event delegation - listener no container pai (não nos botões)
        // Remover listener anterior para evitar duplicação
        modalBody.removeEventListener('click', this._onModalBodyClick);
        modalBody.addEventListener('click', this._onModalBodyClick);
        
        console.log('✅ Event delegation configurado no modal-body');
    }
    
    /**
     * Handler de clique usando event delegation
     */
    _onModalBodyClick(e) {
        // Verificar se clicou em um botão de aprovar
        const btn = e.target.closest('.btn-aprovar');
        if (!btn) return;
        
        console.log('🖱️ Clique no botão aprovar detectado (delegation)!');
        
        const index = parseInt(btn.dataset.index);
        const isConvenio = btn.dataset.convenio === 'true';
        
        console.log(`  → Index: ${index}, Convênio: ${isConvenio}`);
        
        if (isConvenio) {
            this._showConvenioModal(index);
        } else {
            this.emit('aprovarPagamento', { index, numeroAutorizacao: null });
        }
    }
    
    _renderPagamentoCard(pagamento, index) {
        const isAprovado = pagamento.statusPagamento?.toLowerCase() === 'aprovado';
        const isConvenio = this._isConvenio(pagamento.tipoPagamento);
        const info = this._getInfoTipoPagamento(pagamento.tipoPagamento);
        
        const statusClass = isAprovado ? 'pag-aprovado' : 'pag-pendente';
        const statusBadge = isAprovado 
            ? '<span class="pag-badge aprovado">✓ Aprovado</span>'
            : '<span class="pag-badge pendente">⏳ Pendente</span>';
        
        const valorParcela = pagamento.parcelas > 1 
            ? `<span class="parcela-info">${pagamento.parcelas}x de ${this._formatCurrency(pagamento.valor / pagamento.parcelas)}</span>`
            : '';
        
        const autorizacao = pagamento.numeroAutorizacao 
            ? `<div class="pag-autorizacao">Autorização: <strong>${pagamento.numeroAutorizacao}</strong></div>`
            : '';
        
        const btnAprovar = isAprovado 
            ? '' 
            : `<button class="btn-aprovar" data-index="${index}" data-convenio="${isConvenio}">
                   ${isConvenio ? '🔐 Aprovar (Convênio)' : '✓ Aprovar Pagamento'}
               </button>`;
        
        return `
            <div class="pagamento-card ${statusClass}" data-index="${index}">
                <div class="pag-header" style="--pag-color: ${info.cor}">
                    <div class="pag-tipo">
                        <span class="pag-icon">${info.icone}</span>
                        <span class="pag-nome">${pagamento.tipoPagamento}</span>
                        ${pagamento.bandeira ? `<span class="pag-bandeira">(${pagamento.bandeira})</span>` : ''}
                    </div>
                    ${statusBadge}
                </div>
                
                <div class="pag-body">
                    <div class="pag-valor">
                        <span class="valor">${this._formatCurrency(pagamento.valor)}</span>
                        ${valorParcela}
                    </div>
                    ${autorizacao}
                </div>
                
                <div class="pag-footer">
                    ${btnAprovar}
                </div>
            </div>
        `;
    }
    
    _updateProgress(aprovados, total) {
        const progressText = document.getElementById('modal-progress-text');
        const progressFill = document.getElementById('modal-progress-fill');
        
        if (progressText) {
            progressText.textContent = `${aprovados} de ${total} pagamentos aprovados`;
        }
        
        if (progressFill) {
            const percent = total > 0 ? (aprovados / total) * 100 : 0;
            progressFill.style.width = `${percent}%`;
            
            if (percent === 100) {
                progressFill.classList.add('complete');
            } else {
                progressFill.classList.remove('complete');
            }
        }
    }
    
    _onAprovarPagamento(e) {
        console.log('🖱️ Clique no botão aprovar detectado!');
        const btn = e.currentTarget;
        const index = parseInt(btn.dataset.index);
        const isConvenio = btn.dataset.convenio === 'true';
        
        console.log(`  → Index: ${index}, Convênio: ${isConvenio}`);
        
        if (isConvenio) {
            this._showConvenioModal(index);
        } else {
            this.emit('aprovarPagamento', { index, numeroAutorizacao: null });
        }
    }
    
    _showConvenioModal(index) {
        const modal = document.getElementById('modal-convenio');
        const input = document.getElementById('input-autorizacao');
        const btnConfirmar = document.getElementById('btn-confirmar-convenio');
        
        if (!modal || !input || !btnConfirmar) return;
        
        input.value = '';
        modal.style.display = 'flex';
        input.focus();
        
        // Remover listeners antigos
        const newBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(newBtn, btnConfirmar);
        
        newBtn.addEventListener('click', () => {
            const numeroAutorizacao = input.value.trim();
            
            if (!numeroAutorizacao) {
                input.classList.add('error');
                return;
            }
            
            input.classList.remove('error');
            modal.style.display = 'none';
            this.emit('aprovarPagamento', { index, numeroAutorizacao });
        });
    }
    
    _onFecharModal() {
        this.hideModal();
        this.emit('modalClosed');
    }
    
    // Atualiza visualmente um pagamento após aprovação
    updatePagamentoAprovado(index) {
        const card = document.querySelector(`.pagamento-card[data-index="${index}"]`);
        if (!card) return;
        
        // Atualizar classes
        card.classList.remove('pag-pendente');
        card.classList.add('pag-aprovado');
        
        // Atualizar badge
        const badge = card.querySelector('.pag-badge');
        if (badge) {
            badge.className = 'pag-badge aprovado';
            badge.textContent = '✓ Aprovado';
        }
        
        // Remover botão
        const btn = card.querySelector('.btn-aprovar');
        if (btn) btn.remove();
        
        // Animação de sucesso
        card.classList.add('pag-success-animation');
        setTimeout(() => card.classList.remove('pag-success-animation'), 500);
    }

    // ===========================================
    // SPINNER E FEEDBACK
    // ===========================================
    
    showSpinner() {
        if (this.elements.spinner) {
            this.elements.spinner.style.display = 'flex';
        }
    }
    
    hideSpinner() {
        if (this.elements.spinner) {
            this.elements.spinner.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Animação de entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remover após 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    _formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }
    
    _formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const options = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    }
    
    _isConvenio(tipo) {
        if (!tipo) return false;
        const tipoLower = tipo.toLowerCase();
        return ['convênio', 'convenio', 'convencio', 'rhotoplas'].some(p => tipoLower.includes(p));
    }
    
    _getInfoTipoPagamento(tipo) {
        if (!tipo) return { icone: '💳', cor: '#6c757d' };
        
        const tipoLower = tipo.toLowerCase();
        
        if (tipoLower.includes('dinheiro')) return { icone: '💵', cor: '#28a745' };
        if (tipoLower.includes('pix')) return { icone: '📱', cor: '#00b894' };
        if (tipoLower.includes('débito') || tipoLower.includes('debito')) return { icone: '💳', cor: '#0984e3' };
        if (tipoLower.includes('crédito') || tipoLower.includes('credito')) return { icone: '💳', cor: '#6c5ce7' };
        if (this._isConvenio(tipo)) return { icone: '🏢', cor: '#00cec9' };
        
        return { icone: '💳', cor: '#6c757d' };
    }

    // ===========================================
    // VERIFICAÇÃO DE ESTILOS
    // ===========================================
    
    /**
     * Verifica se o CSS do caixa está carregado
     * O CSS deve ser incluído via link no HTML
     */
    _injectStyles() {
        // CSS é carregado externamente via caixa.css
        // Esta função existe apenas para compatibilidade
        const cssLoaded = Array.from(document.styleSheets).some(sheet => 
            sheet.href && sheet.href.includes('caixa.css')
        );
        
        if (!cssLoaded) {
            console.warn('⚠️ caixa.css não encontrado. Certifique-se de incluir o CSS no HTML.');
        }
    }
    
    /**
     * @deprecated - Estilos movidos para caixa.css
     * Mantido apenas como referência/fallback
     */
    _getStylesFallback() {
        // Estilos movidos para css/caixa.css
        // Este método está deprecado
        return `/* Estilos carregados via caixa.css */`;
    }
}

