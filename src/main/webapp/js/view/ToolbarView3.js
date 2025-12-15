/**
 * ToolbarView.js
 * View - Renderiza e controla UI da toolbar superior
 */

import EventEmitter from '../util/EventEmitter.js';

export default class ToolbarView extends EventEmitter {
    
    constructor() {
        super();
        
        this.elements = {
            toolbar: document.querySelector('.toolbar'),
            searchInput: document.getElementById('toolbarSearch'),
            searchContainer: document.querySelector('.toolbar__search'),
            btnPrescription: document.getElementById('toolbarPrescription'),
            btnServer: document.getElementById('toolbarServer')
        };
        
        this.initEventListeners();
        
        // Inicializa estado do botão receita após DOM estar pronto
        setTimeout(() => {
            this.verificarEstadoReceitaInicial();
        }, 100);
    }

    initEventListeners() {
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.emit('searchInput', { query: e.target.value });
            });
            
            this.elements.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.emit('searchSubmit', { query: e.target.value });
                }
                if (e.key === 'Escape') {
                    this.clearSearch();
                    e.target.blur();
                }
            });
        }
        
        if (this.elements.btnPrescription) {
            this.elements.btnPrescription.addEventListener('click', () => {
                this.emit('prescriptionClick');
            });
        }
        
        if (this.elements.btnServer) {
            this.elements.btnServer.addEventListener('click', () => {
                this.emit('serverClick');
            });
        }
        
        // Atalho Ctrl+K para busca
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }

    // ========================================
    // BOTÃO RECEITA - ESTADOS
    // ========================================

    /**
     * Verifica estado inicial da receita na sessão
     */
    verificarEstadoReceitaInicial() {
        const temReceita = this.verificarReceitaNaSessao();
        this.atualizarBotaoReceita(temReceita);
    }

    /**
     * Verifica se existe receita salva na sessão
     * @returns {boolean}
     */
    verificarReceitaNaSessao() {
        try {
            const receita = sessionStorage.getItem('receitaAtual');
            if (!receita) return false;
            
            const dados = JSON.parse(receita);
            
            // Verifica se tem pelo menos um valor preenchido
            const temOD = dados.od && (
                parseFloat(dados.od.esf) !== 0 || 
                parseFloat(dados.od.cil) !== 0 ||
                parseFloat(dados.od.adicao) !== 0
            );
            
            const temOE = dados.oe && (
                parseFloat(dados.oe.esf) !== 0 || 
                parseFloat(dados.oe.cil) !== 0 ||
                parseFloat(dados.oe.adicao) !== 0
            );
            
            return temOD || temOE;
        } catch (e) {
            return false;
        }
    }

    /**
     * Atualiza o visual do botão de receita
     * @param {boolean} temReceita - Se tem receita salva
     */
    atualizarBotaoReceita(temReceita) {
        const btn = this.elements.btnPrescription;
        if (!btn) {
            console.warn('⚠️ Botão de receita não encontrado!');
            return;
        }
        
        // Remove TODAS as classes de estado e cor (inclusive as que interferem)
        btn.classList.remove(
            'toolbar__btn--alerta', 
            'toolbar__btn--ok', 
            'toolbar__btn--prescription',
            'toolbar__btn--has-prescription',
            'toolbar__btn--active'
        );
        
        // Busca elementos internos
        const iconEl = btn.querySelector('.toolbar__btn-icon');
        const textEl = btn.querySelector('.toolbar__btn-text');
        
        if (temReceita) {
            // ✅ Com receita: verde
            btn.classList.add('toolbar__btn--ok');
            if (iconEl) iconEl.textContent = '📋';
            if (textEl) textEl.textContent = 'Com Receita';
            btn.title = 'Receita preenchida - Clique para editar';
        } else {
            // ❌ Sem receita: vermelho com pulso
            btn.classList.add('toolbar__btn--alerta');
            if (iconEl) iconEl.textContent = '📋';
            if (textEl) textEl.textContent = 'Sem Receita';
            btn.title = 'Nenhuma receita - Clique para preencher';
        }
        
        console.log(`🔄 Botão Receita atualizado: ${temReceita ? 'COM RECEITA (verde)' : 'SEM RECEITA (vermelho)'}`);
        console.log('   Classes aplicadas:', btn.className);
    }

    /**
     * Chamado quando a receita é salva
     */
    onReceitaSalva() {
        this.atualizarBotaoReceita(true);
    }

    /**
     * Chamado quando a receita é limpa
     */
    onReceitaLimpa() {
        this.atualizarBotaoReceita(false);
    }

    // ========================================
    // BUSCA
    // ========================================

    focusSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.focus();
            this.elements.searchInput.select();
        }
    }

    setSearchValue(value) {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = value;
        }
    }

    getSearchValue() {
        return this.elements.searchInput?.value || '';
    }

    clearSearch() {
        this.setSearchValue('');
        this.emit('searchClear');
    }

    setSearchLoading(loading) {
        this.elements.searchContainer?.classList.toggle('toolbar__search--loading', loading);
    }

    setIndicatorStatus(status) {
        const indicator = document.querySelector('.toolbar__search-indicator');
        if (indicator) {
            indicator.className = `toolbar__search-indicator toolbar__search-indicator--${status}`;
        }
    }

    // ========================================
    // BOTÕES GERAIS
    // ========================================

    setButtonActive(button, active) {
        const btn = button === 'prescription' 
            ? this.elements.btnPrescription 
            : this.elements.btnServer;
        btn?.classList.toggle('toolbar__btn--active', active);
    }

    setButtonLoading(button, loading) {
        const btn = button === 'prescription' 
            ? this.elements.btnPrescription 
            : this.elements.btnServer;
        if (btn) {
            btn.classList.toggle('toolbar__btn--loading', loading);
            btn.disabled = loading;
        }
    }

    // ========================================
    // VISIBILIDADE
    // ========================================

    show() {
        this.elements.toolbar?.classList.add('toolbar--visible');
    }

    hide() {
        this.elements.toolbar?.classList.remove('toolbar--visible');
    }
}
