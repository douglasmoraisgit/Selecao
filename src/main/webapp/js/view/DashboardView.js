/**
 * DashboardView.js
 * View para Dashboard de Orçamentos
 * 
 * FUNCIONALIDADES:
 * - Cards com métricas principais
 * - Gráfico de barras (orçamentos por dia)
 * - Gráfico de pizza (distribuição por status)
 * - Top clientes
 * - Últimos orçamentos
 * - Comparativo com período anterior
 * 
 * EVENTOS EMITIDOS:
 * - 'mudarPeriodo'    → { periodo }
 * - 'verOrcamento'    → { id }
 * - 'fechar'          → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class DashboardView extends EventEmitter {
    
    constructor() {
        super();
        this.container = null;
        this.dados = null;
        this.periodoAtual = 30;
        
        this.cores = {
            PENDENTE: '#f59e0b',
            CONVERTIDO: '#10b981',
            EXPIRADO: '#ef4444',
            primary: '#6366f1',
            secondary: '#8b5cf6'
        };
        
        this.injectStyles();
        this.createModal();
    }

    // ========================================
    // ESTILOS CSS
    // ========================================

    injectStyles() {
        if (document.getElementById('dashboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            /* ========================================
               MODAL DASHBOARD
            ======================================== */
            
            .dashboard-overlay {
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
            
            .dashboard-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .dashboard-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: #f3f4f6;
                border-radius: 16px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                z-index: 10001;
                width: 95%;
                max-width: 1200px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .dashboard-overlay.active .dashboard-modal {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            /* Header */
            .dashboard-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
                border-radius: 16px 16px 0 0;
                color: white;
            }
            
            .dashboard-header h2 {
                margin: 0;
                font-size: 1.3rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .dashboard-header h2 .icon {
                font-size: 1.5rem;
            }
            
            .dashboard-periodo {
                display: flex;
                gap: 8px;
            }
            
            .periodo-btn {
                padding: 8px 16px;
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 20px;
                background: transparent;
                color: white;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .periodo-btn:hover {
                background: rgba(255,255,255,0.1);
            }
            
            .periodo-btn.active {
                background: white;
                color: #312e81;
                border-color: white;
            }
            
            .dashboard-close {
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
            
            .dashboard-close:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.1);
            }
            
            /* Conteúdo */
            .dashboard-content {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
            }
            
            /* Cards de métricas */
            .metricas-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .metrica-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                position: relative;
                overflow: hidden;
            }
            
            .metrica-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
            }
            
            .metrica-card.total::before { background: #6366f1; }
            .metrica-card.pendentes::before { background: #f59e0b; }
            .metrica-card.convertidos::before { background: #10b981; }
            .metrica-card.expirados::before { background: #ef4444; }
            .metrica-card.valor::before { background: #8b5cf6; }
            .metrica-card.taxa::before { background: #06b6d4; }
            
            .metrica-icon {
                font-size: 2rem;
                margin-bottom: 8px;
            }
            
            .metrica-valor {
                font-size: 2rem;
                font-weight: 700;
                color: #111827;
                line-height: 1;
            }
            
            .metrica-label {
                font-size: 0.85rem;
                color: #6b7280;
                margin-top: 4px;
            }
            
            .metrica-variacao {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-top: 8px;
                padding: 4px 8px;
                border-radius: 12px;
            }
            
            .metrica-variacao.positiva {
                background: #d1fae5;
                color: #059669;
            }
            
            .metrica-variacao.negativa {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .metrica-variacao.neutra {
                background: #e5e7eb;
                color: #6b7280;
            }
            
            /* Grid de gráficos */
            .graficos-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 24px;
                margin-bottom: 24px;
            }
            
            .grafico-card {
                background: white;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .grafico-card h3 {
                margin: 0 0 16px 0;
                font-size: 1rem;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Gráfico de barras */
            .grafico-barras {
                height: 200px;
                display: flex;
                align-items: flex-end;
                gap: 4px;
                padding-top: 20px;
                border-bottom: 2px solid #e5e7eb;
            }
            
            .barra-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            
            .barra {
                width: 100%;
                max-width: 40px;
                background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
                border-radius: 4px 4px 0 0;
                min-height: 4px;
                transition: height 0.5s ease;
                position: relative;
            }
            
            .barra:hover {
                opacity: 0.8;
            }
            
            .barra-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: #1f2937;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }
            
            .barra:hover .barra-tooltip {
                opacity: 1;
            }
            
            .barra-label {
                font-size: 0.7rem;
                color: #9ca3af;
                text-align: center;
            }
            
            /* Gráfico de pizza */
            .grafico-pizza-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }
            
            .pizza {
                width: 160px;
                height: 160px;
                border-radius: 50%;
                position: relative;
            }
            
            .pizza-centro {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .pizza-centro-valor {
                font-size: 1.5rem;
                font-weight: 700;
                color: #111827;
            }
            
            .pizza-centro-label {
                font-size: 0.7rem;
                color: #6b7280;
            }
            
            .pizza-legenda {
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;
            }
            
            .legenda-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.85rem;
            }
            
            .legenda-cor {
                width: 12px;
                height: 12px;
                border-radius: 3px;
            }
            
            .legenda-label {
                flex: 1;
                color: #374151;
            }
            
            .legenda-valor {
                font-weight: 600;
                color: #111827;
            }
            
            /* Grid inferior */
            .grid-inferior {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
            
            /* Top clientes */
            .top-clientes-lista {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .cliente-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .cliente-rank {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 700;
            }
            
            .cliente-rank.top1 { background: #fef3c7; color: #d97706; }
            .cliente-rank.top2 { background: #e5e7eb; color: #6b7280; }
            .cliente-rank.top3 { background: #fed7aa; color: #c2410c; }
            .cliente-rank.outros { background: #f3f4f6; color: #9ca3af; }
            
            .cliente-info {
                flex: 1;
            }
            
            .cliente-nome {
                font-weight: 600;
                color: #111827;
            }
            
            .cliente-stats {
                font-size: 0.8rem;
                color: #6b7280;
            }
            
            .cliente-valor {
                font-weight: 700;
                color: #059669;
            }
            
            /* Últimos orçamentos */
            .ultimos-lista {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .ultimo-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: #f9fafb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .ultimo-item:hover {
                background: #e5e7eb;
            }
            
            .ultimo-status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            
            .ultimo-status.PENDENTE { background: #f59e0b; }
            .ultimo-status.CONVERTIDO { background: #10b981; }
            .ultimo-status.EXPIRADO { background: #ef4444; }
            
            .ultimo-info {
                flex: 1;
            }
            
            .ultimo-cliente {
                font-weight: 500;
                color: #111827;
                font-size: 0.9rem;
            }
            
            .ultimo-data {
                font-size: 0.75rem;
                color: #9ca3af;
            }
            
            .ultimo-valor {
                font-weight: 600;
                color: #059669;
            }
            
            /* Loading */
            .dashboard-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px;
            }
            
            .dashboard-loading .spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #e5e7eb;
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Responsivo */
            @media (max-width: 900px) {
                .graficos-grid {
                    grid-template-columns: 1fr;
                }
                
                .grid-inferior {
                    grid-template-columns: 1fr;
                }
            }
            
            @media (max-width: 640px) {
                .dashboard-modal {
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
                
                .dashboard-header {
                    border-radius: 0;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                
                .dashboard-periodo {
                    order: 3;
                    width: 100%;
                    justify-content: center;
                }
                
                .metricas-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .metrica-valor {
                    font-size: 1.5rem;
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
        this.container.className = 'dashboard-overlay';
        this.container.innerHTML = `
            <div class="dashboard-modal">
                <!-- Header -->
                <div class="dashboard-header">
                    <h2>
                        <span class="icon">📊</span>
                        Dashboard de Orçamentos
                    </h2>
                    <div class="dashboard-periodo">
                        <button class="periodo-btn" data-periodo="7">7 dias</button>
                        <button class="periodo-btn active" data-periodo="30">30 dias</button>
                        <button class="periodo-btn" data-periodo="90">90 dias</button>
                    </div>
                    <button class="dashboard-close" title="Fechar">✕</button>
                </div>
                
                <!-- Conteúdo -->
                <div class="dashboard-content" id="dashboardContent">
                    <div class="dashboard-loading">
                        <div class="spinner"></div>
                        <p style="margin-top: 16px; color: #6b7280;">Carregando dados...</p>
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
        $('.dashboard-close').addEventListener('click', () => this.fechar());
        
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
        
        // Botões de período
        $$('.periodo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.periodo-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.periodoAtual = parseInt(btn.dataset.periodo);
                this.emit('mudarPeriodo', { periodo: this.periodoAtual });
            });
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
        this.emit('fechar');
    }

    showLoading() {
        const content = this.container.querySelector('#dashboardContent');
        content.innerHTML = `
            <div class="dashboard-loading">
                <div class="spinner"></div>
                <p style="margin-top: 16px; color: #6b7280;">Carregando dados...</p>
            </div>
        `;
    }

    showError(mensagem) {
        const content = this.container.querySelector('#dashboardContent');
        content.innerHTML = `
            <div class="dashboard-loading">
                <span style="font-size: 3rem;">❌</span>
                <p style="margin-top: 16px; color: #dc2626;">${mensagem}</p>
            </div>
        `;
    }

    /**
     * Renderiza o dashboard com os dados
     */
    render(dados) {
        this.dados = dados;
        const content = this.container.querySelector('#dashboardContent');
        
        const metricas = dados.metricas || {};
        const comparativo = dados.comparativo || {};
        const porDia = dados.porDia || [];
        const porStatus = dados.porStatus || [];
        const topClientes = dados.topClientes || [];
        const ultimos = dados.ultimosOrcamentos || [];
        
        content.innerHTML = `
            <!-- Cards de métricas -->
            <div class="metricas-grid">
                ${this.renderMetricaCard('📋', metricas.total || 0, 'Total de Orçamentos', 'total', comparativo.variacaoQuantidade)}
                ${this.renderMetricaCard('⏳', metricas.pendentes || 0, 'Pendentes', 'pendentes')}
                ${this.renderMetricaCard('✅', metricas.convertidos || 0, 'Convertidos', 'convertidos')}
                ${this.renderMetricaCard('⌛', metricas.expirados || 0, 'Expirados', 'expirados')}
                ${this.renderMetricaCard('💰', this.formatarMoeda(metricas.valorTotal || 0), 'Valor Total', 'valor', comparativo.variacaoValor)}
                ${this.renderMetricaCard('📈', (metricas.taxaConversao || 0) + '%', 'Taxa de Conversão', 'taxa')}
            </div>
            
            <!-- Gráficos -->
            <div class="graficos-grid">
                <div class="grafico-card">
                    <h3>📈 Orçamentos por Dia</h3>
                    ${this.renderGraficoBarras(porDia)}
                </div>
                
                <div class="grafico-card">
                    <h3>📊 Distribuição por Status</h3>
                    ${this.renderGraficoPizza(porStatus, metricas.total || 0)}
                </div>
            </div>
            
            <!-- Grid inferior -->
            <div class="grid-inferior">
                <div class="grafico-card">
                    <h3>🏆 Top Clientes</h3>
                    ${this.renderTopClientes(topClientes)}
                </div>
                
                <div class="grafico-card">
                    <h3>🕐 Últimos Orçamentos</h3>
                    ${this.renderUltimosOrcamentos(ultimos)}
                </div>
            </div>
        `;
        
        // Bind eventos dos últimos orçamentos
        this.bindUltimosEvents();
    }

    // ========================================
    // MÉTODOS DE RENDERIZAÇÃO
    // ========================================

    renderMetricaCard(icon, valor, label, tipo, variacao = null) {
        let variacaoHtml = '';
        if (variacao !== null && variacao !== undefined) {
            const classe = variacao > 0 ? 'positiva' : (variacao < 0 ? 'negativa' : 'neutra');
            const seta = variacao > 0 ? '↑' : (variacao < 0 ? '↓' : '→');
            variacaoHtml = `<div class="metrica-variacao ${classe}">${seta} ${Math.abs(variacao)}%</div>`;
        }
        
        return `
            <div class="metrica-card ${tipo}">
                <div class="metrica-icon">${icon}</div>
                <div class="metrica-valor">${valor}</div>
                <div class="metrica-label">${label}</div>
                ${variacaoHtml}
            </div>
        `;
    }

    renderGraficoBarras(dados) {
        if (!dados || dados.length === 0) {
            return '<p style="text-align: center; color: #9ca3af; padding: 40px;">Sem dados no período</p>';
        }
        
        const maxValor = Math.max(...dados.map(d => d.quantidade || 0), 1);
        
        return `
            <div class="grafico-barras">
                ${dados.map(d => {
                    const altura = ((d.quantidade || 0) / maxValor) * 180;
                    const dia = new Date(d.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    return `
                        <div class="barra-container">
                            <div class="barra" style="height: ${altura}px;">
                                <div class="barra-tooltip">
                                    ${d.quantidade} orç.<br>
                                    R$ ${this.formatarValor(d.valor)}
                                </div>
                            </div>
                            <div class="barra-label">${dia}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderGraficoPizza(dados, total) {
        if (!dados || dados.length === 0 || total === 0) {
            return '<p style="text-align: center; color: #9ca3af; padding: 40px;">Sem dados</p>';
        }
        
        // Calcula ângulos para o gradiente cônico
        let graus = 0;
        const segmentos = dados.map(d => {
            const porcentagem = (d.quantidade / total) * 100;
            const inicio = graus;
            graus += (porcentagem * 3.6); // 360° / 100%
            return {
                ...d,
                porcentagem,
                inicio,
                fim: graus
            };
        });
        
        // Monta o gradiente cônico
        const gradiente = segmentos.map(s => {
            return `${this.cores[s.status] || '#9ca3af'} ${s.inicio}deg ${s.fim}deg`;
        }).join(', ');
        
        return `
            <div class="grafico-pizza-container">
                <div class="pizza" style="background: conic-gradient(${gradiente});">
                    <div class="pizza-centro">
                        <div class="pizza-centro-valor">${total}</div>
                        <div class="pizza-centro-label">Total</div>
                    </div>
                </div>
                <div class="pizza-legenda">
                    ${segmentos.map(s => `
                        <div class="legenda-item">
                            <div class="legenda-cor" style="background: ${this.cores[s.status] || '#9ca3af'}"></div>
                            <div class="legenda-label">${this.getStatusLabel(s.status)}</div>
                            <div class="legenda-valor">${s.quantidade} (${Math.round(s.porcentagem)}%)</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderTopClientes(clientes) {
        if (!clientes || clientes.length === 0) {
            return '<p style="text-align: center; color: #9ca3af; padding: 20px;">Nenhum cliente no período</p>';
        }
        
        return `
            <div class="top-clientes-lista">
                ${clientes.map((c, i) => {
                    const rankClass = i === 0 ? 'top1' : (i === 1 ? 'top2' : (i === 2 ? 'top3' : 'outros'));
                    return `
                        <div class="cliente-item">
                            <div class="cliente-rank ${rankClass}">${i + 1}º</div>
                            <div class="cliente-info">
                                <div class="cliente-nome">${c.nome}</div>
                                <div class="cliente-stats">${c.quantidade} orç. • ${c.convertidos} conv.</div>
                            </div>
                            <div class="cliente-valor">R$ ${this.formatarValor(c.valorTotal)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderUltimosOrcamentos(orcamentos) {
        if (!orcamentos || orcamentos.length === 0) {
            return '<p style="text-align: center; color: #9ca3af; padding: 20px;">Nenhum orçamento</p>';
        }
        
        return `
            <div class="ultimos-lista">
                ${orcamentos.map(o => {
                    const data = new Date(o.dataHora).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    return `
                        <div class="ultimo-item" data-id="${o.id}">
                            <div class="ultimo-status ${o.status}"></div>
                            <div class="ultimo-info">
                                <div class="ultimo-cliente">${o.clienteNome || 'Sem nome'}</div>
                                <div class="ultimo-data">#${o.id} • ${data}</div>
                            </div>
                            <div class="ultimo-valor">R$ ${this.formatarValor(o.total)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    bindUltimosEvents() {
        const itens = this.container.querySelectorAll('.ultimo-item');
        itens.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.emit('verOrcamento', { id });
            });
        });
    }

    // ========================================
    // HELPERS
    // ========================================

    formatarValor(valor) {
        if (valor === null || valor === undefined) return '0,00';
        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatarMoeda(valor) {
        if (valor >= 1000000) {
            return 'R$ ' + (valor / 1000000).toFixed(1) + 'M';
        } else if (valor >= 1000) {
            return 'R$ ' + (valor / 1000).toFixed(1) + 'K';
        }
        return 'R$ ' + this.formatarValor(valor);
    }

    getStatusLabel(status) {
        const labels = {
            'PENDENTE': '⏳ Pendentes',
            'CONVERTIDO': '✅ Convertidos',
            'EXPIRADO': '⌛ Expirados'
        };
        return labels[status] || status;
    }
}
