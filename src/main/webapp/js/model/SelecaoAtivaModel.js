/**
 * SelecaoAtivaModel.js
 * Model para gerenciar seleções ativas (filtros e produtos)
 * 
 * RESPONSABILIDADES:
 * - Armazenar seleções únicas (tipoVisao, marca, familia)
 * - Armazenar seleções múltiplas (material, antireflexo, etc)
 * - Armazenar produtos selecionados
 * - Identificar tipos de seleção
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SelecaoAtivaModel extends EventEmitter {
    
    constructor() {
        super();
        
        // Seleções únicas (só pode ter uma de cada)
        this.selecaoUnica = {
            tipoVisao: null,  // { id, label, icon }
            marca: null,
            familia: null
        };
        
        // Seleções múltiplas (pode ter várias de cada tipo)
        this.selecaoMultipla = {
            material: [],      // [{ id, label, icon }, ...]
            antireflexo: [],
            fotossensivel: [],
            coloracao: [],     // NOVO: cores Total e Degradê
            antiblue: [],
            indice: []
        };
        
        // Produtos selecionados
        this.produtosSelecionados = [];
        
        // Tipos de visão conhecidos
        this.tiposVisao = ['multifocal', 'ocupacional', 'visaosimples', 'visao-simples'];
    }

    // ========================================
    // SELEÇÕES ÚNICAS
    // ========================================

    /**
     * Adiciona uma seleção (única ou múltipla)
     */
    adicionar(tipo, dados) {
        if (this.ehTipoUnico(tipo)) {
            this.selecaoUnica[tipo] = dados;
        } else if (this.ehTipoMultiplo(tipo)) {
            // Verifica se já existe
            const existe = this.selecaoMultipla[tipo].some(s => s.id === dados.id);
            if (!existe) {
                this.selecaoMultipla[tipo].push(dados);
            }
        }
        
        this.emit('change', this.getAtivas());
    }

    /**
     * Remove uma seleção
     */
    remover(tipo, id) {
        if (this.ehTipoUnico(tipo)) {
            this.selecaoUnica[tipo] = null;
        } else if (this.ehTipoMultiplo(tipo)) {
            this.selecaoMultipla[tipo] = this.selecaoMultipla[tipo].filter(s => s.id !== id);
        }
        
        this.emit('change', this.getAtivas());
    }

    /**
     * Remove seleção e todas as subsequentes (cascata)
     * Ordem: tipoVisao → marca → familia
     */
    removerACascata(tipo) {
        const ordem = ['tipoVisao', 'marca', 'familia'];
        const indice = ordem.indexOf(tipo);
        
        if (indice !== -1) {
            // Remove do tipo atual em diante
            for (let i = indice; i < ordem.length; i++) {
                this.selecaoUnica[ordem[i]] = null;
            }
        }
        
        this.emit('change', this.getAtivas());
    }

    /**
     * Retorna seleção por tipo
     */
    get(tipo) {
        if (this.ehTipoUnico(tipo)) {
            return this.selecaoUnica[tipo];
        } else if (this.ehTipoMultiplo(tipo)) {
            return this.selecaoMultipla[tipo];
        }
        return null;
    }

    /**
     * Limpa todas as seleções únicas
     */
    limpar() {
        this.selecaoUnica.tipoVisao = null;
        this.selecaoUnica.marca = null;
        this.selecaoUnica.familia = null;
        
        this.emit('change', this.getAtivas());
    }

    /**
     * Limpa todas as seleções (únicas e múltiplas)
     */
    limparTudo() {
        this.limpar();
        
        Object.keys(this.selecaoMultipla).forEach(tipo => {
            this.selecaoMultipla[tipo] = [];
        });
        
        this.produtosSelecionados = [];
        
        this.emit('change', this.getAtivas());
    }

    // ========================================
    // PRODUTOS SELECIONADOS
    // ========================================

    /**
     * Adiciona um produto selecionado
     * @returns {boolean} true se adicionou, false se já existia
     */
    adicionarProduto(produto) {
        const existe = this.produtosSelecionados.some(p => p.marca === produto.marca);
        
        if (!existe) {
            this.produtosSelecionados.push(produto);
            this.emit('change', this.getAtivas());
            return true;
        }
        
        return false;
    }

    /**
     * Remove um produto selecionado
     */
    removerProduto(marca) {
        this.produtosSelecionados = this.produtosSelecionados.filter(p => p.marca !== marca);
        this.emit('change', this.getAtivas());
    }

    /**
     * Limpa todos os produtos selecionados
     */
    limparProdutos() {
        this.produtosSelecionados = [];
        this.emit('change', this.getAtivas());
    }

    /**
     * Retorna produtos selecionados
     */
    getProdutosSelecionados() {
        return [...this.produtosSelecionados];
    }

    // ========================================
    // IDENTIFICAÇÃO DE TIPOS
    // ========================================

    /**
     * Verifica se é tipo único
     */
    ehTipoUnico(tipo) {
        return ['tipoVisao', 'marca', 'familia'].includes(tipo);
    }

    /**
     * Verifica se é tipo múltiplo
     */
    ehTipoMultiplo(tipo) {
        return ['material', 'antireflexo', 'fotossensivel', 'coloracao', 'antiblue', 'indice'].includes(tipo);
    }

    /**
     * Verifica se é um tipo de visão
     */
    ehTipoVisao(id) {
        if (!id) return false;
        const idLower = id.toLowerCase();
        return this.tiposVisao.some(tipo => idLower.includes(tipo));
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna todas as seleções ativas formatadas para exibição
     */
    getAtivas() {
        const ativas = [];
        
        // Seleções únicas
        if (this.selecaoUnica.tipoVisao) {
            ativas.push({
                tipo: 'tipoVisao',
                ...this.selecaoUnica.tipoVisao
            });
        }
        
        if (this.selecaoUnica.marca) {
            ativas.push({
                tipo: 'marca',
                ...this.selecaoUnica.marca
            });
        }
        
        if (this.selecaoUnica.familia) {
            ativas.push({
                tipo: 'familia',
                ...this.selecaoUnica.familia
            });
        }
        
        // Seleções múltiplas
        Object.keys(this.selecaoMultipla).forEach(tipo => {
            this.selecaoMultipla[tipo].forEach(item => {
                ativas.push({
                    tipo: tipo,
                    ...item
                });
            });
        });
        
        return ativas;
    }

    /**
     * Verifica se tem alguma seleção ativa
     */
    temSelecao() {
        return this.getAtivas().length > 0 || this.produtosSelecionados.length > 0;
    }

    /**
     * Retorna contagem de seleções
     */
    getContagem() {
        return {
            unicas: Object.values(this.selecaoUnica).filter(v => v !== null).length,
            multiplas: Object.values(this.selecaoMultipla).reduce((acc, arr) => acc + arr.length, 0),
            produtos: this.produtosSelecionados.length
        };
    }
}
