/**
 * PagamentoView.js
 * View para Tela de Pagamento
 * 
 * FUNCIONALIDADES:
 * - Resumo da venda (itens, subtotal, desconto, total)
 * - Dados do cliente
 * - Seleção de formas de pagamento
 * - Múltiplas formas de pagamento
 * - Parcelamento
 * - Convênio com seleção de empresa
 * - Aplicar desconto
 * 
 * EVENTOS EMITIDOS:
 * - 'adicionarPagamento'   → { forma, valor, parcelas, bandeira, convenio, ... }
 * - 'removerPagamento'     → { index }
 * - 'aplicarDesconto'      → { tipo, valor }
 * - 'confirmarVenda'       → { cliente, pagamentos, observacoes }
 * - 'cancelar'             → {}
 * - 'fechar'               → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class PagamentoView extends EventEmitter {
    
    constructor() {
        super();
        this.container = null;
        this.carrinho = null;
        this.pagamentos = [];
        this.formasPagamento = [];
        this.bandeiras = [];
        this.convenios = [];
        this.formaSelecionada = null;
        this.desconto = { tipo: 'valor', valor: 0 };
        
        this.injectStyles();
        this.createModal();
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if (document.getElementById('pagamento-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'pagamento-styles';
        style.textContent = `
            /* ========================================
               MODAL DE PAGAMENTO
            ======================================== */
            
            .pagamento-overlay {
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
            
            .pagamento-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .pagamento-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: #f8fafc;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                z-index: 10001;
                width: 95%;
                max-width: 1000px;
                max-height: 95vh;
                display: flex;
                flex-direction: column;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .pagamento-overlay.active .pagamento-modal {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            /* Header */
            .pagamento-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                border-radius: 16px 16px 0 0;
                color: white;
            }
            
            .pagamento-header h2 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .pagamento-close {
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
            
            .pagamento-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            /* Conteúdo */
            .pagamento-content {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
                display: grid;
                grid-template-columns: 1fr 1.5fr;
                gap: 24px;
            }
            
            /* Coluna esquerda - Resumo e Cliente */
            .pagamento-col-esquerda {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            /* Cards */
            .pagamento-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .pagamento-card h3 {
                margin: 0 0 16px 0;
                font-size: 1rem;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            /* Resumo da venda */
            .resumo-itens {
                font-size: 0.9rem;
                color: #6b7280;
                margin-bottom: 16px;
            }
            
            .resumo-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
            }
            
            .resumo-linha {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-top: 1px dashed #e5e7eb;
            }
            
            .resumo-linha.subtotal {
                font-weight: 500;
            }
            
            .resumo-linha.desconto {
                color: #dc2626;
            }
            
            .resumo-linha.total {
                font-size: 1.2rem;
                font-weight: 700;
                color: #059669;
                border-top: 2px solid #e5e7eb;
                padding-top: 12px;
                margin-top: 8px;
            }
            
            /* Desconto */
            .desconto-row {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .desconto-row select {
                width: 80px;
                padding: 8px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.85rem;
            }
            
            .desconto-row input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.9rem;
            }
            
            .desconto-row button {
                padding: 8px 16px;
                background: #f59e0b;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
            }
            
            .desconto-row button:hover {
                background: #d97706;
            }
            
            /* Cliente */
            .cliente-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .form-group label {
                font-size: 0.85rem;
                font-weight: 500;
                color: #374151;
            }
            
            .form-group input {
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.95rem;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #059669;
                box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
            }
            
            /* Coluna direita - Formas de pagamento */
            .pagamento-col-direita {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            /* Botões de forma de pagamento */
            .formas-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            
            .forma-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 12px 8px;
                background: #f3f4f6;
                border: 2px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .forma-btn:hover {
                background: #e5e7eb;
            }
            
            .forma-btn.active {
                background: #ecfdf5;
                border-color: #059669;
            }
            
            .forma-btn .icon {
                font-size: 1.5rem;
            }
            
            .forma-btn .nome {
                font-size: 0.75rem;
                font-weight: 500;
                color: #374151;
                text-align: center;
            }
            
            /* Formulário da forma selecionada */
            .forma-config {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 10px;
                padding: 16px;
                display: none;
            }
            
            .forma-config.visible {
                display: block;
            }
            
            .forma-config h4 {
                margin: 0 0 16px 0;
                font-size: 1rem;
                color: #166534;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .config-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 12px;
            }
            
            .config-row.full {
                grid-template-columns: 1fr;
            }
            
            .config-field {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .config-field label {
                font-size: 0.8rem;
                font-weight: 500;
                color: #166534;
            }
            
            .config-field input,
            .config-field select {
                padding: 10px 12px;
                border: 1px solid #86efac;
                border-radius: 6px;
                font-size: 0.95rem;
                background: white;
            }
            
            .config-field input:focus,
            .config-field select:focus {
                outline: none;
                border-color: #059669;
            }
            
            /* Bandeiras */
            .bandeiras-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .bandeira-btn {
                padding: 8px 16px;
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s;
            }
            
            .bandeira-btn:hover {
                border-color: #059669;
            }
            
            .bandeira-btn.active {
                background: #059669;
                color: white;
                border-color: #059669;
            }
            
            /* Botão adicionar */
            .btn-adicionar-pagamento {
                width: 100%;
                padding: 12px;
                background: #059669;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 12px;
            }
            
            .btn-adicionar-pagamento:hover {
                background: #047857;
            }
            
            .btn-adicionar-pagamento:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
            
            /* Lista de pagamentos adicionados */
            .pagamentos-lista {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .pagamento-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }
            
            .pagamento-item .icon {
                font-size: 1.5rem;
            }
            
            .pagamento-item .info {
                flex: 1;
            }
            
            .pagamento-item .forma-nome {
                font-weight: 600;
                color: #111827;
            }
            
            .pagamento-item .detalhe {
                font-size: 0.85rem;
                color: #6b7280;
            }
            
            .pagamento-item .valor {
                font-weight: 700;
                font-size: 1.1rem;
                color: #059669;
            }
            
            .pagamento-item .btn-remover {
                background: #fee2e2;
                color: #dc2626;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1rem;
            }
            
            .pagamento-item .btn-remover:hover {
                background: #fecaca;
            }
            
            /* Totalizador */
            .totalizador {
                display: flex;
                justify-content: space-between;
                padding: 16px;
                background: #f0fdf4;
                border-radius: 8px;
                margin-top: 12px;
            }
            
            .totalizador-item {
                text-align: center;
            }
            
            .totalizador-item .label {
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .totalizador-item .valor {
                font-size: 1.2rem;
                font-weight: 700;
            }
            
            .totalizador-item .valor.pago {
                color: #059669;
            }
            
            .totalizador-item .valor.restante {
                color: #dc2626;
            }
            
            .totalizador-item .valor.restante.zero {
                color: #059669;
            }
            
            /* Footer */
            .pagamento-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 24px;
                background: white;
                border-top: 1px solid #e5e7eb;
                border-radius: 0 0 16px 16px;
            }
            
            .pagamento-footer .observacoes {
                flex: 1;
                margin-right: 16px;
            }
            
            .pagamento-footer .observacoes textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                resize: none;
                height: 60px;
                font-size: 0.9rem;
            }
            
            .footer-btns {
                display: flex;
                gap: 12px;
            }
            
            .btn-cancelar {
                padding: 12px 24px;
                background: #f3f4f6;
                color: #374151;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
            }
            
            .btn-cancelar:hover {
                background: #e5e7eb;
            }
            
            .btn-confirmar {
                padding: 12px 32px;
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-confirmar:hover {
                background: linear-gradient(135deg, #047857 0%, #065f46 100%);
            }
            
            .btn-confirmar:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
            
            /* ========================================
               AUTOCOMPLETE DE CLIENTE
            ======================================== */
            
            .cliente-search-wrapper {
                position: relative;
                margin-bottom: 16px;
            }
            
            .cliente-search-input {
                width: 100%;
                padding: 12px 16px 12px 40px;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 1rem;
                transition: all 0.2s;
            }
            
            .cliente-search-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .cliente-search-wrapper::before {
                content: '🔍';
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.1rem;
            }
            
            .cliente-autocomplete {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                z-index: 100;
                max-height: 300px;
                overflow-y: auto;
                display: none;
            }
            
            .cliente-autocomplete.show {
                display: block;
            }
            
            .cliente-autocomplete-item {
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                transition: background 0.2s;
            }
            
            .cliente-autocomplete-item:last-child {
                border-bottom: none;
            }
            
            .cliente-autocomplete-item:hover {
                background: #f0f9ff;
            }
            
            .cliente-autocomplete-item .nome {
                font-weight: 600;
                color: #111827;
            }
            
            .cliente-autocomplete-item .info {
                font-size: 0.85rem;
                color: #6b7280;
                margin-top: 2px;
            }
            
            .cliente-autocomplete-empty {
                padding: 20px;
                text-align: center;
                color: #9ca3af;
            }
            
            .cliente-autocomplete-loading {
                padding: 20px;
                text-align: center;
                color: #6b7280;
            }
            
            .cliente-selecionado {
                background: #f0fdf4;
                border: 2px solid #10b981;
                border-radius: 10px;
                padding: 12px 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .cliente-selecionado .info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .cliente-selecionado .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
            }
            
            .cliente-selecionado .nome {
                font-weight: 600;
                color: #065f46;
            }
            
            .cliente-selecionado .detalhe {
                font-size: 0.85rem;
                color: #6b7280;
            }
            
            .cliente-selecionado .btn-trocar {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 4px 8px;
            }
            
            .cliente-form-fields {
                display: none;
            }
            
            .cliente-form-fields.show {
                display: block;
            }
            
            .cliente-form-fields.show-partial .form-group:first-child {
                display: none;
            }
            
            /* Responsivo */
            @media (max-width: 900px) {
                .pagamento-content {
                    grid-template-columns: 1fr;
                }
                
                .formas-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }
            
            @media (max-width: 640px) {
                .pagamento-modal {
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
                
                .pagamento-header {
                    border-radius: 0;
                }
                
                .pagamento-footer {
                    border-radius: 0;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .pagamento-footer .observacoes {
                    margin-right: 0;
                    width: 100%;
                }
                
                .footer-btns {
                    width: 100%;
                }
                
                .footer-btns button {
                    flex: 1;
                }
                
                .formas-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                .config-row {
                    grid-template-columns: 1fr;
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
        this.container.className = 'pagamento-overlay';
        this.container.innerHTML = `
            <div class="pagamento-modal">
                <div class="pagamento-header">
                    <h2>💳 Finalizar Venda</h2>
                    <button class="pagamento-close" title="Fechar">✕</button>
                </div>
                
                <div class="pagamento-content">
                    <!-- Coluna Esquerda -->
                    <div class="pagamento-col-esquerda">
                        <!-- Resumo -->
                        <div class="pagamento-card">
                            <h3>📋 Resumo da Venda</h3>
                            <div id="resumoVenda"></div>
                        </div>
                        
                        <!-- Cliente -->
                        <div class="pagamento-card">
                            <h3>👤 Cliente</h3>
                            
                            <!-- Cliente Selecionado (quando tiver) -->
                            <div class="cliente-selecionado" id="clienteSelecionado" style="display: none;">
                                <div class="info">
                                    <div class="avatar" id="clienteAvatar">--</div>
                                    <div>
                                        <div class="nome" id="clienteSelecionadoNome">---</div>
                                        <div class="detalhe" id="clienteSelecionadoDetalhe">---</div>
                                    </div>
                                </div>
                                <button class="btn-trocar" id="btnTrocarCliente" title="Trocar cliente">✕</button>
                            </div>
                            
                            <!-- Busca de Cliente -->
                            <div class="cliente-search-wrapper" id="clienteSearchWrapper">
                                <input type="text" class="cliente-search-input" id="clienteSearch" 
                                       placeholder="Buscar cliente por nome, CPF ou telefone...">
                                <div class="cliente-autocomplete" id="clienteAutocomplete"></div>
                            </div>
                            
                            <!-- Campos do cliente (para novo/avulso) -->
                            <div class="cliente-form-fields" id="clienteFormFields">
                                <div class="form-group">
                                    <label>Nome *</label>
                                    <input type="text" id="clienteNome" placeholder="Nome do cliente">
                                </div>
                                <div class="form-group">
                                    <label>CPF</label>
                                    <input type="text" id="clienteCpf" placeholder="000.000.000-00">
                                </div>
                                <div class="form-group">
                                    <label>Telefone</label>
                                    <input type="text" id="clienteTelefone" placeholder="(00) 00000-0000">
                                </div>
                            </div>
                            
                            <!-- Input hidden para id do cliente -->
                            <input type="hidden" id="clienteId" value="">
                        </div>
                    </div>
                    
                    <!-- Coluna Direita -->
                    <div class="pagamento-col-direita">
                        <!-- Formas de Pagamento -->
                        <div class="pagamento-card">
                            <h3>💰 Forma de Pagamento</h3>
                            <div class="formas-grid" id="formasGrid"></div>
                            
                            <!-- Configuração da forma selecionada -->
                            <div class="forma-config" id="formaConfig"></div>
                        </div>
                        
                        <!-- Pagamentos Adicionados -->
                        <div class="pagamento-card">
                            <h3>📝 Pagamentos</h3>
                            <div class="pagamentos-lista" id="pagamentosLista">
                                <p style="color: #9ca3af; text-align: center; padding: 20px;">
                                    Nenhum pagamento adicionado
                                </p>
                            </div>
                            
                            <div class="totalizador">
                                <div class="totalizador-item">
                                    <div class="label">Total Pago</div>
                                    <div class="valor pago" id="totalPago">R$ 0,00</div>
                                </div>
                                <div class="totalizador-item">
                                    <div class="label">Restante</div>
                                    <div class="valor restante" id="totalRestante">R$ 0,00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="pagamento-footer">
                    <div class="observacoes">
                        <textarea id="observacoes" placeholder="Observações da venda..."></textarea>
                    </div>
                    <div class="footer-btns">
                        <button class="btn-cancelar">❌ Cancelar</button>
                        <button class="btn-confirmar" id="btnConfirmar" disabled>
                            ✅ Confirmar Venda
                        </button>
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
        // Fechar modal
        this.container.querySelector('.pagamento-close').addEventListener('click', () => this.fechar());
        this.container.querySelector('.btn-cancelar').addEventListener('click', () => {
            if (confirm('Deseja cancelar a venda?')) {
                this.emit('cancelar');
                this.fechar();
            }
        });
        
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
        
        // Confirmar venda
        this.container.querySelector('#btnConfirmar').addEventListener('click', () => {
            this.confirmarVenda();
        });
        
        // Máscara CPF
        this.container.querySelector('#clienteCpf').addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        });
        
        // Máscara Telefone
        this.container.querySelector('#clienteTelefone').addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
            v = v.replace(/(\d{5})(\d{4})$/, '$1-$2');
            e.target.value = v;
        });
        
        // ✅ NOVO - Atualiza botão quando nome do cliente muda
        this.container.querySelector('#clienteNome').addEventListener('input', () => {
            this.atualizarTotais();
        });
        
        // ========================================
        // AUTOCOMPLETE DE CLIENTE
        // ========================================
        
        let searchTimeout;
        const searchInput = this.container.querySelector('#clienteSearch');
        const autocomplete = this.container.querySelector('#clienteAutocomplete');
        
        // Busca ao digitar
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (termo.length < 2) {
                autocomplete.classList.remove('show');
                // Mostra campos manuais se digitou algo
                if (termo.length > 0) {
                    this.mostrarCamposCliente(true);
                    this.container.querySelector('#clienteNome').value = termo;
                }
                return;
            }
            
            autocomplete.innerHTML = '<div class="cliente-autocomplete-loading">🔍 Buscando...</div>';
            autocomplete.classList.add('show');
            
            searchTimeout = setTimeout(() => {
                this.buscarClientes(termo);
            }, 300);
        });
        
        // Fecha autocomplete ao clicar fora
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !autocomplete.contains(e.target)) {
                autocomplete.classList.remove('show');
            }
        });
        
        // Focus no campo de busca
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.length >= 2) {
                autocomplete.classList.add('show');
            }
        });
        
        // Botão trocar cliente
        this.container.querySelector('#btnTrocarCliente').addEventListener('click', () => {
            this.limparClienteSelecionado();
        });
    }
    
    // ========================================
    // MÉTODOS DE CLIENTE
    // ========================================
    
    async buscarClientes(termo) {
        const autocomplete = this.container.querySelector('#clienteAutocomplete');
        
        try {
            const baseUrl = this.detectContextPath();
            const response = await fetch(`${baseUrl}/BuscarClientes?termo=${encodeURIComponent(termo)}`);
            const data = await response.json();
            
            if (data.success && data.clientes.length > 0) {
                autocomplete.innerHTML = data.clientes.map(cliente => `
                    <div class="cliente-autocomplete-item" data-cliente='${JSON.stringify(cliente)}'>
                        <div class="nome">${cliente.nome}</div>
                        <div class="info">
                            ${cliente.cpf ? `CPF: ${cliente.cpf}` : ''}
                            ${cliente.cpf && cliente.whatsapp ? ' • ' : ''}
                            ${cliente.whatsapp || cliente.telefone || ''}
                        </div>
                    </div>
                `).join('');
                
                // Bind click nos itens
                autocomplete.querySelectorAll('.cliente-autocomplete-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const cliente = JSON.parse(item.dataset.cliente);
                        this.selecionarCliente(cliente);
                    });
                });
                
            } else {
                autocomplete.innerHTML = `
                    <div class="cliente-autocomplete-empty">
                        Nenhum cliente encontrado<br>
                        <small>Digite os dados para cadastrar</small>
                    </div>
                `;
                
                // Mostra campos para novo cliente
                this.mostrarCamposCliente(true);
                this.container.querySelector('#clienteNome').value = termo;
            }
            
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            autocomplete.innerHTML = '<div class="cliente-autocomplete-empty">Erro ao buscar</div>';
        }
    }
    
    selecionarCliente(cliente) {
        this.clienteSelecionado = cliente;
        
        // Esconde busca e campos
        this.container.querySelector('#clienteSearchWrapper').style.display = 'none';
        this.container.querySelector('#clienteFormFields').classList.remove('show');
        
        // Mostra card do cliente selecionado
        const card = this.container.querySelector('#clienteSelecionado');
        card.style.display = 'flex';
        
        // Preenche dados
        const iniciais = this.getIniciais(cliente.nome);
        this.container.querySelector('#clienteAvatar').textContent = iniciais;
        this.container.querySelector('#clienteSelecionadoNome').textContent = cliente.nome;
        this.container.querySelector('#clienteSelecionadoDetalhe').textContent = 
            [cliente.cpf, cliente.whatsapp || cliente.telefone].filter(Boolean).join(' • ');
        
        // Guarda o ID
        this.container.querySelector('#clienteId').value = cliente.id;
        
        // Preenche campos ocultos (para compatibilidade)
        this.container.querySelector('#clienteNome').value = cliente.nome;
        this.container.querySelector('#clienteCpf').value = cliente.cpf || '';
        this.container.querySelector('#clienteTelefone').value = cliente.whatsapp || cliente.telefone || '';
        
        // Fecha autocomplete
        this.container.querySelector('#clienteAutocomplete').classList.remove('show');
        
        // Atualiza botão
        this.atualizarTotais();
    }
    
    limparClienteSelecionado() {
        this.clienteSelecionado = null;
        
        // Esconde card do cliente
        this.container.querySelector('#clienteSelecionado').style.display = 'none';
        
        // Mostra busca
        this.container.querySelector('#clienteSearchWrapper').style.display = 'block';
        this.container.querySelector('#clienteSearch').value = '';
        
        // Limpa campos
        this.container.querySelector('#clienteId').value = '';
        this.container.querySelector('#clienteNome').value = '';
        this.container.querySelector('#clienteCpf').value = '';
        this.container.querySelector('#clienteTelefone').value = '';
        
        // Esconde campos manuais
        this.container.querySelector('#clienteFormFields').classList.remove('show');
        
        // Atualiza botão
        this.atualizarTotais();
        
        // Focus na busca
        this.container.querySelector('#clienteSearch').focus();
    }
    
    mostrarCamposCliente(mostrar) {
        const campos = this.container.querySelector('#clienteFormFields');
        if (mostrar) {
            campos.classList.add('show');
        } else {
            campos.classList.remove('show');
        }
    }
    
    getIniciais(nome) {
        if (!nome) return '?';
        const partes = nome.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    }
    
    detectContextPath() {
        const path = window.location.pathname;
        const match = path.match(/^\/[^\/]+/);
        return match ? match[0] : '';
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    abrir(carrinho, formasPagamento, bandeiras, convenios) {
        this.carrinho = carrinho;
        this.formasPagamento = formasPagamento || [];
        this.bandeiras = bandeiras || [];
        this.convenios = convenios || [];
        this.pagamentos = [];
        this.formaSelecionada = null;
        this.desconto = { tipo: 'valor', valor: 0 };
        this.clienteSelecionado = null;
        
        // Reseta campos de cliente
        this.container.querySelector('#clienteSearch').value = '';
        this.container.querySelector('#clienteSearchWrapper').style.display = 'block';
        this.container.querySelector('#clienteSelecionado').style.display = 'none';
        this.container.querySelector('#clienteFormFields').classList.remove('show');
        this.container.querySelector('#clienteAutocomplete').classList.remove('show');
        this.container.querySelector('#clienteId').value = '';
        this.container.querySelector('#clienteNome').value = '';
        this.container.querySelector('#clienteCpf').value = '';
        this.container.querySelector('#clienteTelefone').value = '';
        this.container.querySelector('#observacoes').value = '';
        
        // Se o carrinho já tiver um cliente selecionado, usa ele
        if (carrinho.cliente && carrinho.cliente.id) {
            this.selecionarCliente(carrinho.cliente);
        } else if (carrinho.cliente && carrinho.cliente.nome) {
            // Cliente sem ID - mostra campos manuais preenchidos
            this.mostrarCamposCliente(true);
            this.container.querySelector('#clienteNome').value = carrinho.cliente.nome;
            this.container.querySelector('#clienteCpf').value = carrinho.cliente.cpf || '';
            this.container.querySelector('#clienteTelefone').value = carrinho.cliente.telefone || '';
        }
        
        this.renderResumo();
        this.renderFormasPagamento();
        this.renderPagamentos();
        this.atualizarTotais();
        
        this.container.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.emit('abrir');
    }

    fechar() {
        this.container.classList.remove('active');
        document.body.style.overflow = '';
        this.emit('fechar');
    }

    // ========================================
    // RENDERIZAÇÃO
    // ========================================

    renderResumo() {
        const container = this.container.querySelector('#resumoVenda');
        
        const lentes = this.carrinho.itens.filter(i => i.tipo === 'lente');
        const produtos = this.carrinho.itens.filter(i => i.tipo === 'produto');
        
        let totalLentes = lentes.reduce((sum, i) => sum + (i.precoTotal || 0), 0);
        let totalProdutos = produtos.reduce((sum, i) => sum + (i.precoTotal || 0), 0);
        let subtotal = totalLentes + totalProdutos;
        
        // Calcular desconto
        let valorDesconto = 0;
        if (this.desconto.tipo === 'percentual') {
            valorDesconto = subtotal * (this.desconto.valor / 100);
        } else {
            valorDesconto = this.desconto.valor;
        }
        
        let total = subtotal - valorDesconto;
        this.totalVenda = total;
        
        container.innerHTML = `
            <div class="resumo-itens">
                <div class="resumo-item">
                    <span>👓 ${lentes.length} Lente(s)</span>
                    <span>R$ ${this.formatarValor(totalLentes)}</span>
                </div>
                <div class="resumo-item">
                    <span>📦 ${produtos.length} Produto(s)</span>
                    <span>R$ ${this.formatarValor(totalProdutos)}</span>
                </div>
            </div>
            
            <div class="resumo-linha subtotal">
                <span>Subtotal</span>
                <span>R$ ${this.formatarValor(subtotal)}</span>
            </div>
            
            <div class="resumo-linha desconto">
                <span>Desconto ${this.desconto.valor > 0 ? (this.desconto.tipo === 'percentual' ? `(${this.desconto.valor}%)` : '') : ''}</span>
                <span>- R$ ${this.formatarValor(valorDesconto)}</span>
            </div>
            
            <div class="resumo-linha total">
                <span>TOTAL</span>
                <span>R$ ${this.formatarValor(total)}</span>
            </div>
            
            <div class="desconto-row">
                <select id="descontoTipo">
                    <option value="valor">R$</option>
                    <option value="percentual">%</option>
                </select>
                <input type="number" id="descontoValor" placeholder="Desconto" min="0" step="0.01" value="${this.desconto.valor || ''}">
                <button id="btnAplicarDesconto">Aplicar</button>
            </div>
        `;
        
        // Bind desconto
        container.querySelector('#btnAplicarDesconto').addEventListener('click', () => {
            const tipo = container.querySelector('#descontoTipo').value;
            const valor = parseFloat(container.querySelector('#descontoValor').value) || 0;
            this.desconto = { tipo, valor };
            this.renderResumo();
            this.atualizarTotais();
            this.emit('aplicarDesconto', { tipo, valor });
        });
    }

    renderFormasPagamento() {
        const container = this.container.querySelector('#formasGrid');
        
        container.innerHTML = this.formasPagamento.map(forma => `
            <button class="forma-btn" data-codigo="${forma.codigo}">
                <span class="icon">${forma.icon}</span>
                <span class="nome">${forma.nome}</span>
            </button>
        `).join('');
        
        // Bind clicks
        container.querySelectorAll('.forma-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.forma-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const codigo = btn.dataset.codigo;
                this.formaSelecionada = this.formasPagamento.find(f => f.codigo === codigo);
                this.renderFormaConfig();
            });
        });
    }

    renderFormaConfig() {
        const container = this.container.querySelector('#formaConfig');
        
        if (!this.formaSelecionada) {
            container.classList.remove('visible');
            return;
        }
        
        const forma = this.formaSelecionada;
        const restante = this.totalVenda - this.getTotalPago();
        
        let html = `
            <h4>${forma.icon} ${forma.nome}</h4>
            
            <div class="config-row">
                <div class="config-field">
                    <label>Valor</label>
                    <input type="number" id="pagValor" value="${restante.toFixed(2)}" min="0.01" step="0.01">
                </div>
        `;
        
        // Parcelas
        if (forma.permite_parcelamento) {
            html += `
                <div class="config-field">
                    <label>Parcelas</label>
                    <select id="pagParcelas">
                        ${Array.from({length: forma.max_parcelas}, (_, i) => i + 1).map(n => 
                            `<option value="${n}">${n}x</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        }
        
        html += `</div>`;
        
        // Bandeira
        if (forma.requer_bandeira) {
            html += `
                <div class="config-row full">
                    <div class="config-field">
                        <label>Bandeira</label>
                        <div class="bandeiras-grid">
                            ${this.bandeiras.map(b => `
                                <button type="button" class="bandeira-btn" data-codigo="${b.codigo}">${b.nome}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Convênio
        if (forma.requer_convenio) {
            html += `
                <div class="config-row">
                    <div class="config-field">
                        <label>Convênio</label>
                        <select id="pagConvenio">
                            <option value="">Selecione...</option>
                            ${this.convenios.map(c => `
                                <option value="${c.id}">${c.nome_fantasia}</option>
                            `).join('')}
                        </select>
                    </div>
                    ${forma.requer_autorizacao ? `
                        <div class="config-field">
                            <label>Nº Autorização</label>
                            <input type="text" id="pagAutorizacao" placeholder="Número">
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        html += `
            <button class="btn-adicionar-pagamento" id="btnAdicionarPag">
                ➕ Adicionar Pagamento
            </button>
        `;
        
        container.innerHTML = html;
        container.classList.add('visible');
        
        // Bind bandeiras
        container.querySelectorAll('.bandeira-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.bandeira-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Bind adicionar
        container.querySelector('#btnAdicionarPag').addEventListener('click', () => {
            this.adicionarPagamento();
        });
    }

    renderPagamentos() {
        const container = this.container.querySelector('#pagamentosLista');
        
        if (this.pagamentos.length === 0) {
            container.innerHTML = `
                <p style="color: #9ca3af; text-align: center; padding: 20px;">
                    Nenhum pagamento adicionado
                </p>
            `;
            return;
        }
        
        container.innerHTML = this.pagamentos.map((pag, index) => {
            const forma = this.formasPagamento.find(f => f.codigo === pag.forma) || {};
            let detalhe = '';
            
            if (pag.parcelas > 1) {
                detalhe = `${pag.parcelas}x de R$ ${this.formatarValor(pag.valor / pag.parcelas)}`;
            }
            if (pag.bandeira) {
                detalhe += (detalhe ? ' - ' : '') + pag.bandeira;
            }
            if (pag.convenioNome) {
                detalhe += (detalhe ? ' - ' : '') + pag.convenioNome;
            }
            
            return `
                <div class="pagamento-item">
                    <span class="icon">${forma.icon || '💰'}</span>
                    <div class="info">
                        <div class="forma-nome">${forma.nome || pag.forma}</div>
                        ${detalhe ? `<div class="detalhe">${detalhe}</div>` : ''}
                    </div>
                    <div class="valor">R$ ${this.formatarValor(pag.valor)}</div>
                    <button class="btn-remover" data-index="${index}" title="Remover">🗑️</button>
                </div>
            `;
        }).join('');
        
        // Bind remover
        container.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.removerPagamento(index);
            });
        });
    }

    // ========================================
    // AÇÕES
    // ========================================

    adicionarPagamento() {
        if (!this.formaSelecionada) return;
        
        const forma = this.formaSelecionada;
        const config = this.container.querySelector('#formaConfig');
        
        const valor = parseFloat(config.querySelector('#pagValor')?.value) || 0;
        if (valor <= 0) {
            alert('Informe um valor válido');
            return;
        }
        
        const pagamento = {
            forma: forma.codigo,
            valor: valor,
            parcelas: 1,
            bandeira: null,
            convenioId: null,
            convenioNome: null,
            autorizacao: null
        };
        
        // Parcelas
        if (forma.permite_parcelamento) {
            pagamento.parcelas = parseInt(config.querySelector('#pagParcelas')?.value) || 1;
        }
        
        // Bandeira
        if (forma.requer_bandeira) {
            const bandeiraSelecionada = config.querySelector('.bandeira-btn.active');
            if (!bandeiraSelecionada) {
                alert('Selecione a bandeira do cartão');
                return;
            }
            pagamento.bandeira = bandeiraSelecionada.dataset.codigo;
        }
        
        // Convênio
        if (forma.requer_convenio) {
            const convenioSelect = config.querySelector('#pagConvenio');
            if (!convenioSelect?.value) {
                alert('Selecione o convênio');
                return;
            }
            pagamento.convenioId = convenioSelect.value;
            pagamento.convenioNome = convenioSelect.options[convenioSelect.selectedIndex].text;
            
            if (forma.requer_autorizacao) {
                pagamento.autorizacao = config.querySelector('#pagAutorizacao')?.value || '';
            }
        }
        
        this.pagamentos.push(pagamento);
        this.renderPagamentos();
        this.atualizarTotais();
        
        // Limpar forma selecionada
        this.container.querySelectorAll('.forma-btn').forEach(b => b.classList.remove('active'));
        this.formaSelecionada = null;
        config.classList.remove('visible');
        
        this.emit('adicionarPagamento', pagamento);
    }

    removerPagamento(index) {
        this.pagamentos.splice(index, 1);
        this.renderPagamentos();
        this.atualizarTotais();
        this.emit('removerPagamento', { index });
    }

    atualizarTotais() {
        const totalPago = this.getTotalPago();
        const restante = this.totalVenda - totalPago;
        
        this.container.querySelector('#totalPago').textContent = `R$ ${this.formatarValor(totalPago)}`;
        
        const restanteEl = this.container.querySelector('#totalRestante');
        restanteEl.textContent = `R$ ${this.formatarValor(Math.max(0, restante))}`;
        restanteEl.classList.toggle('zero', restante <= 0);
        
        // Habilitar botão confirmar se pagamento completo
        const btnConfirmar = this.container.querySelector('#btnConfirmar');
        const clienteNome = this.container.querySelector('#clienteNome').value.trim();
        btnConfirmar.disabled = restante > 0.01 || !clienteNome;
    }

    confirmarVenda() {
        const clienteId = this.container.querySelector('#clienteId').value.trim();
        const clienteNome = this.container.querySelector('#clienteNome').value.trim();
        const clienteCpf = this.container.querySelector('#clienteCpf').value.trim();
        const clienteTelefone = this.container.querySelector('#clienteTelefone').value.trim();
        const observacoes = this.container.querySelector('#observacoes').value.trim();
        
        if (!clienteNome) {
            alert('Informe o nome do cliente');
            return;
        }
        
        if (this.getTotalPago() < this.totalVenda - 0.01) {
            alert('O valor total não foi atingido');
            return;
        }
        
        // Recalcula subtotal e total para garantir valores corretos
        const subtotal = this.carrinho.itens.reduce((sum, i) => sum + (i.precoTotal || 0), 0);
        let valorDesconto = 0;
        if (this.desconto.tipo === 'percentual') {
            valorDesconto = subtotal * (this.desconto.valor / 100);
        } else {
            valorDesconto = this.desconto.valor || 0;
        }
        const totalFinal = subtotal - valorDesconto;
        
        console.log('📊 Confirmando Venda:');
        console.log('   Subtotal:', subtotal);
        console.log('   Desconto:', this.desconto, '→ Valor:', valorDesconto);
        console.log('   Total Final:', totalFinal);
        console.log('   Total Pago:', this.getTotalPago());
        
        this.emit('confirmarVenda', {
            cliente: {
                id: clienteId ? parseInt(clienteId) : null,
                nome: clienteNome,
                cpf: clienteCpf,
                telefone: clienteTelefone
            },
            pagamentos: this.pagamentos,
            subtotal: subtotal,
            desconto: this.desconto,
            total: totalFinal,
            observacoes: observacoes
        });
    }

    // ========================================
    // HELPERS
    // ========================================

    getTotalPago() {
        return this.pagamentos.reduce((sum, p) => sum + p.valor, 0);
    }

    formatarValor(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    showToast(message) {
        // Implementar toast notification
        console.log('Toast:', message);
    }
}
