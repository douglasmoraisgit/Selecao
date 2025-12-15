/**
 * ReceitaModel.js
 * Model - Gerencia dados da receita óptica
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class ReceitaModel extends EventEmitter {
    
    constructor() {
        super();
        
        this.STORAGE_KEY = 'receitaCliente';
        
        // Estrutura padrão da receita
        this.receita = {
            // Olho Direito (OD)
            rod_esf: 0,
            rod_cil: 0,
            rod_eixo: 0,
            rod_adicao: 0,
            // Olho Esquerdo (OE)
            roe_esf: 0,
            roe_cil: 0,
            roe_eixo: 0,
            roe_adicao: 0
        };
        
        // Carrega do localStorage se existir
        this.carregar();
    }
    
    /**
     * Carrega receita do localStorage
     */
    carregar() {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            if (json) {
                const dados = JSON.parse(json);
                this.receita = { ...this.receita, ...dados };
                console.log('📋 Receita carregada:', this.receita);
                return true;
            }
        } catch (error) {
            console.error('Erro ao carregar receita:', error);
        }
        return false;
    }
    
    /**
     * Salva receita no localStorage
     */
    salvar() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.receita));
            console.log('💾 Receita salva:', this.receita);
            this.emit('salva', this.receita);
            return true;
        } catch (error) {
            console.error('Erro ao salvar receita:', error);
            return false;
        }
    }
    
    /**
     * Limpa receita
     */
    limpar() {
        this.receita = {
            rod_esf: 0,
            rod_cil: 0,
            rod_eixo: 0,
            rod_adicao: 0,
            roe_esf: 0,
            roe_cil: 0,
            roe_eixo: 0,
            roe_adicao: 0
        };
        
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🗑️ Receita limpa');
            this.emit('limpa');
            return true;
        } catch (error) {
            console.error('Erro ao limpar receita:', error);
            return false;
        }
    }
    
    /**
     * Atualiza um campo da receita
     */
    setCampo(campo, valor) {
        if (campo in this.receita) {
            this.receita[campo] = parseFloat(valor) || 0;
            this.emit('change', { campo, valor: this.receita[campo] });
        }
    }
    
    /**
     * Atualiza múltiplos campos
     */
    setDados(dados) {
        Object.keys(dados).forEach(campo => {
            if (campo in this.receita) {
                this.receita[campo] = parseFloat(dados[campo]) || 0;
            }
        });
        this.emit('change', this.receita);
    }
    
    /**
     * Retorna a receita completa
     */
    getReceita() {
        return { ...this.receita };
    }
    
    /**
     * Retorna dados do OD
     */
    getOD() {
        return {
            esf: this.receita.rod_esf,
            cil: this.receita.rod_cil,
            eixo: this.receita.rod_eixo,
            adicao: this.receita.rod_adicao
        };
    }
    
    /**
     * Retorna dados do OE
     */
    getOE() {
        return {
            esf: this.receita.roe_esf,
            cil: this.receita.roe_cil,
            eixo: this.receita.roe_eixo,
            adicao: this.receita.roe_adicao
        };
    }
    
    /**
     * Verifica se tem receita preenchida
     */
    temReceita() {
        return Object.values(this.receita).some(v => v !== 0);
    }
    
    /**
     * Verifica se precisa de adição (multifocal/bifocal)
     */
    precisaAdicao() {
        return this.receita.rod_adicao > 0 || this.receita.roe_adicao > 0;
    }
    
    /**
     * Retorna resumo formatado
     */
    getResumo() {
        const od = this.getOD();
        const oe = this.getOE();
        
        const formatarOlho = (dados) => {
            let partes = [];
            if (dados.esf !== 0) partes.push(`Esf ${dados.esf > 0 ? '+' : ''}${dados.esf.toFixed(2)}`);
            if (dados.cil !== 0) partes.push(`Cil ${dados.cil.toFixed(2)}`);
            if (dados.eixo !== 0) partes.push(`Eixo ${dados.eixo}°`);
            if (dados.adicao !== 0) partes.push(`Ad +${dados.adicao.toFixed(2)}`);
            return partes.length > 0 ? partes.join(' | ') : 'Plano';
        };
        
        return {
            od: formatarOlho(od),
            oe: formatarOlho(oe),
            temAdicao: this.precisaAdicao()
        };
    }
    
    /**
     * Copia OD para OE
     */
    copiarODparaOE() {
        this.receita.roe_esf = this.receita.rod_esf;
        this.receita.roe_cil = this.receita.rod_cil;
        this.receita.roe_eixo = this.receita.rod_eixo;
        this.receita.roe_adicao = this.receita.rod_adicao;
        this.emit('change', this.receita);
    }
}
