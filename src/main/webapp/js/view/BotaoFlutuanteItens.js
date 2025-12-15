/**
 * BotaoFlutuanteItens.js
 * View - Botão flutuante que mostra quantidade de itens/lentes encontrados
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class BotaoFlutuanteItens extends EventEmitter {
    
    constructor(containerId = 'botaoFlutuanteContainer') {
        super();
        
        this.containerId = containerId;
        this.container = null;
        
        // Estado
        this.state = {
            quantidade: 0,
            loading: false,
            visible: false,
            texto: 'lentes encontradas',
            color: 'green' // green, red, blue, orange
        };
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.injectStyles();
        this.bindEvents();
    }
    
    /**
     * Cria o container do botão se não existir
     */
    createContainer() {
        this.container = document.getElementById(this.containerId);
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            this.container.className = 'botao-flutuante-itens';
            document.body.appendChild(this.container);
        }
        
        this.render();
    }
    
    /**
     * Renderiza o botão
     */
    render() {
        const { quantidade, loading, visible, texto, color } = this.state;
        
        // Classes
        const classes = ['botao-flutuante-itens'];
        
        // CORREÇÃO: Mostra o botão se visible=true, independente da quantidade
        if (visible) {
            classes.push('active');
        }
        
        // Adiciona classe de cor
        if (color && color !== 'green') {
            classes.push(color);
        }
        
        this.container.className = classes.join(' ');
        
        // Conteúdo
        if (loading) {
            this.container.innerHTML = `
                <span class="bfi__icon">🔍</span>
                <span class="bfi__loading"></span>
                <span class="bfi__text">Buscando...</span>
            `;
        } else {
            this.container.innerHTML = `
                <span class="bfi__icon">${quantidade === 0 ? '❌' : '🔍'}</span>
                <span class="bfi__quantidade">${this.formatQuantidade(quantidade)}</span>
                <span class="bfi__text">${texto}</span>
                <span class="bfi__arrow">→</span>
            `;
        }
    }
    
    /**
     * Formata quantidade para exibição
     */
    formatQuantidade(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
    
    /**
     * Bind de eventos
     */
    bindEvents() {
        this.container.addEventListener('click', () => {
            if (!this.state.loading) {
                // CORREÇÃO: Emite click mesmo com quantidade 0
                this.emit('click', { quantidade: this.state.quantidade });
            }
        });
    }
    
    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================
    
    /**
     * Define a quantidade de itens
     * @param {number} quantidade 
     */
    setQuantidade(quantidade) {
        this.state.quantidade = quantidade;
        this.state.loading = false;
        this.render();
    }
    
    /**
     * Define o texto descritivo
     * @param {string} texto 
     */
    setTexto(texto) {
        this.state.texto = texto;
        this.render();
    }
    
    /**
     * Mostra estado de loading
     */
    showLoading() {
        this.state.loading = true;
        this.state.visible = true;
        this.render();
    }
    
    /**
     * Esconde loading e mostra resultado
     * @param {number} quantidade 
     */
    showResult(quantidade) {
        this.state.loading = false;
        this.state.quantidade = quantidade;
        this.state.visible = true;
        this.render();
    }
    
    /**
     * Mostra o botão
     */
    show() {
        this.state.visible = true;
        this.render();
    }
    
    /**
     * Esconde o botão
     */
    hide() {
        this.state.visible = false;
        this.render();
    }
    
    /**
     * Toggle visibilidade
     */
    toggle() {
        this.state.visible = !this.state.visible;
        this.render();
    }
    
    /**
     * Reseta para estado inicial
     */
    reset() {
        this.state = {
            quantidade: 0,
            loading: false,
            visible: false,
            texto: 'lentes encontradas',
            color: 'green'
        };
        this.render();
    }
    
    /**
     * Atualiza múltiplas propriedades de uma vez
     * @param {Object} options 
     */
    update(options = {}) {
        if (options.quantidade !== undefined) this.state.quantidade = options.quantidade;
        if (options.loading !== undefined) this.state.loading = options.loading;
        if (options.visible !== undefined) this.state.visible = options.visible;
        if (options.texto !== undefined) this.state.texto = options.texto;
        if (options.color !== undefined) this.state.color = options.color;
        this.render();
    }
    
    /**
     * Retorna estado atual
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Define a cor do botão
     * @param {string} color - green, red, blue, orange
     */
    setColor(color) {
        this.state.color = color;
        this.render();
    }
    
    /**
     * Animação de pulse (destaque)
     */
    pulse() {
        this.container.classList.add('pulse');
        setTimeout(() => {
            this.container.classList.remove('pulse');
        }, 600);
    }
    
    /**
     * Animação de shake (erro/atenção)
     */
    shake() {
        this.container.classList.add('shake');
        setTimeout(() => {
            this.container.classList.remove('shake');
        }, 500);
    }
    
    /**
     * Injeta estilos CSS necessários
     */
    injectStyles() {
        if (document.getElementById('botaoFlutuanteStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'botaoFlutuanteStyles';
        style.textContent = `
            .botao-flutuante-itens {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: none;
                align-items: center;
                gap: 10px;
                padding: 12px 20px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border-radius: 50px;
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                z-index: 9999;
                transition: all 0.3s ease;
                user-select: none;
            }
            
            .botao-flutuante-itens.active {
                display: flex;
            }
            
            .botao-flutuante-itens:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
            }
            
            .botao-flutuante-itens:active {
                transform: translateY(0);
            }
            
            /* Cor vermelha para 0 resultados */
            .botao-flutuante-itens.red {
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
            }
            
            .botao-flutuante-itens.red:hover {
                box-shadow: 0 6px 20px rgba(220, 53, 69, 0.5);
            }
            
            /* Cor azul */
            .botao-flutuante-itens.blue {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
            }
            
            /* Cor laranja */
            .botao-flutuante-itens.orange {
                background: linear-gradient(135deg, #fd7e14 0%, #e55a00 100%);
                box-shadow: 0 4px 15px rgba(253, 126, 20, 0.4);
            }
            
            .bfi__icon {
                font-size: 18px;
            }
            
            .bfi__quantidade {
                font-size: 22px;
                font-weight: 700;
                line-height: 1;
            }
            
            .bfi__text {
                font-size: 13px;
                opacity: 0.95;
            }
            
            .bfi__arrow {
                font-size: 16px;
                margin-left: 4px;
                transition: transform 0.2s ease;
            }
            
            .botao-flutuante-itens:hover .bfi__arrow {
                transform: translateX(3px);
            }
            
            .bfi__loading {
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Animação pulse */
            .botao-flutuante-itens.pulse {
                animation: pulse-animation 0.6s ease;
            }
            
            @keyframes pulse-animation {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            /* Animação shake */
            .botao-flutuante-itens.shake {
                animation: shake-animation 0.5s ease;
            }
            
            @keyframes shake-animation {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* Responsivo */
            @media (max-width: 480px) {
                .botao-flutuante-itens {
                    bottom: 15px;
                    right: 15px;
                    left: 15px;
                    justify-content: center;
                    padding: 14px 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}
