/**
 * CarrinhoModel.js
 * Model - Gerencia estado do carrinho de compras
 * 
 * RESPONSABILIDADES:
 * - Armazenar itens do carrinho (lentes e produtos)
 * - Gerenciar quantidades (par = 0.5, incremento 0.5)
 * - Calcular totais
 * - Persistir no localStorage
 * - Validar regras de negócio
 * 
 * ESTRUTURA DE ITEM (LENTE):
 * {
 *   id: string,                    // Chave única (codigo_web + od/oe + tratamentos)
 *   tipo: 'lente',
 *   codigo: number,                // ID da lente no banco
 *   codigoWeb: string,             // Código web/variante
 *   codigoProdutoFornecedor: string,
 *   marca: string,
 *   familia: string,
 *   descricao: string,             // Descrição completa com grau
 *   olho: 'OD' | 'OE',
 *   esf: number,
 *   cil: number,
 *   eixo: number,
 *   adicao: number,
 *   material: string,
 *   indice: string,
 *   unidade: 'par',
 *   quantidade: number,            // Começa em 0.5 (meio par)
 *   precoUnitario: number,         // Preço base da lente
 *   precoTotal: number,            // Preço com tratamentos
 *   tratamentos: [{                // Array de tratamentos aplicados
 *     codigo: number,
 *     nome: string,
 *     codigoFornecedor: string,
 *     valor: number
 *   }],
 *   coloracao: {                   // Coloração (se houver)
 *     nome: string,
 *     tipo: string,
 *     valor: number,
 *     hex: string
 *   }
 * }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class CarrinhoModel extends EventEmitter {
    
    constructor() {
        super();
        
        // Itens do carrinho separados por tipo
        this.lentes = [];
        this.produtos = [];
        
        // Cliente atual
        this.cliente = {
            id: null,
            nome: ''
        };
        
        // Configurações
        this.config = {
            storageKey: 'optofreela_carrinho',
            incrementoLente: 0.5,
            quantidadeInicialLente: 0.5,
            quantidadeMinLente: 0.5
        };
        
        // Carrega do localStorage
        this.carregar();
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna todas as lentes do carrinho
     */
    getLentes() {
        return [...this.lentes];
    }

    /**
     * Retorna todos os produtos do carrinho
     */
    getProdutos() {
        return [...this.produtos];
    }

    /**
     * Retorna todos os itens (lentes + produtos)
     */
    getTodosItens() {
        return [...this.lentes, ...this.produtos];
    }

    /**
     * Retorna quantidade de itens no carrinho
     */
    getQuantidadeItens() {
        return this.lentes.length + this.produtos.length;
    }

    /**
     * Retorna total geral do carrinho
     */
    getTotal() {
        let total = 0;
        
        // Soma lentes
        this.lentes.forEach(item => {
            total += item.precoTotal * item.quantidade;
        });
        
        // Soma produtos
        this.produtos.forEach(item => {
            total += item.precoUnitario * item.quantidade;
        });
        
        return total;
    }

    /**
     * Retorna subtotal das lentes
     */
    getSubtotalLentes() {
        return this.lentes.reduce((acc, item) => {
            return acc + (item.precoTotal * item.quantidade);
        }, 0);
    }

    /**
     * Retorna subtotal dos produtos
     */
    getSubtotalProdutos() {
        return this.produtos.reduce((acc, item) => {
            return acc + (item.precoUnitario * item.quantidade);
        }, 0);
    }

    /**
     * Retorna cliente atual
     */
    getCliente() {
        return { ...this.cliente };
    }

    /**
     * Verifica se carrinho está vazio
     */
    estaVazio() {
        return this.lentes.length === 0 && this.produtos.length === 0;
    }

    /**
     * Busca item por ID
     */
    getItemPorId(id) {
        return this.lentes.find(item => item.id === id) || 
               this.produtos.find(item => item.id === id);
    }

    // ========================================
    // ADICIONAR ITENS
    // ========================================

    /**
     * Adiciona uma lente ao carrinho
     * @param {Object} dadosLente - Dados da lente do DisplayProdutosView
     * @param {string} olho - 'OD' ou 'OE'
     * @param {Array} tratamentos - Tratamentos selecionados
     * @param {Object} coloracao - Coloração selecionada (opcional)
     * @returns {Object} Item adicionado
     */
    adicionarLente(dadosLente, olho, tratamentos = [], coloracao = null) {
        // Gera ID único baseado na combinação
        const id = this.gerarIdLente(dadosLente, olho, tratamentos, coloracao);
        
        // Verifica se já existe
        const existente = this.lentes.find(item => item.id === id);
        if (existente) {
            // Incrementa quantidade
            this.alterarQuantidade(id, existente.quantidade + this.config.incrementoLente);
            return existente;
        }
        
        // Calcula preço total (base + tratamentos + coloração)
        const precoBase = dadosLente.venda || 0;
        const precoTratamentos = tratamentos.reduce((acc, t) => acc + (t.valor || t.valorVenda || 0), 0);
        const precoColoracao = coloracao?.valor || 0;
        const precoTotal = precoBase + precoTratamentos + precoColoracao;
        
        // Monta descrição com tratamentos
        let descricaoCompleta = dadosLente.descricao || `${dadosLente.familia} ${olho}`;
        
        const item = {
            id,
            tipo: 'lente',
            codigo: dadosLente.codigo,
            codigoWeb: dadosLente.codigoWeb,
            codigoProdutoFornecedor: dadosLente.codigoProdutoFornecedor,
            marca: dadosLente.marca,
            familia: dadosLente.familia,
            descricao: descricaoCompleta,
            olho: olho,
            esf: dadosLente.esf || 0,
            cil: dadosLente.cil || 0,
            eixo: dadosLente.eixo || 0,
            adicao: dadosLente.adicao || 0,
            material: dadosLente.material,
            indice: dadosLente.indice,
            diametro: dadosLente.diametro,
            producao: dadosLente.producao,
            unidade: 'par',
            quantidade: this.config.quantidadeInicialLente,
            precoUnitario: precoBase,
            precoTotal: precoTotal,
            tratamentos: tratamentos.map(t => ({
                codigo: t.codigo,
                nome: t.nome,
                codigoFornecedor: t.codigoFornecedor || t.codigo_fornecedor,
                valor: t.valor || t.valorVenda || 0
            })),
            coloracao: coloracao ? {
                nome: coloracao.nome || coloracao.label,
                tipo: coloracao.tipo || coloracao.tipoColoracao,
                valor: coloracao.valor || coloracao.valorVenda || 0,
                hex: coloracao.hex || coloracao.corHex || '#888888'
            } : null,
            // Dados extras para o payload do servlet
            origemTratamento: tratamentos.length > 0 ? 'ADICIONAL' : 'FABRICA',
            antireflexoNome: dadosLente.antireflexo,
            fotossensivelNome: dadosLente.fotossensivel,
            antiblueNome: dadosLente.antiblue
        };
        
        this.lentes.push(item);
        this.salvar();
        
        this.emit('itemAdicionado', { item, tipo: 'lente' });
        this.emit('change', this.getResumo());
        
        return item;
    }

    /**
     * Adiciona um produto (não lente) ao carrinho
     */
    adicionarProduto(dadosProduto) {
        const id = `produto_${dadosProduto.codigo || Date.now()}`;
        
        // Verifica se já existe
        const existente = this.produtos.find(item => item.id === id);
        if (existente) {
            this.alterarQuantidade(id, existente.quantidade + 1);
            return existente;
        }
        
        const item = {
            id,
            tipo: 'produto',
            codigo: dadosProduto.codigo,
            descricao: dadosProduto.descricao || dadosProduto.nome,
            marca: dadosProduto.marca,
            unidade: dadosProduto.unidade || 'un',
            quantidade: 1,
            precoUnitario: dadosProduto.preco || dadosProduto.venda || 0
        };
        
        this.produtos.push(item);
        this.salvar();
        
        this.emit('itemAdicionado', { item, tipo: 'produto' });
        this.emit('change', this.getResumo());
        
        return item;
    }

    /**
     * Adiciona par de lentes (OD + OE) de uma vez
     */
    adicionarParLentes(produto, tratamentos = [], coloracao = null) {
        const itensAdicionados = [];
        
        // Adiciona OD se disponível
        if (produto.hasOD && produto.od) {
            const itemOD = this.adicionarLente(produto.od, 'OD', tratamentos, coloracao);
            itensAdicionados.push(itemOD);
        }
        
        // Adiciona OE se disponível
        if (produto.hasOE && produto.oe) {
            const itemOE = this.adicionarLente(produto.oe, 'OE', tratamentos, coloracao);
            itensAdicionados.push(itemOE);
        }
        
        return itensAdicionados;
    }

    // ========================================
    // REMOVER ITENS
    // ========================================

    /**
     * Remove item do carrinho
     */
    removerItem(id) {
        let removido = false;
        
        // Tenta remover de lentes
        const indexLente = this.lentes.findIndex(item => item.id === id);
        if (indexLente !== -1) {
            const item = this.lentes.splice(indexLente, 1)[0];
            removido = true;
            this.emit('itemRemovido', { item, tipo: 'lente' });
        }
        
        // Tenta remover de produtos
        if (!removido) {
            const indexProduto = this.produtos.findIndex(item => item.id === id);
            if (indexProduto !== -1) {
                const item = this.produtos.splice(indexProduto, 1)[0];
                removido = true;
                this.emit('itemRemovido', { item, tipo: 'produto' });
            }
        }
        
        if (removido) {
            this.salvar();
            this.emit('change', this.getResumo());
        }
        
        return removido;
    }

    /**
     * Limpa todo o carrinho
     */
    limpar() {
        this.lentes = [];
        this.produtos = [];
        this.cliente = { id: null, nome: '' };
        
        this.salvar();
        
        this.emit('limpo');
        this.emit('change', this.getResumo());
    }

    // ========================================
    // ALTERAR QUANTIDADE
    // ========================================

    /**
     * Altera quantidade de um item
     */
    alterarQuantidade(id, novaQuantidade) {
        const item = this.getItemPorId(id);
        if (!item) return false;
        
        // Para lentes, mínimo é 0.5
        if (item.tipo === 'lente') {
            if (novaQuantidade < this.config.quantidadeMinLente) {
                // Remove o item se quantidade for menor que mínimo
                return this.removerItem(id);
            }
            // Arredonda para múltiplos de 0.5
            novaQuantidade = Math.round(novaQuantidade * 2) / 2;
        } else {
            // Para produtos, mínimo é 1
            if (novaQuantidade < 1) {
                return this.removerItem(id);
            }
            novaQuantidade = Math.floor(novaQuantidade);
        }
        
        const quantidadeAnterior = item.quantidade;
        item.quantidade = novaQuantidade;
        
        this.salvar();
        
        this.emit('quantidadeAlterada', { 
            item, 
            quantidadeAnterior, 
            quantidadeNova: novaQuantidade 
        });
        this.emit('change', this.getResumo());
        
        return true;
    }

    /**
     * Incrementa quantidade de um item
     */
    incrementar(id) {
        const item = this.getItemPorId(id);
        if (!item) return false;
        
        const incremento = item.tipo === 'lente' ? this.config.incrementoLente : 1;
        return this.alterarQuantidade(id, item.quantidade + incremento);
    }

    /**
     * Decrementa quantidade de um item
     */
    decrementar(id) {
        const item = this.getItemPorId(id);
        if (!item) return false;
        
        const decremento = item.tipo === 'lente' ? this.config.incrementoLente : 1;
        return this.alterarQuantidade(id, item.quantidade - decremento);
    }

    // ========================================
    // CLIENTE
    // ========================================

    /**
     * Define cliente atual
     */
    setCliente(cliente) {
        this.cliente = {
            id: cliente.id || null,
            nome: cliente.nome || ''
        };
        
        this.salvar();
        this.emit('clienteAlterado', this.cliente);
        this.emit('change', this.getResumo());
    }

    /**
     * Limpa cliente
     */
    limparCliente() {
        this.cliente = { id: null, nome: '' };
        this.salvar();
        this.emit('clienteAlterado', this.cliente);
    }

    // ========================================
    // PERSISTÊNCIA
    // ========================================

    /**
     * Salva carrinho no localStorage
     */
    salvar() {
        try {
            const dados = {
                lentes: this.lentes,
                produtos: this.produtos,
                cliente: this.cliente,
                timestamp: Date.now()
            };
            localStorage.setItem(this.config.storageKey, JSON.stringify(dados));
        } catch (e) {
            console.warn('Erro ao salvar carrinho:', e);
        }
    }

    /**
     * Carrega carrinho do localStorage
     */
    carregar() {
        try {
            const dados = localStorage.getItem(this.config.storageKey);
            if (dados) {
                const parsed = JSON.parse(dados);
                this.lentes = parsed.lentes || [];
                this.produtos = parsed.produtos || [];
                this.cliente = parsed.cliente || { id: null, nome: '' };
            }
        } catch (e) {
            console.warn('Erro ao carregar carrinho:', e);
            this.limpar();
        }
    }

    // ========================================
    // UTILITÁRIOS
    // ========================================

    /**
     * Gera ID único para uma lente
     */
    gerarIdLente(lente, olho, tratamentos, coloracao) {
        const partes = [
            'lente',
            lente.codigoWeb || lente.codigo,
            olho,
            tratamentos.map(t => t.codigo).sort().join('-'),
            coloracao?.nome || 'sem'
        ];
        return partes.join('_');
    }

    /**
     * Retorna resumo do carrinho
     */
    getResumo() {
        return {
            quantidadeLentes: this.lentes.length,
            quantidadeProdutos: this.produtos.length,
            quantidadeTotal: this.getQuantidadeItens(),
            subtotalLentes: this.getSubtotalLentes(),
            subtotalProdutos: this.getSubtotalProdutos(),
            total: this.getTotal(),
            cliente: this.cliente,
            vazio: this.estaVazio()
        };
    }

    // ========================================
    // SERIALIZAÇÃO PARA BACKEND
    // ========================================

    /**
     * Converte carrinho para payload do servlet
     * Compatível com AdicionarCarrinhoTratamentoDistinto
     */
    toPayload() {
        const payload = new FormData();
        
        // Cliente - sempre envia o nome
        if (this.cliente.id) {
            payload.append('cliente_id', this.cliente.id);
        }
        payload.append('cliente_nome', this.cliente.nome || 'Cliente não informado');
        
        // Lentes
        this.lentes.forEach((item, index) => {
            const prefix = `lente_${index}_`;
            
            payload.append(prefix + 'codigo', item.codigo);
            payload.append(prefix + 'codigo_web', item.codigoWeb);
            payload.append(prefix + 'codigo_fornecedor', item.codigoProdutoFornecedor || '');
            payload.append(prefix + 'marca', item.marca);
            payload.append(prefix + 'familia', item.familia || '');
            payload.append(prefix + 'descricao', item.descricao);
            payload.append(prefix + 'olho', item.olho);
            payload.append(prefix + 'esf', item.esf);
            payload.append(prefix + 'cil', item.cil);
            payload.append(prefix + 'eixo', item.eixo || 0);
            payload.append(prefix + 'adicao', item.adicao || 0);
            payload.append(prefix + 'unidade', item.unidade);
            payload.append(prefix + 'quantidade', item.quantidade);
            payload.append(prefix + 'preco_unitario', item.precoUnitario);
            payload.append(prefix + 'preco_total', item.precoTotal);
            payload.append(prefix + 'tipo', 'LenteOculos');
            
            // Tratamentos
            if (item.tratamentos && item.tratamentos.length > 0) {
                item.tratamentos.forEach((trat, tIndex) => {
                    payload.append(prefix + `tratamento_${tIndex}_codigo`, trat.codigo);
                    payload.append(prefix + `tratamento_${tIndex}_nome`, trat.nome);
                    payload.append(prefix + `tratamento_${tIndex}_valor`, trat.valor);
                });
                payload.append(prefix + 'tratamentos_count', item.tratamentos.length);
            }
            
            // Coloração
            if (item.coloracao) {
                payload.append(prefix + 'coloracao_nome', item.coloracao.nome);
                payload.append(prefix + 'coloracao_tipo', item.coloracao.tipo || '');
                payload.append(prefix + 'coloracao_valor', item.coloracao.valor);
            }
        });
        
        payload.append('lentes_count', this.lentes.length);
        
        // Produtos
        this.produtos.forEach((item, index) => {
            const prefix = `produto_${index}_`;
            
            payload.append(prefix + 'codigo', item.codigo);
            payload.append(prefix + 'descricao', item.descricao);
            payload.append(prefix + 'marca', item.marca || '');
            payload.append(prefix + 'unidade', item.unidade);
            payload.append(prefix + 'quantidade', item.quantidade);
            payload.append(prefix + 'preco', item.precoUnitario);
        });
        
        payload.append('produtos_count', this.produtos.length);
        
        // Total
        payload.append('total', this.getTotal());
        
        return payload;
    }

    /**
     * Converte para URLSearchParams (alternativo)
     */
    toURLSearchParams() {
        const params = new URLSearchParams();
        
        // Cliente - sempre envia o nome
        if (this.cliente.id) {
            params.append('cliente_id', this.cliente.id);
        }
        params.append('cliente_nome', this.cliente.nome || 'Cliente não informado');
        
        // Lentes como JSON
        params.append('lentes', JSON.stringify(this.lentes));
        
        // Produtos como JSON
        params.append('produtos', JSON.stringify(this.produtos));
        
        // Total
        params.append('total', this.getTotal());
        
        return params;
    }
}
