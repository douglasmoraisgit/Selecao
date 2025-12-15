/**
 * SelectionController.js
 * Responsável por gerenciar seleções e identificação de tipos
 * 
 * RESPONSABILIDADES:
 * - Gerenciar seleções de filtros (config)
 * - Gerenciar seleções de produtos
 * - Identificar tipos de configuração
 * - Descobrir contexto (visão, marca, família)
 * 
 * EVENTOS EMITIDOS:
 * - 'filtroAdicionado'    → Filtro foi adicionado { tipo, item }
 * - 'filtroRemovido'      → Filtro foi removido { tipo, id }
 * - 'produtoAdicionado'   → Produto adicionado { produto }
 * - 'produtoRemovido'     → Produto removido { marca }
 * - 'selecoesLimpas'      → Todas seleções foram limpas
 * - 'selecaoAlterada'     → Qualquer alteração nas seleções
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class SelectionController extends EventEmitter {
    
    constructor({ selecaoAtivaModel, navigationModel, cardView, selecaoAtivaView, filtrosAplicadosView }) {
        super();
        
        // Dependências injetadas
        this.selecaoAtivaModel = selecaoAtivaModel;
        this.navigationModel = navigationModel;
        this.cardView = cardView;
        this.selecaoAtivaView = selecaoAtivaView;
        this.filtrosAplicadosView = filtrosAplicadosView;
        
        // Bind de eventos do model
        this.bindModelEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindModelEvents() {
        // Quando o model de seleção muda, propaga
        this.selecaoAtivaModel.on('change', (selecoes) => {
            this.selecaoAtivaView.render(selecoes);
            this.emit('selecaoAlterada', selecoes);
        });
    }

    // ========================================
    // SELEÇÃO DE CONFIGURAÇÃO
    // ========================================

    /**
     * Trata seleção de item de configuração (Material, AR, Foto, etc)
     */
    handleConfigSelection(item) {
        console.log('');
        console.log('┌────────────────────────────────────────────────────────────────┐');
        console.log('│  ⚙️  SELEÇÃO DE CONFIGURAÇÃO                                   │');
        console.log('└────────────────────────────────────────────────────────────────┘');
        
        const tipoConfig = this.identificarTipoConfig(item.id, item.label || item.title || '');
        console.log('🔍 Tipo identificado:', tipoConfig || '(nenhum)');
        
        if (tipoConfig) {
            const selecoes = this.selecaoAtivaModel.get(tipoConfig);
            const jaExiste = Array.isArray(selecoes) && selecoes.some(s => s.id === item.id);
            
            if (jaExiste) {
                this.selecaoAtivaModel.remover(tipoConfig, item.id);
                console.log(`❌ Removido [${tipoConfig}]:`, item.label);
                this.emit('filtroRemovido', { tipo: tipoConfig, id: item.id });
            } else {
                this.selecaoAtivaModel.adicionar(tipoConfig, {
                    id: item.id,
                    label: item.label || item.title,
                    icon: item.icon
                });
                console.log(`✅ Adicionado [${tipoConfig}]:`, item.label);
                this.emit('filtroAdicionado', { tipo: tipoConfig, item });
            }
            
            this.emit('selecaoAlterada', this.selecaoAtivaModel.getAtivas());
        }
    }

    // ========================================
    // SELEÇÃO DE PRODUTO
    // ========================================

    /**
     * Trata seleção de produto final (marca específica)
     */
  /*  handleProductSelection(item) {
        console.log('');
        console.log('┌────────────────────────────────────────────────────────────────┐');
        console.log('│  📦 SELEÇÃO DE PRODUTO                                         │');
        console.log('└────────────────────────────────────────────────────────────────┘');
        
        const currentNode = this.navigationModel.getCurrentNode();
        const marca = this.descobrirMarca(item, currentNode);
        
        console.log('📦 Marca identificada:', marca);
        
        const produto = {
            visao: this.descobrirTipoVisao(currentNode),
            familia: this.descobrirFamilia(currentNode),
            marca: marca,
            label: item.label || item.title,
            icon: item.icon || '📦',
            path: this.navigationModel.getBreadcrumbs().map(b => b.label).join(' > ')
        };
        
        const adicionado = this.selecaoAtivaModel.adicionarProduto(produto);
        
        if (adicionado) {
            this.cardView.selectCard(item.id, true);
            this.emit('produtoAdicionado', { produto });
        } else {
            this.selecaoAtivaModel.removerProduto(produto.marca);
            this.cardView.selectCard(item.id, false);
            this.emit('produtoRemovido', { marca: produto.marca });
        }
        
        this.emit('selecaoAlterada', this.selecaoAtivaModel.getAtivas());
        
        return { adicionado, produto };
    }*/
