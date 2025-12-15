/**
 * ReceitaView.js
 * View - Formulário de receita óptica (modal)
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class ReceitaView extends EventEmitter {
    
    constructor() {
        super();
        
        this.modal = null;
        this.form = null;
        this.btnReceita = null;
        
        this.init();
    }
    
    init() {
        this.createModal();
        this.createButton();
        this.bindEvents();
    }
    
    /**
     * Cria o modal de receita
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'receitaModal';
        this.modal.className = 'receita-modal';
        
        this.modal.innerHTML = `
            <div class="receita-modal__overlay"></div>
            <div class="receita-modal__content">
                <div class="receita-modal__header">
                    <h2>📋 Receita do Cliente</h2>
                    <button type="button" class="receita-modal__close" id="btnFecharReceita">✕</button>
                </div>
                
                <form id="formReceita" class="receita-form">
                    <!-- Olho Direito -->
                    <div class="receita-form__section">
                        <h3 class="receita-form__section-title">
                            <span class="receita-form__eye-badge od">OD</span>
                            Olho Direito
                        </h3>
                        <div class="receita-form__grid">
                            <div class="receita-form__field">
                                <label for="rod_esf">Esférico</label>
                                <input type="number" id="rod_esf" name="rod_esf" 
                                       step="0.25" min="-30" max="30" value="0">
                            </div>
                            <div class="receita-form__field">
                                <label for="rod_cil">Cilíndrico</label>
                                <input type="number" id="rod_cil" name="rod_cil" 
                                       step="0.25" min="-10" max="0" value="0">
                            </div>
                            <div class="receita-form__field">
                                <label for="rod_eixo">Eixo</label>
                                <input type="number" id="rod_eixo" name="rod_eixo" 
                                       step="1" min="0" max="180" value="0">
                            </div>
                            <div class="receita-form__field">
                                <label for="rod_adicao">Adição</label>
                                <input type="number" id="rod_adicao" name="rod_adicao" 
                                       step="0.25" min="0" max="4" value="0">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botão copiar OD para OE -->
                    <div class="receita-form__copy">
                        <button type="button" id="btnCopiarOD" class="receita-form__copy-btn">
                            ⬇️ Copiar OD para OE
                        </button>
                    </div>
                    
                    <!-- Olho Esquerdo -->
                    <div class="receita-form__section">
                        <h3 class="receita-form__section-title">
                            <span class="receita-form__eye-badge oe">OE</span>
                            Olho Esquerdo
                        </h3>
                        <div class="receita-form__grid">
                            <div class="receita-form__field">
                                <label for="roe_esf">Esférico</label>
                                <input type="number" id="roe_esf" name="roe_esf" 
                                       step="0.25" min="-30" max="30" value="0">
                            </div>
                            <div class="receita-form__field">
                                <label for="roe_cil">Cilíndrico</label>
                                <input type="number" id="roe_cil" name="roe_cil" 
                                       step="0.25" min="-10" max="0" value="0">
                            </div>
                            <div class="receita-form__field">
                                <label for="roe_eixo">Eixo</label>
                                <input type="number" id="roe_eixo" name="roe_eixo" 
                                       step="1" min="0" max="180" value="0">
                            </div>
                            <div class="receita-form__field">
                                <label for="roe_adicao">Adição</label>
                                <input type="number" id="roe_adicao" name="roe_adicao" 
                                       step="0.25" min="0" max="4" value="0">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Ações -->
                    <div class="receita-form__actions">
                        <button type="button" id="btnLimparReceita" class="receita-form__btn receita-form__btn--secondary">
                            🗑️ Limpar
                        </button>
                        <button type="submit" class="receita-form__btn receita-form__btn--primary">
                            💾 Salvar Receita
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.form = document.getElementById('formReceita');
    }
    
    /**
     * Conecta ao botão de receita existente na toolbar
     */
    createButton() {
        // Usa o botão existente na toolbar (toolbarPrescription)
        this.btnReceita = document.getElementById('toolbarPrescription');
        
        if (!this.btnReceita) {
            // Fallback: cria botão se não existir
            this.btnReceita = document.createElement('button');
            this.btnReceita.id = 'toolbarPrescription';
            this.btnReceita.className = 'toolbar__btn toolbar__btn--receita';
            this.btnReceita.innerHTML = `
                <span class="toolbar__btn-icon">📋</span>
                <span class="toolbar__btn-text">Receita</span>
            `;
            
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.insertBefore(this.btnReceita, toolbar.firstChild);
            } else {
                document.body.appendChild(this.btnReceita);
            }
        }
        
        console.log('📋 Botão receita conectado:', this.btnReceita ? 'OK' : 'FALHOU');
    }
    
    /**
     * Bind de eventos
     */
    bindEvents() {
        // Abrir modal
        if (this.btnReceita) {
            this.btnReceita.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📋 Click no botão receita!');
                this.abrir();
            });
            console.log('📋 Evento click registrado no botão receita');
        } else {
            console.error('❌ Botão receita não encontrado!');
        }
        
        // Fechar modal
        const btnFechar = document.getElementById('btnFecharReceita');
        if (btnFechar) {
            btnFechar.addEventListener('click', () => this.fechar());
        }
        
        // Fechar ao clicar no overlay
        const overlay = this.modal.querySelector('.receita-modal__overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.fechar());
        }
        
        // Copiar OD para OE
        const btnCopiar = document.getElementById('btnCopiarOD');
        if (btnCopiar) {
            btnCopiar.addEventListener('click', () => this.emit('copiarOD'));
        }
        
        // Limpar
        const btnLimpar = document.getElementById('btnLimparReceita');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => this.emit('limpar'));
        }
        
        // Submit do form
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.emit('salvar', this.getDados());
            });
            
            // Mudança em qualquer campo
            const inputs = this.form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.emit('change', { campo: input.name, valor: input.value });
                });
            });
        }
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.fechar();
            }
        });
    }
    
    /**
     * Abre o modal
     */
    abrir() {
        console.log('📋 Abrindo modal de receita...');
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Foca no primeiro campo
        setTimeout(() => {
            const campo = document.getElementById('rod_esf');
            if (campo) campo.focus();
        }, 100);
        
        this.emit('abrir');
    }
    
    /**
     * Fecha o modal
     */
    fechar() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.emit('fechar');
    }
    
    /**
     * Preenche o formulário com dados
     */
    setDados(dados) {
        Object.keys(dados).forEach(campo => {
            const input = document.getElementById(campo);
            if (input) {
                input.value = dados[campo];
            }
        });
    }
    
    /**
     * Retorna dados do formulário
     */
    getDados() {
        const formData = new FormData(this.form);
        const dados = {};
        
        for (const [campo, valor] of formData) {
            dados[campo] = parseFloat(valor) || 0;
        }
        
        return dados;
    }
    
    /**
     * Atualiza visual do botão baseado no estado
     */
    atualizarBotao(temReceita, resumo = null) {
        if (!this.btnReceita) return;
        
        if (temReceita && resumo) {
            this.btnReceita.className = 'toolbar__btn toolbar__btn--receita toolbar__btn--ok';
            this.btnReceita.innerHTML = `
                <span class="toolbar__btn-icon">✅</span>
                <span class="toolbar__btn-text">Receita</span>
            `;
            this.btnReceita.title = `OD: ${resumo.od}\nOE: ${resumo.oe}`;
        } else {
            this.btnReceita.className = 'toolbar__btn toolbar__btn--receita toolbar__btn--alerta';
            this.btnReceita.innerHTML = `
                <span class="toolbar__btn-icon">⚠️</span>
                <span class="toolbar__btn-text">Receita</span>
            `;
            this.btnReceita.title = 'Clique para preencher a receita';
        }
    }
    
    /**
     * Limpa os campos do formulário
     */
    limparCampos() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = 0;
        });
    }
    
    /**
     * Mostra feedback de sucesso
     */
    mostrarSucesso(mensagem = 'Receita salva!') {
        // Feedback visual rápido
        const content = this.modal.querySelector('.receita-modal__content');
        content.classList.add('success');
        
        setTimeout(() => {
            content.classList.remove('success');
            this.fechar();
        }, 500);
    }
}
