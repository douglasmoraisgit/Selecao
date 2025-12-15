/**
 * NavigationController.js
 * Responsável por navegação hierárquica e breadcrumbs
 * 
 * RESPONSABILIDADES:
 * - Processar eventos de navegação do model
 * - Atualizar breadcrumbs
 * - Atualizar header
 * - Renderizar nível atual de cards
 * - FILTRAR OPÇÕES POR COMPATIBILIDADE (família/tratamento)
 * 
 * EVENTOS EMITIDOS:
 * - 'navegou'            → Navegação completada { node, type, isRoot }
 * - 'voltou'             → Voltou um nível { node }
 * - 'foiParaHome'        → Foi para raiz
 * - 'pulou'              → Pulou para nível específico { node, index }
 * - 'contadorAtualizado' → Contador de produtos deve ser atualizado { count }
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

export default class NavigationController extends EventEmitter {
    
    constructor({ navigationModel, selecaoAtivaModel, cardView, breadcrumbView, apiService }) {
        super();
        
        // Dependências injetadas
        this.navigationModel = navigationModel;
        this.selecaoAtivaModel = selecaoAtivaModel;
        this.cardView = cardView;
        this.breadcrumbView = breadcrumbView;
        this.apiService = apiService;  // NOVO - para buscar compatibilidades
        
        // Cache de compatibilidades (evita chamadas repetidas ao backend)
        this.cacheCompatibilidade = new Map();
        
        // Bind de eventos do model
        this.bindModelEvents();
        this.bindViewEvents();
    }

    // ========================================
    // BINDING DE EVENTOS
    // ========================================

    bindModelEvents() {
        this.navigationModel.on('navigate', (data) => this.onNavigate(data));
        this.navigationModel.on('back', (data) => this.onBack(data));
        this.navigationModel.on('home', () => this.onHome());
        this.navigationModel.on('jump', (data) => this.onJump(data));
    }

    bindViewEvents() {
        // Breadcrumb clicks
        this.breadcrumbView.on('click', ({ item, index }) => {
            if (index === -1) {
                this.navigationModel.goHome();
            } else {
                this.navigationModel.goToLevel(index);
            }
        });
    }

    // ========================================
    // HANDLERS DE NAVEGAÇÃO
    // ========================================

    onNavigate({ node, type, breadcrumbs, params }) {
        console.log('');
        console.log('┌────────────────────────────────────────────────────────────────┐');
        console.log('│  📍 NAVEGAÇÃO: ' + (node.label || node.id).padEnd(46) + '│');
        console.log('└────────────────────────────────────────────────────────────────┘');
        
        // Atualiza interface (agora é async)
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        this.updateHeader(node);
        
        // Emite evento para o coordenador
        this.emit('navegou', { 
            node, 
            type, 
            breadcrumbs,
            isRoot: node.type === 'root'
        });
    }

    onBack({ node, type, breadcrumbs }) {
        console.log('⬅️ Voltando para:', node.label);
        
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        this.updateHeader(node);
        
        this.emit('voltou', { 
            node, 
            breadcrumbs,
            isRoot: node.type === 'root'
        });
    }

    onHome() {
        console.log('🏠 Voltando para Home');
        
        // Limpa cache ao voltar para home
        this.limparCacheCompatibilidade();
        
        const root = this.navigationModel.getCurrentNode();
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        this.updateHeader(root);
        
        this.emit('foiParaHome');
    }

    onJump({ node, index, breadcrumbs }) {
        console.log('🦘 Pulando para nível:', index, node.label);
        
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        this.updateHeader(node);
        
        this.emit('pulou', { 
            node, 
            index, 
            breadcrumbs,
            isRoot: node.type === 'root'
        });
    }

    // ========================================
    // NAVEGAÇÃO PARA CONFIGURAÇÃO
    // ========================================

    /**
     * Navega para uma configuração PRESERVANDO seleções únicas (Visão, Marca)
     */
    navegarParaConfiguracao(id) {
        console.log('');
        console.log('⚙️ ================================================');
        console.log('⚙️ NAVEGANDO PARA CONFIGURAÇÃO:', id);
        console.log('⚙️ ================================================');
        
        // SALVA as seleções únicas ANTES de qualquer navegação (DEEP COPY)
        const visaoSalva = this.selecaoAtivaModel.get('tipoVisao');
        const marcaSalva = this.selecaoAtivaModel.get('marca');
        const familiaSalva = this.selecaoAtivaModel.get('familia');
        
        // Deep copy para evitar referências
        const visaoCopia = visaoSalva ? { ...visaoSalva } : null;
        const marcaCopia = marcaSalva ? { ...marcaSalva } : null;
        const familiaCopia = familiaSalva ? { ...familiaSalva } : null;
        
        console.log('💾 SALVANDO contexto:', {
            visao: visaoCopia,
            marca: marcaCopia,
            familia: familiaCopia
        });
        
        // Vai para root SEM emitir home (não chama limpar())
        console.log('🏠 Chamando goToRoot()...');
        this.navigationModel.goToRoot();
        
        // RESTAURA as seleções únicas usando o método adicionar
        if (visaoCopia && visaoCopia.id) {
            console.log('🔄 Restaurando visão:', visaoCopia.label);
            this.selecaoAtivaModel.adicionar('tipoVisao', visaoCopia);
        }
        if (marcaCopia && marcaCopia.id) {
            console.log('🔄 Restaurando marca:', marcaCopia.label);
            this.selecaoAtivaModel.adicionar('marca', marcaCopia);
        }
        if (familiaCopia && familiaCopia.id) {
            console.log('🔄 Restaurando família:', familiaCopia.label);
            this.selecaoAtivaModel.adicionar('familia', familiaCopia);
        }
        
        // Renderiza o root temporariamente
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        this.updateHeader(this.navigationModel.getCurrentNode());
        
        // Navega para a configuração após pequeno delay
        setTimeout(() => {
            const rootChildren = this.navigationModel.getChildren();
            const targetItem = rootChildren.find(child => child.id === id);
            
            if (targetItem) {
                console.log('📍 Chamando navigateTo:', id);
                
                // Salva NOVAMENTE antes do navigateTo
                const visaoAntes = this.selecaoAtivaModel.get('tipoVisao');
                const marcaAntes = this.selecaoAtivaModel.get('marca');
                
                this.navigationModel.navigateTo(id);
                
                // Verifica se foi perdido e restaura
                const visaoDepois = this.selecaoAtivaModel.get('tipoVisao');
                const marcaDepois = this.selecaoAtivaModel.get('marca');
                
                if (visaoAntes && !visaoDepois) {
                    console.log('⚠️ VISÃO FOI PERDIDA! Restaurando...');
                    this.selecaoAtivaModel.adicionar('tipoVisao', { ...visaoAntes });
                }
                if (marcaAntes && !marcaDepois) {
                    console.log('⚠️ MARCA FOI PERDIDA! Restaurando...');
                    this.selecaoAtivaModel.adicionar('marca', { ...marcaAntes });
                }
            } else {
                console.warn('⚠️ Configuração não encontrada:', id);
            }
            
            console.log('⚙️ ================================================');
            console.log('');
        }, 100);
    }

    /**
     * Navega para uma categoria de visão LIMPANDO o contexto anterior
     */
    navegarParaCategoriaLimpandoContexto(id) {
        console.log('👁️ Navegando para categoria:', id, '(limpando contexto)');
        
        // Limpa cache de compatibilidade
        this.limparCacheCompatibilidade();
        
        // Vai para root
        this.navigationModel.goToRoot();
        
        // Limpa seleções únicas (de navegação)
        this.selecaoAtivaModel.selecaoUnica.tipoVisao = null;
        this.selecaoAtivaModel.selecaoUnica.marca = null;
        this.selecaoAtivaModel.selecaoUnica.familia = null;
        
        // Renderiza o root
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        this.updateHeader(this.navigationModel.getCurrentNode());
        
        // Navega para a categoria clicada
        setTimeout(() => {
            const rootChildren = this.navigationModel.getChildren();
            const targetItem = rootChildren.find(child => child.id === id);
            
            if (targetItem) {
                console.log('📍 Navegando para:', id);
                this.navigationModel.navigateTo(id);
            } else {
                console.warn('⚠️ Categoria não encontrada:', id);
            }
        }, 50);
    }

    // ========================================
    // NAVEGAÇÃO AUXILIAR
    // ========================================

    /**
     * Volta para um nível específico baseado no tipo
     */
    voltarParaNivel(tipo) {
        const ordemNiveis = { 'tipoVisao': 0, 'marca': 1, 'familia': 2 };
        const nivel = ordemNiveis[tipo];
        
        if (nivel !== undefined) {
            this.navigationModel.goToLevel(nivel);
        }
    }

    /**
     * Navega para um item específico
     */
    navigateTo(id) {
        this.navigationModel.navigateTo(id);
    }

    /**
     * Verifica se pode voltar
     */
    canGoBack() {
        return this.navigationModel.canGoBack();
    }

    /**
     * Volta um nível
     */
    goBack() {
        if (this.canGoBack()) {
            this.navigationModel.goBack();
        }
    }

    /**
     * Vai para home
     */
    goHome() {
        this.limparCacheCompatibilidade();
        this.navigationModel.goHome();
    }

    // ========================================
    // RENDER / UI COM FILTRO DE COMPATIBILIDADE
    // ========================================

    /**
     * Renderiza nível atual COM FILTRO DE COMPATIBILIDADE
     * Este método agora é async para poder buscar dados do backend
     */
    async renderCurrentLevel() {
        const currentNode = this.navigationModel.getCurrentNode();
        let children = this.navigationModel.getChildrenAsCards();
        
        console.log('🎨 renderCurrentLevel - node:', currentNode?.id, 'children:', children.length);
        
        // ========================================
        // FILTRO DINÂMICO DE COMPATIBILIDADE
        // ========================================
        
        // Se estamos em Anti-Reflexo e tem família/marca selecionada
        if (currentNode?.id === 'antiReflexo') {
            const familiaSelecionada = this.getFamiliaSelecionada();
            if (familiaSelecionada) {
                console.log('✨ Filtrando AR para família:', familiaSelecionada);
                children = await this.filtrarAntireflexoPorFamilia(children, familiaSelecionada);
            }
        }
        
        // Se estamos em Multifocal e tem AR selecionado (não "Sem Anti-Reflexo")
        if (currentNode?.id === 'multifocal') {
            const arSelecionado = this.getAntireflexoSelecionado();
            if (arSelecionado && arSelecionado !== 'Sem Anti-Reflexo') {
                console.log('🎭 Filtrando Multifocais para AR:', arSelecionado);
                children = await this.filtrarMultifocalPorAntireflexo(children, arSelecionado);
            }
        }
        
        // Categorias de tipo de visão onde aplicar filtro de coloração
        const categoriasVisao = ['longe', 'perto', 'multifocal', 'bifocal', 'ocupacional', 'meiaDistancia'];
        
        // NOVO: Se estamos em uma categoria de visão e tem coloração selecionada
        if (categoriasVisao.includes(currentNode?.id)) {
            const corSelecionada = this.getColoracaoSelecionada();
            if (corSelecionada && corSelecionada !== 'Sem Coloração') {
                console.log('🎨 Filtrando produtos para coloração:', corSelecionada);
                children = await this.filtrarProdutosPorColoracao(children);
            }
        }
        
        // NOVO: Se estamos em Coloração e tem família/marca selecionada
        if (currentNode?.id === 'coloracao') {
            const marca = this.getMarcaSelecionada();
            const familia = this.getFamiliaRealSelecionada(); // Novo método que não retorna marca
            
            if (familia) {
                console.log('🎨 Verificando coloração para família:', familia);
                children = await this.filtrarColoracaoPorFamiliaOuMarca(children, { familia });
            } else if (marca) {
                console.log('🎨 Verificando coloração para marca:', marca);
                children = await this.filtrarColoracaoPorFamiliaOuMarca(children, { marca });
            }
            
            // NOVO: Se só sobrou "Sem Coloração", significa 0 produtos disponíveis
            const apenasSeColoracao = children.length === 1 && 
                (children[0].id === 'cor-sem' || children[0].label === 'Sem Coloração');
            
            if (apenasSeColoracao) {
                console.log('🚫 Apenas "Sem Coloração" disponível - emitindo contador 0');
                this.emit('contadorAtualizado', { count: 0 });
            }
        }
        
        // ========================================
        // RENDER
        // ========================================
        
        // Determina modo de seleção baseado no tipo
        let selectionMode = 'single';
        if (currentNode && (currentNode.type === 'config' || 
            this.selecaoAtivaModel.ehTipoMultiplo(this.identificarTipoConfig(currentNode.id, currentNode.label)))) {
            selectionMode = 'multiple';
        }
        
        this.cardView.render(children, { selectionMode });
    }

    // ========================================
    // MÉTODOS DE FILTRO DE COMPATIBILIDADE
    // ========================================

    /**
     * Retorna família selecionada (do selecaoAtivaModel ou produtos)
     */
    getFamiliaSelecionada() {
        // Primeiro verifica produtos selecionados
        const produtos = this.selecaoAtivaModel.getProdutosSelecionados();
        if (produtos.length > 0 && produtos[0].familia) {
            console.log('   📦 Família do produto:', produtos[0].familia);
            return produtos[0].familia;
        }
        
        // Depois verifica seleção única de família
        const familia = this.selecaoAtivaModel.get('familia');
        if (familia && familia.label) {
            console.log('   📁 Família da seleção:', familia.label);
            return familia.label;
        }
        
        // Por último, verifica marca (que pode ter família associada)
        const marca = this.selecaoAtivaModel.get('marca');
        if (marca && marca.label) {
            console.log('   🏷️ Marca da seleção:', marca.label);
            return marca.label;
        }
        
        return null;
    }

    /**
     * Retorna APENAS a família real (sem fallback para marca)
     */
    getFamiliaRealSelecionada() {
        // Primeiro verifica produtos selecionados
        const produtos = this.selecaoAtivaModel.getProdutosSelecionados();
        if (produtos.length > 0 && produtos[0].familia) {
            console.log('   📦 Família real do produto:', produtos[0].familia);
            return produtos[0].familia;
        }
        
        // Depois verifica seleção única de família
        const familia = this.selecaoAtivaModel.get('familia');
        if (familia && familia.label) {
            console.log('   📁 Família real da seleção:', familia.label);
            return familia.label;
        }
        
        // NÃO retorna marca como fallback
        return null;
    }

    /**
     * Retorna marca selecionada
     */
    getMarcaSelecionada() {
        const marca = this.selecaoAtivaModel.get('marca');
        if (marca && marca.label) {
            console.log('   🏷️ Marca selecionada:', marca.label);
            return marca.label;
        }
        return null;
    }

    /**
     * Retorna anti-reflexo selecionado
     */
    getAntireflexoSelecionado() {
        const ar = this.selecaoAtivaModel.get('antireflexo');
        if (ar && Array.isArray(ar) && ar.length > 0) {
            console.log('   ✨ AR selecionado:', ar[0].label);
            return ar[0].label;
        }
        return null;
    }

    /**
     * NOVO: Retorna coloração selecionada
     */
    getColoracaoSelecionada() {
        const cor = this.selecaoAtivaModel.get('coloracao');
        if (cor && Array.isArray(cor) && cor.length > 0) {
            console.log('   🎨 Coloração selecionada:', cor[0].label);
            return cor[0].label;
        }
        return null;
    }

    /**
     * Filtra opções de AR baseado na família selecionada
     */
    async filtrarAntireflexoPorFamilia(children, familia) {
        // Verifica se apiService está disponível
        if (!this.apiService) {
            console.warn('⚠️ ApiService não disponível - retornando todos os children');
            return children;
        }
        
        try {
            // Verifica cache
            const cacheKey = `ar_${familia}`;
            let nomesPermitidos = this.cacheCompatibilidade.get(cacheKey);
            
            if (!nomesPermitidos) {
                // Busca do backend
                console.log('🔍 Buscando tratamentos compatíveis para:', familia);
                const response = await this.apiService.buscarTratamentosCompativeis({ familia });
                
                if (response && response.tratamentos) {
                    nomesPermitidos = response.tratamentos.map(t => t.nome);
                    this.cacheCompatibilidade.set(cacheKey, nomesPermitidos);
                    console.log('✅ Tratamentos permitidos para', familia + ':', nomesPermitidos);
                } else {
                    console.log('⚠️ Nenhum tratamento encontrado para família:', familia);
                    return children; // Retorna todos se não encontrar
                }
            } else {
                console.log('📋 Usando cache para', familia + ':', nomesPermitidos);
            }
            
            // Filtra children - sempre inclui "Sem Anti-Reflexo"
            const filtrados = children.filter(child => 
                child.id === 'ar-sem' || 
                child.title === 'Sem Anti-Reflexo' ||
                nomesPermitidos.includes(child.title)
            );
            
            console.log('✨ AR filtrados:', filtrados.length, 'de', children.length);
            console.log('   Mantidos:', filtrados.map(c => c.title).join(', '));
            
            return filtrados;
            
        } catch (error) {
            console.error('❌ Erro ao filtrar AR:', error);
            return children; // Em caso de erro, retorna todos
        }
    }

    /**
     * Filtra opções de Multifocal baseado no AR selecionado
     */
    async filtrarMultifocalPorAntireflexo(children, tratamento) {
        // Verifica se apiService está disponível
        if (!this.apiService) {
            console.warn('⚠️ ApiService não disponível - retornando todos os children');
            return children;
        }
        
        try {
            // Verifica cache
            const cacheKey = `fam_${tratamento}`;
            let familiasPermitidas = this.cacheCompatibilidade.get(cacheKey);
            
            if (!familiasPermitidas) {
                // Busca do backend
                console.log('🔍 Buscando famílias compatíveis para:', tratamento);
                const response = await this.apiService.buscarTratamentosCompativeis({ tratamento });
                
                if (response && response.familias) {
                    familiasPermitidas = response.familias.map(f => f.nome);
                    this.cacheCompatibilidade.set(cacheKey, familiasPermitidas);
                    console.log('✅ Famílias permitidas para', tratamento + ':', familiasPermitidas);
                } else {
                    console.log('⚠️ Nenhuma família encontrada para tratamento:', tratamento);
                    return children; // Retorna todos se não encontrar
                }
            } else {
                console.log('📋 Usando cache para', tratamento + ':', familiasPermitidas);
            }
            
            // Filtra children
            const filtrados = children.filter(child => 
                familiasPermitidas.includes(child.title)
            );
            
            console.log('🎭 Multifocais filtrados:', filtrados.length, 'de', children.length);
            console.log('   Mantidos:', filtrados.map(c => c.title).join(', '));
            
            return filtrados;
            
        } catch (error) {
            console.error('❌ Erro ao filtrar multifocais:', error);
            return children; // Em caso de erro, retorna todos
        }
    }

    /**
     * NOVO: Filtra opções de Coloração baseado na família selecionada
     * Se família não permite colorir, mostra apenas "Sem Coloração"
     */
    /**
     * NOVO: Filtra opções de coloração baseado em família OU marca
     * @param {Array} children - Opções de coloração
     * @param {Object} params - { familia } ou { marca }
     */
    async filtrarColoracaoPorFamiliaOuMarca(children, params) {
        // Verifica se apiService está disponível
        if (!this.apiService) {
            console.warn('⚠️ ApiService não disponível - retornando todos os children');
            return children;
        }
        
        try {
            const identificador = params.familia || params.marca;
            const tipo = params.familia ? 'familia' : 'marca';
            
            // Verifica cache
            const cacheKey = `cor_${tipo}_${identificador}`;
            let permiteColorir = this.cacheCompatibilidade.get(cacheKey);
            
            if (permiteColorir === undefined) {
                // Busca do backend - envia familia ou marca
                console.log(`🔍 Verificando se ${tipo} permite colorir:`, identificador);
                const response = await this.apiService.verificaColoracao(params);
                
                if (response !== null) {
                    permiteColorir = response.permiteColorir;
                    this.cacheCompatibilidade.set(cacheKey, permiteColorir);
                    console.log(`✅ ${tipo}`, identificador, 'permite colorir:', permiteColorir);
                } else {
                    console.log(`⚠️ Erro ao verificar coloração para ${tipo}:`, identificador);
                    return children; // Retorna todos se não conseguir verificar
                }
            } else {
                console.log('📋 Usando cache para', identificador + ':', permiteColorir);
            }
            
            // Se não permite colorir, retorna apenas "Sem Coloração"
            if (!permiteColorir) {
                const filtrados = children.filter(child => 
                    child.id === 'cor-sem' || 
                    child.label === 'Sem Coloração'
                );
                console.log(`🚫 ${tipo} não permite colorir - mostrando apenas "Sem Coloração"`);
                return filtrados;
            }
            
            // Se permite colorir, retorna todas as opções
            console.log(`🎨 ${tipo} permite colorir - mostrando todas as opções`);
            return children;
            
        } catch (error) {
            console.error('❌ Erro ao filtrar coloração:', error);
            return children; // Em caso de erro, retorna todos
        }
    }

    /**
     * @deprecated Use filtrarColoracaoPorFamiliaOuMarca
     */
    async filtrarColoracaoPorFamilia(children, familia) {
        return this.filtrarColoracaoPorFamiliaOuMarca(children, { familia });
    }

    /**
     * NOVO: Filtra produtos (famílias) para mostrar apenas os que permitem colorir
     * Usado quando uma cor é selecionada e o usuário navega para produtos
     */
    async filtrarProdutosPorColoracao(children) {
        // Verifica se apiService está disponível
        if (!this.apiService) {
            console.warn('⚠️ ApiService não disponível - retornando todos os children');
            return children;
        }
        
        try {
            // Verifica se estamos dentro de uma família específica
            const familiaSelecionada = this.getFamiliaRealSelecionada();
            
            if (familiaSelecionada) {
                // Estamos vendo MARCAS dentro de uma família - filtrar marcas
                console.log('🔍 Buscando marcas que permitem colorir na família:', familiaSelecionada);
                
                const cacheKey = `marcas_colorir_${familiaSelecionada}`;
                let marcasPermitidas = this.cacheCompatibilidade.get(cacheKey);
                
                if (!marcasPermitidas) {
                    const response = await this.apiService.verificaColoracao({ marcasDaFamilia: familiaSelecionada });
                    
                    if (response && response.marcas) {
                        marcasPermitidas = response.marcas.map(m => m.nome);
                        this.cacheCompatibilidade.set(cacheKey, marcasPermitidas);
                        console.log('✅ Marcas que permitem colorir:', marcasPermitidas);
                    } else {
                        console.log('⚠️ Nenhuma marca encontrada que permite colorir');
                        return []; // Nenhuma marca permite
                    }
                } else {
                    console.log('📋 Usando cache de marcas que permitem colorir:', marcasPermitidas.length);
                }
                
                // Filtra children para manter apenas marcas que permitem colorir
                const filtrados = children.filter(child => {
                    const nome = child.title || child.label;
                    return marcasPermitidas.includes(nome);
                });
                
                console.log('🎨 Marcas filtradas por coloração:', filtrados.length, 'de', children.length);
                console.log('   Mantidas:', filtrados.map(c => c.title || c.label).join(', '));
                
                return filtrados;
                
            } else {
                // Estamos vendo FAMÍLIAS - filtrar famílias
                const cacheKey = 'familias_colorir';
                let familiasPermitidas = this.cacheCompatibilidade.get(cacheKey);
                
                if (!familiasPermitidas) {
                    console.log('🔍 Buscando famílias que permitem colorir...');
                    const response = await this.apiService.verificaColoracao({});
                    
                    if (response && response.familias) {
                        familiasPermitidas = response.familias.map(f => f.nome);
                        this.cacheCompatibilidade.set(cacheKey, familiasPermitidas);
                        console.log('✅ Famílias que permitem colorir:', familiasPermitidas.length);
                    } else {
                        console.log('⚠️ Nenhuma família encontrada que permite colorir');
                        return children;
                    }
                } else {
                    console.log('📋 Usando cache de famílias que permitem colorir:', familiasPermitidas.length);
                }
                
                // Filtra children para manter apenas famílias que permitem colorir
                const filtrados = children.filter(child => 
                    familiasPermitidas.includes(child.title) ||
                    familiasPermitidas.includes(child.label)
                );
                
                console.log('🎨 Famílias filtradas por coloração:', filtrados.length, 'de', children.length);
                console.log('   Mantidas:', filtrados.map(c => c.title || c.label).join(', '));
                
                return filtrados;
            }
            
        } catch (error) {
            console.error('❌ Erro ao filtrar produtos por coloração:', error);
            return children; // Em caso de erro, retorna todos
        }
    }

    /**
     * Limpa cache de compatibilidade (chamar quando limpar filtros)
     */
    limparCacheCompatibilidade() {
        this.cacheCompatibilidade.clear();
        console.log('🗑️ Cache de compatibilidade limpo');
    }

    // ========================================
    // UI HELPERS
    // ========================================

    updateBreadcrumb() {
        const breadcrumbs = this.navigationModel.getBreadcrumbs();
        const current = this.navigationModel.getCurrentNode();
        this.breadcrumbView.render(breadcrumbs, current);
    }

    updateHeader(node) {
        const header = document.querySelector('.header__title');
        if (header && node) {
            header.textContent = node.label || node.title || 'Seleção de Lentes';
        }
    }

    /**
     * Renderiza UI inicial (menus, cards, breadcrumb)
     */
    renderInitialUI() {
        this.renderCurrentLevel();
        this.updateBreadcrumb();
        
        const root = this.navigationModel.getCurrentNode();
        this.updateHeader(root);
    }

    // ========================================
    // HELPERS
    // ========================================

    /**
     * Identifica tipo de config (delegado do SelectionController para evitar dependência)
     */
    identificarTipoConfig(id, label) {
        const idLower = (id || '').toLowerCase();
        const labelLower = (label || '').toLowerCase();
        
        const titulosIgnorar = ['material', 'antireflexo', 'anti-reflexo', 'fotossensivel', 
                                'fotossensível', 'antiblue', 'anti-blue', 'indice', 'índice'];
        if (titulosIgnorar.includes(idLower) || titulosIgnorar.includes(labelLower)) {
            return null;
        }
        
        if (idLower.includes('material') || idLower.includes('mat-')) return 'material';
        if (idLower.includes('ar-') || idLower.includes('antireflexo')) return 'antireflexo';
        if (idLower.includes('foto-') || idLower.includes('fotossensivel')) return 'fotossensivel';
        if (idLower.includes('blue')) return 'antiblue';
        if (idLower.includes('indice') || idLower.includes('idx-')) return 'indice';
        
        return null;
    }

    // ========================================
    // GETTERS
    // ========================================

    getCurrentNode() {
        return this.navigationModel.getCurrentNode();
    }

    getBreadcrumbs() {
        return this.navigationModel.getBreadcrumbs();
    }

    getParams() {
        return this.navigationModel.getParams();
    }
}
