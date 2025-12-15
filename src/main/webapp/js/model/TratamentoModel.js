/**
 * TratamentoModel.js
 * Model - Gerencia tratamentos disponíveis e selecionados
 * 
 * RESPONSABILIDADES:
 * - Armazenar tratamentos disponíveis para uma lente/família
 * - Gerenciar seleção de tratamentos
 * - Calcular valor total dos tratamentos selecionados
 * - Validar compatibilidade de tratamentos
 * 
 * ESTRUTURA DE TRATAMENTO:
 * {
 *   codigo: number,
 *   nome: string,
 *   codigoFornecedor: string,
 *   valorVenda: number,
 *   obrigatorio: boolean,
 *   categoria: string        // 'antirreflexo' | 'coloracao' | 'fotossensivel' | etc
 * }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class TratamentoModel extends EventEmitter {
    
    constructor() {
        super();
        
        // Tratamentos disponíveis para seleção
        this.disponiveis = [];
        
        // Tratamentos selecionados
        this.selecionados = new Map(); // codigo -> tratamento
        
        // Contexto atual (lente/família para qual os tratamentos são válidos)
        this.contexto = {
            lenteId: null,
            familiaId: null,
            marcaId: null
        };
        
        // Categorias de tratamentos (para agrupamento na UI)
        this.categorias = {
            antirreflexo: 'Anti-Reflexo',
            coloracao: 'Coloração',
            fotossensivel: 'Fotossensível',
            outros: 'Outros'
        };
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna tratamentos disponíveis
     */
    getDisponiveis() {
        return [...this.disponiveis];
    }

    /**
     * Retorna tratamentos disponíveis agrupados por categoria
     */
    getDisponiveisPorCategoria() {
        const agrupados = {};
        
        this.disponiveis.forEach(t => {
            const categoria = t.categoria || 'outros';
            if (!agrupados[categoria]) {
                agrupados[categoria] = [];
            }
            agrupados[categoria].push(t);
        });
        
        return agrupados;
    }

    /**
     * Retorna tratamentos selecionados como array
     */
    getSelecionados() {
        return Array.from(this.selecionados.values());
    }

    /**
     * Retorna tratamento selecionado por código
     */
    getSelecionado(codigo) {
        return this.selecionados.get(codigo);
    }

    /**
     * Verifica se um tratamento está selecionado
     */
    estaSelecionado(codigo) {
        return this.selecionados.has(codigo);
    }

    /**
     * Retorna quantidade de tratamentos selecionados
     */
    getQuantidadeSelecionados() {
        return this.selecionados.size;
    }

    /**
     * Calcula valor total dos tratamentos selecionados
     */
    getValorTotal() {
        let total = 0;
        this.selecionados.forEach(t => {
            total += t.valorVenda || 0;
        });
        return total;
    }

    /**
     * Retorna contexto atual
     */
    getContexto() {
        return { ...this.contexto };
    }

    /**
     * Verifica se há tratamentos disponíveis
     */
    temDisponiveis() {
        return this.disponiveis.length > 0;
    }

    /**
     * Verifica se há tratamentos selecionados
     */
    temSelecionados() {
        return this.selecionados.size > 0;
    }

    // ========================================
    // DEFINIR DISPONÍVEIS
    // ========================================

    /**
     * Define tratamentos disponíveis para uma lente/família
     */
    setDisponiveis(tratamentos, contexto = {}) {
        this.disponiveis = tratamentos.map(t => ({
            codigo: t.codigo,
            nome: t.nome,
            codigoFornecedor: t.codigoFornecedor || t.codigo_fornecedor,
            valorVenda: t.valorVenda || t.venda || 0,
            obrigatorio: t.obrigatorio || false,
            categoria: t.categoria || this.detectarCategoria(t.nome)
        }));
        
        // Atualiza contexto
        this.contexto = {
            lenteId: contexto.lenteId || null,
            familiaId: contexto.familiaId || null,
            marcaId: contexto.marcaId || null
        };
        
        // Limpa seleção anterior
        this.limparSelecao();
        
        // Seleciona obrigatórios automaticamente
        this.disponiveis.forEach(t => {
            if (t.obrigatorio) {
                this.selecionar(t.codigo);
            }
        });
        
        this.emit('disponiveisAtualizados', { 
            tratamentos: this.disponiveis,
            contexto: this.contexto
        });
    }

    /**
     * Detecta categoria pelo nome do tratamento
     */
    detectarCategoria(nome) {
        const nomeUpper = (nome || '').toUpperCase();
        
        if (nomeUpper.includes('ANTI') || nomeUpper.includes('AR ') || nomeUpper.includes('CLEAN')) {
            return 'antirreflexo';
        }
        if (nomeUpper.includes('FOTO') || nomeUpper.includes('TRANSITIONS')) {
            return 'fotossensivel';
        }
        if (nomeUpper.includes('COLOR') || nomeUpper.includes('CINZA') || nomeUpper.includes('MARROM')) {
            return 'coloracao';
        }
        
        return 'outros';
    }

    /**
     * Limpa tratamentos disponíveis
     */
    limparDisponiveis() {
        this.disponiveis = [];
        this.limparSelecao();
        this.contexto = { lenteId: null, familiaId: null, marcaId: null };
        
        this.emit('disponiveisLimpos');
    }

    // ========================================
    // SELEÇÃO
    // ========================================

    /**
     * Seleciona um tratamento
     */
    selecionar(codigo) {
        const tratamento = this.disponiveis.find(t => t.codigo === codigo);
        
        if (!tratamento) {
            console.warn(`Tratamento ${codigo} não encontrado nos disponíveis`);
            return false;
        }
        
        if (this.selecionados.has(codigo)) {
            return false; // Já selecionado
        }
        
        this.selecionados.set(codigo, { ...tratamento });
        
        this.emit('tratamentoSelecionado', { 
            tratamento,
            valorTotal: this.getValorTotal()
        });
        
        this.emit('selecaoAlterada', {
            selecionados: this.getSelecionados(),
            valorTotal: this.getValorTotal()
        });
        
        return true;
    }

    /**
     * Remove seleção de um tratamento
     */
    desselecionar(codigo) {
        const tratamento = this.selecionados.get(codigo);
        
        if (!tratamento) {
            return false;
        }
        
        // Não permite remover obrigatórios
        if (tratamento.obrigatorio) {
            this.emit('erroRemocao', { 
                codigo, 
                mensagem: 'Tratamento obrigatório não pode ser removido' 
            });
            return false;
        }
        
        this.selecionados.delete(codigo);
        
        this.emit('tratamentoDesselecionado', { 
            tratamento,
            valorTotal: this.getValorTotal()
        });
        
        this.emit('selecaoAlterada', {
            selecionados: this.getSelecionados(),
            valorTotal: this.getValorTotal()
        });
        
        return true;
    }

    /**
     * Alterna seleção de um tratamento
     */
    toggle(codigo) {
        if (this.selecionados.has(codigo)) {
            return this.desselecionar(codigo);
        } else {
            return this.selecionar(codigo);
        }
    }

    /**
     * Limpa toda a seleção (mantém obrigatórios)
     */
    limparSelecao() {
        // Remove não-obrigatórios
        const aRemover = [];
        this.selecionados.forEach((t, codigo) => {
            if (!t.obrigatorio) {
                aRemover.push(codigo);
            }
        });
        
        aRemover.forEach(codigo => this.selecionados.delete(codigo));
        
        this.emit('selecaoLimpa', {
            selecionados: this.getSelecionados(),
            valorTotal: this.getValorTotal()
        });
    }

    /**
     * Define seleção (substitui atual)
     */
    setSelecao(codigos) {
        // Limpa atual
        this.selecionados.clear();
        
        // Adiciona obrigatórios primeiro
        this.disponiveis.forEach(t => {
            if (t.obrigatorio) {
                this.selecionados.set(t.codigo, { ...t });
            }
        });
        
        // Adiciona os solicitados
        codigos.forEach(codigo => {
            const tratamento = this.disponiveis.find(t => t.codigo === codigo);
            if (tratamento && !this.selecionados.has(codigo)) {
                this.selecionados.set(codigo, { ...tratamento });
            }
        });
        
        this.emit('selecaoAlterada', {
            selecionados: this.getSelecionados(),
            valorTotal: this.getValorTotal()
        });
    }

    // ========================================
    // SERIALIZAÇÃO
    // ========================================

    /**
     * Exporta selecionados para envio ao backend
     * (Formato compatível com AdicionarCarrinhoTratamentoDistinto)
     */
    toJSON() {
        return this.getSelecionados().map(t => ({
            codigo: t.codigo,
            nome: t.nome,
            codigo_fornecedor: t.codigoFornecedor,
            venda: t.valorVenda
        }));
    }

    /**
     * Exporta como array de strings JSON
     * (Formato selected_treatments[] do servlet)
     */
    toSelectedTreatmentsArray() {
        return this.getSelecionados().map(t => JSON.stringify({
            codigo: t.codigo,
            nome: t.nome,
            codigo_fornecedor: t.codigoFornecedor,
            venda: t.valorVenda
        }));
    }
}
