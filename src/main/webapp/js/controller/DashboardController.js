/**
 * DashboardController.js
 * Controller para Dashboard de Orçamentos
 * 
 * RESPONSABILIDADES:
 * - Carregar dados do dashboard do servidor
 * - Coordenar DashboardView
 * - Emitir eventos para AppController
 * 
 * EVENTOS EMITIDOS (para AppController):
 * - 'verOrcamento'  → { id } - Quando clica em um orçamento
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class DashboardController extends EventEmitter {
    
    constructor({ dashboardView }) {
        super();
        
        this.view = dashboardView;
        this.dados = null;
        this.periodoAtual = 30;
        this.baseUrl = this.detectContextPath();
        
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindViewEvents() {
        // Ao abrir, carrega dados
        this.view.on('abrir', () => {
            this.carregarDados();
        });
        
        // Mudar período
        this.view.on('mudarPeriodo', ({ periodo }) => {
            this.periodoAtual = periodo;
            this.carregarDados();
        });
        
        // Ver orçamento específico
        this.view.on('verOrcamento', ({ id }) => {
            this.emit('verOrcamento', { id });
        });
    }

    // ========================================
    // MÉTODOS PÚBLICOS
    // ========================================

    /**
     * Abre o dashboard
     */
    abrir() {
        this.view.abrir();
    }

    /**
     * Fecha o dashboard
     */
    fechar() {
        this.view.fechar();
    }

    /**
     * Carrega dados do dashboard
     */
    async carregarDados() {
        this.view.showLoading();
        
        try {
            const url = `${this.baseUrl}/DashboardOrcamentos?periodo=${this.periodoAtual}`;
            
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║  📊 CARREGANDO DASHBOARD                                       ║');
            console.log('╚════════════════════════════════════════════════════════════════╝');
            console.log('Período:', this.periodoAtual, 'dias');
            console.log('URL:', url);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.dados = data;
                this.view.render(data);
                
                console.log('✅ Dashboard carregado!');
                console.log('   Total orçamentos:', data.metricas?.total || 0);
                console.log('   Taxa de conversão:', data.metricas?.taxaConversao || 0, '%');
                
            } else {
                throw new Error(data.message || 'Erro ao carregar dashboard');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            this.view.showError(error.message);
        }
    }

    /**
     * Retorna dados atuais
     */
    getDados() {
        return this.dados;
    }

    /**
     * Retorna período atual
     */
    getPeriodo() {
        return this.periodoAtual;
    }

    // ========================================
    // MÉTODOS PRIVADOS
    // ========================================

    /**
     * Detecta contexto da aplicação
     */
    detectContextPath() {
        const path = window.location.pathname;
        const match = path.match(/^\/[^\/]+/);
        return match ? match[0] : '';
    }
}
