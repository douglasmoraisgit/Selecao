/**
 * ReceitaController.js
 * Responsável por gerenciar a prescrição/receita
 * 
 * RESPONSABILIDADES:
 * - Salvar receita
 * - Limpar receita
 * - Copiar OD para OE
 * - Atualizar botão de receita na toolbar
 * 
 * EVENTOS EMITIDOS:
 * - 'receitaSalva'    → Receita foi salva { dados }
 * - 'receitaLimpa'    → Receita foi limpa
 * - 'receitaCopiada'  → OD copiado para OE
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class ReceitaController extends EventEmitter {
    
    constructor({ receitaModel, receitaView }) {
        super();
        
        // Dependências injetadas
        this.receitaModel = receitaModel;
        this.receitaView = receitaView;
        
        // Bind de eventos
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Salvar receita
        this.receitaView.on('salvar', (dados) => {
            this.salvarReceita(dados);
        });
        
        // Limpar receita
        this.receitaView.on('limpar', () => {
            this.limparReceita();
        });
        
        // Copiar OD para OE
        this.receitaView.on('copiarOD', () => {
            this.copiarODparaOE();
        });
        
        // Ao abrir modal, carrega dados
        this.receitaView.on('abrir', () => {
            this.receitaView.setDados(this.receitaModel.getReceita());
        });
    }

    // ========================================
    // AÇÕES
    // ========================================

    /**
     * Salva a receita no model
     */
    salvarReceita(dados) {
        console.log('💾 Salvando receita:', dados);
        
        this.receitaModel.setDados(dados);
        this.receitaModel.salvar();
        this.atualizarBotaoReceita();
        this.receitaView.mostrarSucesso();
        
        this.emit('receitaSalva', { dados });
    }

    /**
     * Limpa a receita
     */
    limparReceita() {
        console.log('🧹 Limpando receita');
        
        this.receitaModel.limpar();
        this.receitaView.limparCampos();
        this.atualizarBotaoReceita();
        
        this.emit('receitaLimpa');
    }

    /**
     * Copia valores do OD para OE
     */
    copiarODparaOE() {
        console.log('📋 Copiando OD para OE');
        
        this.receitaModel.copiarODparaOE();
        this.receitaView.setDados(this.receitaModel.getReceita());
        
        this.emit('receitaCopiada');
    }

    /**
     * Abre o modal de receita
     */
    abrirModal() {
        this.receitaView.abrir();
    }

    // ========================================
    // UI
    // ========================================

    /**
     * Atualiza o visual do botão de receita na toolbar
     */
    atualizarBotaoReceita() {
        const receita = this.receitaModel.getReceita();
        const btn = document.getElementById('toolbarPrescription');
        
        if (btn) {
            const textoSpan = btn.querySelector('.toolbar__btn-text');
            const temReceita = receita && (receita.rod_esf || receita.rod_cil || receita.roe_esf || receita.roe_cil);
            
            // Remove TODAS as classes de estado
            btn.classList.remove(
                'toolbar__btn--alerta',
                'toolbar__btn--ok',
                'toolbar__btn--prescription',
                'toolbar__btn--has-prescription',
                'toolbar__btn--no-prescription',
                'toolbar__btn--active'
            );
            
            if (temReceita) {
                // COM receita: verde, texto "Com Receita"
                btn.classList.add('toolbar__btn--ok');
                if (textoSpan) textoSpan.textContent = 'Com Receita';
                btn.title = 'Receita preenchida - Clique para editar';
            } else {
                // SEM receita: vermelho, texto "Sem Receita"
                btn.classList.add('toolbar__btn--alerta');
                if (textoSpan) textoSpan.textContent = 'Sem Receita';
                btn.title = 'Nenhuma receita - Clique para preencher';
            }
            
            console.log(`🔄 Botão Receita: ${temReceita ? 'COM (verde)' : 'SEM (vermelho)'}`);
        }
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna a receita atual
     */
    getReceita() {
        return this.receitaModel.getReceita();
    }

    /**
     * Verifica se tem receita válida
     */
    temReceitaValida() {
        const receita = this.receitaModel.getReceita();
        if (!receita) return false;
        
        return !!(receita.rod_esf || receita.rod_cil || 
                 receita.roe_esf || receita.roe_cil ||
                 receita.rod_adicao || receita.roe_adicao);
    }
}
