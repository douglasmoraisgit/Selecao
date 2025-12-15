/**
 * TratamentoSelectorView.js
 * View - Modal para seleção de tratamentos
 * 
 * RESPONSABILIDADES:
 * - Exibir modal com tratamentos disponíveis
 * - Permitir seleção/desseleção de tratamentos
 * - Mostrar valor total dos tratamentos
 * - Feedback visual de seleção
 * 
 * EVENTOS EMITIDOS:
 * - 'tratamentoToggle'     → { codigo }
 * - 'confirmar'            → { tratamentos }
 * - 'cancelar'             → {}
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';
import { formatCurrency, createElement, $, $$ } from '../util/helpers.js';

export default class TratamentoSelectorView extends EventEmitter {
    
    constructor() {
        super();
        
        this.modal = null;
        this.bsModal = null;
        this.tratamentos = [];
        this.selecionados = new Set();
        this.contexto = {};
        
        this.createModal();
    }

    // ========================================
    // CRIAÇÃO DO MODAL
    // ========================================

    createModal() {
        // Remove modal existente se houver
        const existente = $('#tratamentoSelectorModal');
        if (existente) existente.remove();
        
        const modalHtml = `
            <div class="modal fade" id="tratamentoSelectorModal" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-layer-group me-2"></i>
                                Selecionar Tratamentos
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        
                        <div class="modal-body">
                            <!-- Contexto da lente -->
                            <div id="tratamento-contexto" class="alert alert-info mb-3">
                                <strong>Lente:</strong> <span id="contexto-lente"></span>
                            </div>
                            
                            <!-- Lista de tratamentos -->
                            <div id="tratamento-lista" class="tratamento-lista">
                                <!-- Renderizado dinamicamente -->
                            </div>
                            
                            <!-- Resumo de seleção -->
                            <div id="tratamento-resumo" class="card bg-light mt-3">
                                <div class="card-body py-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>Tratamentos selecionados:</strong>
                                            <span id="qtd-selecionados" class="badge bg-primary ms-2">0</span>
                                        </span>
                                        <span>
                                            <strong>Valor adicional:</strong>
                                            <span id="valor-tratamentos" class="text-success ms-2">R$ 0,00</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btnConfirmarTratamentos">
                                <i class="fas fa-check me-1"></i> Confirmar Seleção
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        this.modal = $('#tratamentoSelectorModal');
        this.bindModalEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindModalEvents() {
        // Botão confirmar
        $('#btnConfirmarTratamentos', this.modal).addEventListener('click', () => {
            this.emit('confirmar', { 
                tratamentos: Array.from(this.selecionados) 
            });
            this.hide();
        });
        
        // Evento ao fechar
        this.modal.addEventListener('hidden.bs.modal', () => {
            this.emit('cancelar');
        });
    }

    bindTratamentoEvents() {
        $$('.tratamento-item', this.modal).forEach(item => {
            item.addEventListener('click', (e) => {
                // Ignora se clicar em checkbox diretamente
                if (e.target.type === 'checkbox') return;
                
                const codigo = parseInt(item.dataset.codigo);
                const obrigatorio = item.dataset.obrigatorio === 'true';
                
                if (!obrigatorio) {
                    this.toggleTratamento(codigo);
                    this.emit('tratamentoToggle', { codigo });
                }
            });
            
            // Checkbox
            const checkbox = $('input[type="checkbox"]', item);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const codigo = parseInt(item.dataset.codigo);
                    const obrigatorio = item.dataset.obrigatorio === 'true';
                    
                    if (!obrigatorio) {
                        this.toggleTratamento(codigo);
                        this.emit('tratamentoToggle', { codigo });
                    } else {
                        // Reverte se for obrigatório
                        e.preventDefault();
                        checkbox.checked = true;
                    }
                });
            }
        });
    }

    // ========================================
    // EXIBIÇÃO
    // ========================================

    /**
     * Mostra modal com tratamentos disponíveis
     */
    show(tratamentos, selecionados = [], contexto = {}) {
        this.tratamentos = tratamentos || [];
        this.selecionados = new Set(selecionados.map(t => t.codigo || t));
        this.contexto = contexto;
        
        this.renderContexto();
        this.renderTratamentos();
        this.atualizarResumo();
        
        if (!this.bsModal) {
            this.bsModal = new bootstrap.Modal(this.modal);
        }
        
        this.bsModal.show();
    }

    /**
     * Esconde modal
     */
    hide() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

    // ========================================
    // RENDERIZAÇÃO
    // ========================================

    renderContexto() {
        const spanLente = $('#contexto-lente', this.modal);
        if (spanLente) {
            spanLente.textContent = this.contexto.descricaoLente || 'Lente selecionada';
        }
    }

    renderTratamentos() {
        const container = $('#tratamento-lista', this.modal);
        if (!container) return;
        
        if (this.tratamentos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-info-circle fa-2x mb-2"></i>
                    <p>Nenhum tratamento disponível para esta lente</p>
                </div>
            `;
            return;
        }
        
        // Agrupa por categoria
        const porCategoria = this.agruparPorCategoria(this.tratamentos);
        
        let html = '';
        
        Object.entries(porCategoria).forEach(([categoria, tratamentos]) => {
            const nomeCategoria = this.getNomeCategoria(categoria);
            
            html += `
                <div class="tratamento-categoria mb-3">
                    <h6 class="text-muted border-bottom pb-2 mb-2">
                        <i class="${this.getIconeCategoria(categoria)} me-2"></i>
                        ${nomeCategoria}
                    </h6>
                    <div class="row g-2">
                        ${tratamentos.map(t => this.renderTratamentoItem(t)).join('')}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        this.bindTratamentoEvents();
    }

    renderTratamentoItem(tratamento) {
        const selecionado = this.selecionados.has(tratamento.codigo);
        const obrigatorio = tratamento.obrigatorio || false;
        
        return `
            <div class="col-md-6">
                <div class="tratamento-item card ${selecionado ? 'border-primary bg-primary-subtle' : ''} ${obrigatorio ? 'tratamento-obrigatorio' : ''}"
                     data-codigo="${tratamento.codigo}"
                     data-obrigatorio="${obrigatorio}"
                     style="cursor: ${obrigatorio ? 'not-allowed' : 'pointer'};">
                    <div class="card-body py-2 px-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="form-check mb-0">
                                <input class="form-check-input" 
                                       type="checkbox" 
                                       id="trat-${tratamento.codigo}"
                                       ${selecionado ? 'checked' : ''} 
                                       ${obrigatorio ? 'disabled' : ''}>
                                <label class="form-check-label" for="trat-${tratamento.codigo}">
                                    <strong>${tratamento.nome}</strong>
                                    ${obrigatorio ? '<span class="badge bg-warning text-dark ms-1">Obrigatório</span>' : ''}
                                </label>
                            </div>
                            <span class="badge ${tratamento.valorVenda > 0 ? 'bg-success' : 'bg-secondary'}">
                                ${tratamento.valorVenda > 0 ? formatCurrency(tratamento.valorVenda) : 'Incluso'}
                            </span>
                        </div>
                        ${tratamento.codigoFornecedor ? `
                            <small class="text-muted">Cód: ${tratamento.codigoFornecedor}</small>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // SELEÇÃO
    // ========================================

    toggleTratamento(codigo) {
        const item = $(`.tratamento-item[data-codigo="${codigo}"]`, this.modal);
        const checkbox = item ? $('input[type="checkbox"]', item) : null;
        
        if (this.selecionados.has(codigo)) {
            this.selecionados.delete(codigo);
            if (item) item.classList.remove('border-primary', 'bg-primary-subtle');
            if (checkbox) checkbox.checked = false;
        } else {
            this.selecionados.add(codigo);
            if (item) item.classList.add('border-primary', 'bg-primary-subtle');
            if (checkbox) checkbox.checked = true;
        }
        
        this.atualizarResumo();
    }

    /**
     * Atualiza seleção externamente
     */
    atualizarSelecao(selecionados) {
        this.selecionados = new Set(selecionados.map(t => t.codigo || t));
        
        // Atualiza UI
        $$('.tratamento-item', this.modal).forEach(item => {
            const codigo = parseInt(item.dataset.codigo);
            const checkbox = $('input[type="checkbox"]', item);
            
            if (this.selecionados.has(codigo)) {
                item.classList.add('border-primary', 'bg-primary-subtle');
                if (checkbox) checkbox.checked = true;
            } else {
                item.classList.remove('border-primary', 'bg-primary-subtle');
                if (checkbox) checkbox.checked = false;
            }
        });
        
        this.atualizarResumo();
    }

    // ========================================
    // RESUMO
    // ========================================

    atualizarResumo() {
        const qtdSpan = $('#qtd-selecionados', this.modal);
        const valorSpan = $('#valor-tratamentos', this.modal);
        
        // Calcula valor total dos selecionados
        let valorTotal = 0;
        this.selecionados.forEach(codigo => {
            const tratamento = this.tratamentos.find(t => t.codigo === codigo);
            if (tratamento) {
                valorTotal += tratamento.valorVenda || 0;
            }
        });
        
        if (qtdSpan) qtdSpan.textContent = this.selecionados.size;
        if (valorSpan) valorSpan.textContent = formatCurrency(valorTotal);
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================

    agruparPorCategoria(tratamentos) {
        const agrupados = {};
        
        tratamentos.forEach(t => {
            const categoria = t.categoria || 'outros';
            if (!agrupados[categoria]) {
                agrupados[categoria] = [];
            }
            agrupados[categoria].push(t);
        });
        
        return agrupados;
    }

    getNomeCategoria(categoria) {
        const nomes = {
            antirreflexo: 'Anti-Reflexo',
            fotossensivel: 'Fotossensível',
            coloracao: 'Coloração',
            outros: 'Outros Tratamentos'
        };
        return nomes[categoria] || categoria;
    }

    getIconeCategoria(categoria) {
        const icones = {
            antirreflexo: 'fas fa-sun',
            fotossensivel: 'fas fa-adjust',
            coloracao: 'fas fa-palette',
            outros: 'fas fa-plus-circle'
        };
        return icones[categoria] || 'fas fa-circle';
    }

    /**
     * Retorna tratamentos selecionados completos
     */
    getTratamentosSelecionados() {
        return this.tratamentos.filter(t => this.selecionados.has(t.codigo));
    }
}