handleProductSelection(item) {
    console.log('');
    console.log('┌────────────────────────────────────────────────────────────────┐');
    console.log('│  📦 SELEÇÃO DE PRODUTO                                         │');
    console.log('└────────────────────────────────────────────────────────────────┘');
    
    // NOVO: Busca o nó completo do navigationStructure para ter todos os campos
    const itemCompleto = this.navigationModel.findNodeById(item.id) || item;
    console.log('📦 Item original:', item);
    console.log('📦 Item completo:', itemCompleto);
    
    const currentNode = this.navigationModel.getCurrentNode();
    const marca = this.descobrirMarca(itemCompleto, currentNode);
    
    console.log('📦 Marca identificada:', marca);
    
    const produto = {
        visao: this.descobrirTipoVisao(currentNode),
        familia: itemCompleto.familia || this.descobrirFamilia(currentNode),
        marca: marca,
        label: itemCompleto.label || itemCompleto.title || item.label || item.title,
        icon: itemCompleto.icon || item.icon || '📦',
        path: this.navigationModel.getBreadcrumbs().map(b => b.label).join(' > ')
    };
    
    const adicionado = this.selecaoAtivaModel.adicionarProduto(produto);
    
    if (adicionado) {
        this.cardView.selectCard(item.id, true);
        this.emit('produtoAdicionado', { produto });
    } else {
        this.selecaoAtivaModel.removerProduto(produto.marca);
        this.cardView.selectCard(item.id, false);
        this.emit('produtoRemovido', { marca: produto.marca });
    }
    
    this.emit('selecaoAlterada', this.selecaoAtivaModel.getAtivas());
    
    return { adicionado, produto };
}
    // ========================================
    // REMOÇÃO DE SELEÇÕES
    // ========================================

    /**
     * Remove um filtro específico
     */
    removerFiltro(tipo, id) {
        console.log('🗑️ Removendo filtro:', tipo, id);
        
        if (this.selecaoAtivaModel.ehTipoMultiplo(tipo)) {
            this.selecaoAtivaModel.remover(tipo, id);
        } else {
            this.selecaoAtivaModel.removerACascata(tipo);
        }
        
        this.emit('filtroRemovido', { tipo, id });
        this.emit('selecaoAlterada', this.selecaoAtivaModel.getAtivas());
        
        return tipo; // Retorna tipo para o coordenador saber se precisa navegar
    }

    /**
     * Remove um produto selecionado
     */
    removerProduto(marca) {
        console.log('🗑️ Removendo produto:', marca);
        this.selecaoAtivaModel.removerProduto(marca);
        this.emit('produtoRemovido', { marca });
        this.emit('selecaoAlterada', this.selecaoAtivaModel.getAtivas());
    }

    /**
     * Limpa todas as seleções
     */
    limparTudo() {
        console.log('🧹 Limpando todas as seleções');
        this.selecaoAtivaModel.limpar();
        this.selecaoAtivaModel.limparProdutos();
        this.emit('selecoesLimpas');
        this.emit('selecaoAlterada', this.selecaoAtivaModel.getAtivas());
    }

    // ========================================
    // IDENTIFICAÇÃO DE TIPOS
    // ========================================

    /**
     * Verifica se é um tipo de configuração
     */
    isConfigurationType(type) {
        return type === 'config' || type === 'config-option';
    }

    /**
     * Identifica o tipo de configuração pelo ID/label
     */
    identificarTipoConfig(id, label) {
        const idLower = (id || '').toLowerCase();
        const labelLower = (label || '').toLowerCase();
        
        // Ignora títulos de categoria
        const titulosIgnorar = ['material', 'antireflexo', 'anti-reflexo', 'fotossensivel', 
                                'fotossensível', 'antiblue', 'anti-blue', 'indice', 'índice',
                                'coloracao', 'coloração'];
        if (titulosIgnorar.includes(idLower) || titulosIgnorar.includes(labelLower)) {
            return null;
        }
        
        // Material
        if (idLower.includes('material') || idLower.includes('mat-') ||
            labelLower.includes('acrílico') || labelLower.includes('acrilico') ||
            labelLower.includes('policarbonato') || labelLower.includes('trivex') ||
            labelLower.includes('cristal') || labelLower.includes('orma') ||
            labelLower.includes('airwear') || labelLower.includes('stylis')) {
            return 'material';
        }
        
        // Anti-Reflexo
        if (idLower.includes('ar-') || idLower.includes('antireflexo') ||
            labelLower.includes('crizal') || labelLower.includes('optifog') ||
            labelLower.includes('satin') || labelLower.includes('duravision')) {
            return 'antireflexo';
        }
        
        // Fotossensível
        if (idLower.includes('foto-') || idLower.includes('fotossensivel') ||
            labelLower.includes('transition') || labelLower.includes('photofusion') ||
            labelLower.includes('sensity') || labelLower.includes('xtractive')) {
            return 'fotossensivel';
        }
        
        // Coloração (NOVO)
        if (idLower.includes('cor-') || idLower.includes('total-') || idLower.includes('degrade-') ||
            labelLower.includes('cinza') || labelLower.includes('verde') || 
            labelLower.includes('marrom') || labelLower.includes('pink') ||
            labelLower.includes('laranja') || labelLower.includes('ultramarine') ||
            labelLower.includes('ultra marine') || labelLower.includes('kalicrome') ||
            labelLower.includes('g15') || labelLower.includes('black') ||
            labelLower.includes('sem coloração') || labelLower.includes('sem coloracao')) {
            return 'coloracao';
        }
        
        // Anti-blue
        if (idLower.includes('blue') || 
            labelLower.includes('blue') || labelLower.includes('prevencia')) {
            return 'antiblue';
        }
        
        // Índice
        if (idLower.includes('indice') || idLower.includes('idx-') ||
            labelLower.match(/1\.\d{2}/)) {
            return 'indice';
        }
        
        return null;
    }

    // ========================================
    // DESCOBRIR CONTEXTO
    // ========================================

    /**
     * Descobre o tipo de visão atual
     */
    descobrirTipoVisao(currentNode) {
        // Do node atual
        if (currentNode) {
            const id = (currentNode.id || '').toLowerCase();
            if (this.selecaoAtivaModel.ehTipoVisao(id)) {
                return id;
            }
        }
        
        // Da seleção ativa
        const selecao = this.selecaoAtivaModel.get('tipoVisao');
        if (selecao && selecao.id) {
            return selecao.id;
        }
        
        // Dos breadcrumbs
        const breadcrumbs = this.navigationModel.getBreadcrumbs();
        for (const crumb of breadcrumbs) {
            if (this.selecaoAtivaModel.ehTipoVisao(crumb.id)) {
                return crumb.id;
            }
        }
        
        return null;
    }

    /**
     * Descobre a família atual
     */
    descobrirFamilia(currentNode) {
        // Da seleção ativa
        const selecao = this.selecaoAtivaModel.get('familia');
        if (selecao && selecao.label) {
            return selecao.label;
        }
        
        // Da marca ativa
        const marca = this.selecaoAtivaModel.get('marca');
        if (marca && marca.label) {
            return marca.label;
        }
        
        return null;
    }

    /**
     * Descobre a marca do item
     */
  /*  descobrirMarca(item, currentNode) {
        if (item.value) {
            return item.value;
        }
        
        if (currentNode && currentNode.type === 'brand') {
            const marcaBase = currentNode.label || currentNode.title;
            const produtoLabel = item.label || item.title;
            return `${marcaBase} ${produtoLabel}`.trim();
        }
        
        return item.label || item.title;
    }
*/descobrirMarca(item, currentNode) {
    // DEBUG: Flag para confirmar versão do código
    console.log('🚀 descobrirMarca v2.0 - ' + new Date().toLocaleTimeString());
    console.log('   item.marca:', item.marca);
    console.log('   item.label:', item.label);
    
    // 1. Se item tem campo 'marca' explícito, usa ele
    if (item.marca) {
        console.log('✅ Usando marca explícita:', item.marca);
        return item.marca;
    }

    // 2. Se item tem value, usa ele
    if (item.value) {
        console.log('✅ Usando value:', item.value);
        return item.value;
    }

    // 3. Se é produto dentro de brand, concatena
    if (currentNode && currentNode.type === 'brand') {
        const marcaBase = currentNode.label || currentNode.title;
        const produtoLabel = item.label || item.title;
        const resultado = `${marcaBase} ${produtoLabel}`.trim();
        console.log('⚠️ Concatenando (fallback):', resultado);
        return resultado;
    }

    const fallback = item.label || item.title;
    console.log('⚠️ Usando label/title:', fallback);
    return fallback;
}
    // ========================================
    // REGISTRO DE SELEÇÕES (NAVEGAÇÃO)
    // ========================================

    /**
     * Registra seleção baseada na navegação
     */
    registrarSelecao(node, type) {
        if (!node || node.type === 'root') return;
        
        const id = node.id || '';
        const label = node.label || node.title || '';
        const icon = node.icon || '';
        
        console.log('📝 Registrando seleção:', type, '-', label);
        
        let tipoSelecao = null;
        
        // Categorias principais = tipo de visão
        if (type === 'category' || this.selecaoAtivaModel.ehTipoVisao(id)) {
            tipoSelecao = 'tipoVisao';
        }
        // Marcas
        else if (type === 'brand' || id.includes('brand')) {
            tipoSelecao = 'marca';
        }
        // Subcategorias podem ser família ou marca
        else if (type === 'subcategory') {
            if (label.toLowerCase().includes('marca')) {
                return; // Não registra navegação intermediária
            }
            tipoSelecao = 'familia';
        }
        
        if (tipoSelecao) {
            this.selecaoAtivaModel.adicionar(tipoSelecao, { id, label, icon });
        }
    }

    /**
     * Atualiza seleções baseado nos breadcrumbs
     */
    atualizarSelecoesDosBreadcrumbs(breadcrumbs) {
        if (!breadcrumbs || !Array.isArray(breadcrumbs)) return;
        
        // Limpa seleções únicas
        this.selecaoAtivaModel.limpar();
        
        // Recria baseado nos breadcrumbs
        breadcrumbs.forEach((crumb, index) => {
            if (crumb.type === 'category' || this.selecaoAtivaModel.ehTipoVisao(crumb.id)) {
                this.selecaoAtivaModel.adicionar('tipoVisao', {
                    id: crumb.id,
                    label: crumb.label,
                    icon: crumb.icon
                });
            } else if (crumb.type === 'brand') {
                this.selecaoAtivaModel.adicionar('marca', {
                    id: crumb.id,
                    label: crumb.label,
                    icon: crumb.icon
                });
            }
        });
    }

    // ========================================
    // ATUALIZAÇÃO DE UI
    // ========================================

    /**
     * Atualiza a view de filtros aplicados
     */
    atualizarFiltrosAplicados(quantidade = 0) {
        const filtros = this.selecaoAtivaModel.getAtivas();
        const produtos = this.selecaoAtivaModel.getProdutosSelecionados();
        
        this.filtrosAplicadosView.render({
            filtros: filtros,
            produtos: produtos,
            quantidade: quantidade
        });
    }

    // ========================================
    // GETTERS
    // ========================================

    /**
     * Retorna todas as seleções ativas
     */
    getSelecoes() {
        return this.selecaoAtivaModel.getAtivas();
    }

    /**
     * Retorna produtos selecionados
     */
    getProdutos() {
        return this.selecaoAtivaModel.getProdutosSelecionados();
    }
}
