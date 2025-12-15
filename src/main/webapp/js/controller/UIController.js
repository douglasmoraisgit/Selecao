/**
 * UIController.js
 * Responsável por elementos de UI gerais
 * 
 * RESPONSABILIDADES:
 * - Botão flutuante
 * - Toast/notificações
 * - Viewport
 * - DOM events gerais
 * 
 * EVENTOS EMITIDOS:
 * - 'botaoFlutuanteClicado'  → Botão flutuante foi clicado { quantidade }
 * - 'verResultados'          → Solicitação para ver resultados
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';
import { setViewportHeight, debounce } from '../util/helpers.js';

export default class UIController extends EventEmitter {
    
    constructor({ botaoFlutuanteView, produtosView }) {
        super();
        
        // Dependências injetadas
        this.botaoFlutuanteView = botaoFlutuanteView;
        this.produtosView = produtosView;
        
        // Bind de eventos
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Botão flutuante click
        this.botaoFlutuanteView.on('click', ({ quantidade }) => {
            this.emit('botaoFlutuanteClicado', { quantidade });
        });
    }

    // ========================================
    // VIEWPORT
    // ========================================

    /**
     * Configura viewport para mobile
     */
    setupViewport() {
        setViewportHeight();
        window.addEventListener('resize', debounce(() => setViewportHeight(), 100));
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        });
    }

    // ========================================
    // BOTÃO FLUTUANTE
    // ========================================

    /**
     * Mostra o botão flutuante com quantidade
     */
    mostrarBotaoFlutuante(quantidade, texto = 'produtos') {
        if (quantidade === 0) {
            // Sem resultados: vermelho com "0 encontrado"
            this.botaoFlutuanteView.setTexto('encontrado');
            this.botaoFlutuanteView.showResult(0);
            this.botaoFlutuanteView.setColor('red');
        } else {
            // Com resultados: verde (padrão)
            this.botaoFlutuanteView.setTexto(texto);
            this.botaoFlutuanteView.showResult(quantidade);
            this.botaoFlutuanteView.setColor('green');
        }
        this.botaoFlutuanteView.show();
    }

    /**
     * Mostra botão flutuante no estado inicial
     */
    mostrarBotaoFlutuanteInicial() {
        this.botaoFlutuanteView.setTexto('produtos');
        this.botaoFlutuanteView.showResult(0);
        this.botaoFlutuanteView.setColor('green');
        this.botaoFlutuanteView.show();
    }

    /**
     * Esconde o botão flutuante
     */
    esconderBotaoFlutuante() {
        this.botaoFlutuanteView.hide();
    }

    /**
     * Mostra loading no botão flutuante
     */
    mostrarLoadingBotao() {
        this.botaoFlutuanteView.setTexto('buscando...');
        this.botaoFlutuanteView.show();
    }

    /**
     * Mostra erro no botão flutuante
     */
    mostrarErroBotao() {
        this.botaoFlutuanteView.setTexto('Erro');
        this.botaoFlutuanteView.setColor('red');
    }

    /**
     * Pulsa o botão flutuante
     */
    pulsarBotao() {
        this.botaoFlutuanteView.pulse();
    }

    // ========================================
    // PRODUTOS
    // ========================================

    /**
     * Renderiza lista de produtos
     */
    renderProdutos(resultados) {
        if (resultados && resultados.length > 0) {
            this.produtosView.render(resultados);
        } else {
            this.produtosView.showEmpty('Nenhum produto encontrado. Ajuste os filtros.');
        }
    }

    /**
     * Limpa a lista de produtos
     * Chamado quando a receita é apagada
     */
    limparProdutos() {
        this.produtosView.showEmpty('Preencha a receita para ver os produtos disponíveis.');
    }

    // ========================================
    // TOAST / NOTIFICAÇÕES
    // ========================================

    /**
     * Mostra uma notificação toast
     */
    mostrarToast(mensagem) {
        let toast = document.getElementById('toastNotificacao');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotificacao';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: #333;
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 14px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = mensagem;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    // ========================================
    // LOADER
    // ========================================

    /**
     * Esconde o loader global
     */
    esconderLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }
}
