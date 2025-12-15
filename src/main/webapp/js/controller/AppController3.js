/**
 * AppController.js
 * Controller Principal - COORDENADOR CENTRAL
 * 
 * RESPONSABILIDADES:
 * - Instanciar Models e Views
 * - Instanciar Sub-Controllers
 * - Escutar eventos dos sub-controllers e coordenar
 * - NÃO conter lógica de negócio (delegada aos sub-controllers)
 * 
 * PRINCÍPIO:
 * "Sub-controllers nunca conversam diretamente entre si.
 *  AppController escuta eventos e delega."
 * 
 * @author OptoFreela
 */

import EventEmitter from '../util/EventEmitter.js';

// Models
import NavigationModel from '../model/NavigationModel.js';
import SelectionModel from '../model/SelectionModel.js';
import SidebarModel from '../model/SidebarModel.js';
import SearchModel from '../model/SearchModel.js';
import ReceitaModel from '../model/ReceitaModel.js';
import SelecaoAtivaModel from '../model/SelecaoAtivaModel.js';
import CarrinhoModel from '../model/CarrinhoModel.js';  // ✅ NOVO

// Views
import CardView from '../view/CardView.js';
import SidebarView from '../view/SidebarView.js';
import ToolbarView from '../view/ToolbarView.js';
import BreadcrumbView from '../view/BreadcrumbView.js';
import DisplayProdutosView from '../view/DisplayProdutosView.js';
import BotaoFlutuanteItens from '../view/BotaoFlutuanteItens.js';
import ReceitaView from '../view/ReceitaView.js';
import SelecaoAtivaView from '../view/SelecaoAtivaView.js';
import FiltrosAplicadosView from '../view/FiltrosAplicadosView.js';
import CarrinhoView from '../view/CarrinhoView.js';  // ✅ NOVO
import ToolbarInferiorView from '../view/ToolbarInferiorView.js';  // ✅ NOVO
import OrcamentosView from '../view/OrcamentosView.js';  // ✅ NOVO - Orçamentos
import DashboardView from '../view/DashboardView.js';  // ✅ NOVO - Dashboard
import PagamentoView from '../view/PagamentoView.js';  // ✅ NOVO - Pagamento
import ComprovanteVendaView from '../view/ComprovanteVendaView.js';  // ✅ NOVO - Comprovante
import VendasView from '../view/VendasView.js';  // ✅ NOVO - Gestão de Vendas

// Sub-Controllers
import SearchController from './SearchController.js';
import SelectionController from './SelectionController.js';
import NavigationController from './NavigationController.js';
import ReceitaController from './ReceitaController.js';
import SidebarController from './SidebarController.js';
import UIController from './UIController.js';
import CarrinhoController from './CarrinhoController.js';  // ✅ NOVO
import OrcamentosController from './OrcamentosController.js';  // ✅ NOVO - Orçamentos
import DashboardController from './DashboardController.js';  // ✅ NOVO - Dashboard
import PagamentoController from './PagamentoController.js';  // ✅ NOVO - Pagamento
import VendasController from './VendasController.js';  // ✅ NOVO - Gestão de Vendas

// Services
import ApiService from '../service/ApiService.js';

export default class AppController extends EventEmitter {
    
    constructor() {
        super();
        
        this.models = {};
        this.views = {};
        this.controllers = {};
        this.state = { initialized: false };
    }

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    async init() {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🔬 SISTEMA DE LENTES - OPTOFREELA                             ║');
        console.log('║  Arquitetura: Sub-Controllers com Coordenador Central          ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  • AppController: Coordena, não executa                        ║');
        console.log('║  • Sub-Controllers: Executam, emitem eventos                   ║');
        console.log('║  • Comunicação: Sempre via AppController                       ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('');
        
        try {
            this.initModels();
            this.initViews();
            this.initControllers();
            this.bindCoordination();
            this.initDOMEvents();
            this.renderInitialUI();
            
            this.state.initialized = true;
            console.log('✅ Sistema inicializado!');
            
            // Inicializações finais
            this.controllers.ui.mostrarBotaoFlutuanteInicial();
            this.controllers.search.buscarInicial();
            this.controllers.ui.esconderLoader();
            
            // ✅ NOVO - Atualiza badge do carrinho ao iniciar
            this.atualizarBadgeCarrinho();
            
            // ✅ NOVO - Atualiza botão de receita na toolbar
            this.atualizarBotaoReceitaToolbar();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
        }
    }

    // ========================================
    // INIT MODELS
    // ========================================

    initModels() {
        this.models.navigation = new NavigationModel();
        this.models.selection = new SelectionModel();
        this.models.sidebar = new SidebarModel();
        this.models.search = new SearchModel();
        this.models.receita = new ReceitaModel();
        this.models.selecaoAtiva = new SelecaoAtivaModel();
        this.models.carrinho = new CarrinhoModel();  // ✅ NOVO
    }

    // ========================================
    // INIT VIEWS
    // ========================================

    initViews() {
        this.views.card = new CardView('cardsContainer');
        this.views.sidebar = new SidebarView();
        this.views.toolbar = new ToolbarView();
        this.views.breadcrumb = new BreadcrumbView('breadcrumbContainer');
        this.views.produtos = new DisplayProdutosView('produtosContainer');
        this.views.botaoFlutuante = new BotaoFlutuanteItens('botaoFlutuanteContainer');
        this.views.receita = new ReceitaView();
        this.views.selecaoAtiva = new SelecaoAtivaView('selecaoAtivaContainer');
        this.views.filtrosAplicados = new FiltrosAplicadosView('filtrosAplicados');
        
        // ✅ NOVO - Carrinho (sem botão flutuante, usaremos a toolbar)
        this.views.carrinho = new CarrinhoView({ mostrarBotaoFlutuante: false });
        
        // ✅ NOVO - Orçamentos
        this.views.orcamentos = new OrcamentosView();
        
        // ✅ NOVO - Dashboard
        this.views.dashboard = new DashboardView();
        
        // ✅ NOVO - Pagamento
        this.views.pagamento = new PagamentoView();
        
        // ✅ NOVO - Comprovante de Venda
        this.views.comprovante = new ComprovanteVendaView();
        
        // ✅ NOVO - Gestão de Vendas
        this.views.vendas = new VendasView();
        
        // ✅ NOVO - Toolbar Inferior
        this.views.toolbarInferior = new ToolbarInferiorView({
            botoes: [
                { id: 'home', icon: '🏠', label: 'Home', event: 'home' },
                { id: 'buscar', icon: '🔍', label: 'Buscar', event: 'buscar' },
                { id: 'receita', icon: '📋', label: 'Receita', event: 'receita', badge: false },
                { id: 'vendas', icon: '🧾', label: 'Vendas', event: 'vendas' },
                { id: 'orcamentos', icon: '📑', label: 'Orçamentos', event: 'orcamentos' },
                { id: 'dashboard', icon: '📊', label: 'Dashboard', event: 'dashboard' },
                { id: 'carrinho', icon: '🛒', label: 'Carrinho', event: 'carrinho', badge: true }
            ],
            mostrarLabels: true,
            tema: 'light'
        });
        
        // API Service - detecta contexto da aplicação automaticamente
        const contextPath = this.detectContextPath();
        this.api = new ApiService(contextPath);
        console.log('📡 ApiService configurado com contexto:', contextPath);
    }

    /**
     * Detecta o contexto da aplicação a partir da URL atual
     * Ex: /SelecaoRefatorado/ -> /SelecaoRefatorado
     */
    detectContextPath() {
        const path = window.location.pathname;
        // Extrai o primeiro segmento do path (o contexto)
        const match = path.match(/^\/[^\/]+/);
        return match ? match[0] : '';
    }

    // ========================================
    // INIT CONTROLLERS
    // ========================================

    initControllers() {
        // Search Controller
        this.controllers.search = new SearchController({
            receitaModel: this.models.receita,
            selecaoAtivaModel: this.models.selecaoAtiva,
            botaoFlutuanteView: this.views.botaoFlutuante,
            filtrosAplicadosView: this.views.filtrosAplicados
        });

        // Selection Controller
        this.controllers.selection = new SelectionController({
            selecaoAtivaModel: this.models.selecaoAtiva,
            navigationModel: this.models.navigation,
            cardView: this.views.card,
            selecaoAtivaView: this.views.selecaoAtiva,
            filtrosAplicadosView: this.views.filtrosAplicados
        });

        // Navigation Controller
        this.controllers.navigation = new NavigationController({
            navigationModel: this.models.navigation,
            selecaoAtivaModel: this.models.selecaoAtiva,
            cardView: this.views.card,
            breadcrumbView: this.views.breadcrumb,
            apiService: this.api
        });

        // Receita Controller
        this.controllers.receita = new ReceitaController({
            receitaModel: this.models.receita,
            receitaView: this.views.receita
        });

        // Sidebar Controller
        this.controllers.sidebar = new SidebarController({
            sidebarModel: this.models.sidebar,
            sidebarView: this.views.sidebar
        });

        // UI Controller
        this.controllers.ui = new UIController({
            botaoFlutuanteView: this.views.botaoFlutuante,
            produtosView: this.views.produtos
        });

        // ✅ NOVO - Carrinho Controller
        this.controllers.carrinho = new CarrinhoController({
            carrinhoModel: this.models.carrinho,
            carrinhoView: this.views.carrinho
        });

        // ✅ NOVO - Orçamentos Controller
        this.controllers.orcamentos = new OrcamentosController({
            orcamentosView: this.views.orcamentos,
            carrinhoModel: this.models.carrinho
        });

        // ✅ NOVO - Dashboard Controller
        this.controllers.dashboard = new DashboardController({
            dashboardView: this.views.dashboard
        });

        // ✅ NOVO - Pagamento Controller
        this.controllers.pagamento = new PagamentoController({
            pagamentoView: this.views.pagamento,
            carrinhoModel: this.models.carrinho
        });

        // ✅ NOVO - Vendas Controller
        this.controllers.vendas = new VendasController({
            vendasView: this.views.vendas,
            comprovanteView: this.views.comprovante
        });
    }

    // ========================================
    // COORDENAÇÃO - O CORAÇÃO DO PADRÃO
    // ========================================

    bindCoordination() {
        // ========================================
        // EVENTOS DO SEARCH CONTROLLER
        // ========================================
        
        this.controllers.search.on('buscaConcluida', ({ resultados, quantidade }) => {
            this.controllers.ui.mostrarBotaoFlutuante(quantidade, 'produtos');
            this.views.filtrosAplicados.atualizarQuantidade(quantidade);
            this.views.filtrosAplicados.esconderCarregando();
        });

        this.controllers.search.on('buscaErro', ({ error }) => {
            this.controllers.ui.mostrarErroBotao();
            this.views.filtrosAplicados.esconderCarregando();
        });

        this.controllers.search.on('semReceita', () => {
            this.controllers.ui.mostrarBotaoFlutuanteInicial();
        });

        // ========================================
        // EVENTOS DO SELECTION CONTROLLER
        // ========================================

        this.controllers.selection.on('selecaoAlterada', (selecoes) => {
            const quantidade = this.controllers.search.getUltimoResultado()?.length || 0;
            this.controllers.selection.atualizarFiltrosAplicados(quantidade);
        });

        this.controllers.selection.on('filtroAdicionado', ({ tipo, item }) => {
            console.log('🔄 Coordenador: Filtro adicionado, refazendo busca...');
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.controllers.selection.on('filtroRemovido', ({ tipo, id }) => {
            console.log('🔄 Coordenador: Filtro removido, refazendo busca...');
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.controllers.selection.on('produtoAdicionado', ({ produto }) => {
            this.controllers.ui.mostrarToast(`✅ ${produto.label} adicionado`);
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.controllers.selection.on('produtoRemovido', ({ marca }) => {
            this.controllers.ui.mostrarToast(`❌ ${marca} removido`);
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.controllers.selection.on('selecoesLimpas', () => {
            this.controllers.search.buscarInicial();
        });

        // ========================================
        // EVENTOS DO NAVIGATION CONTROLLER
        // ========================================

        this.controllers.navigation.on('navegou', ({ node, type, isRoot }) => {
            this.controllers.selection.registrarSelecao(node, type);
            
            const quantidade = this.controllers.search.getUltimoResultado()?.length || 0;
            this.controllers.selection.atualizarFiltrosAplicados(quantidade);
            
            if (!isRoot) {
                console.log('🔄 Coordenador: Navegou para categoria, buscando...');
                this.controllers.search.buscarComFiltrosAtuais();
            }
        });

        this.controllers.navigation.on('voltou', ({ node, breadcrumbs, isRoot }) => {
            this.controllers.selection.atualizarSelecoesDosBreadcrumbs(breadcrumbs);
            
            if (!isRoot) {
                this.controllers.search.buscarComFiltrosAtuais();
            } else {
                this.controllers.search.buscarInicial();
            }
        });

        this.controllers.navigation.on('foiParaHome', () => {
            this.controllers.selection.limparTudo();
            this.controllers.search.buscarInicial();
        });

        this.controllers.navigation.on('pulou', ({ node, breadcrumbs, isRoot }) => {
            this.controllers.selection.atualizarSelecoesDosBreadcrumbs(breadcrumbs);
            
            if (!isRoot) {
                this.controllers.search.buscarComFiltrosAtuais();
            } else {
                this.controllers.search.buscarInicial();
            }
        });

        this.controllers.navigation.on('contadorAtualizado', ({ count }) => {
            console.log('🔄 Coordenador: Contador atualizado para', count);
            this.views.produtos.atualizarContador(count);
        });

        this.controllers.navigation.on('buscarComFiltroColoracao', ({ permiteColorir }) => {
            console.log('🔄 Coordenador: Busca especial com permite_colorir=' + permiteColorir);
            this.controllers.search.buscarComFiltrosAtuais({ permite_colorir: permiteColorir });
        });

        // ========================================
        // EVENTOS DO RECEITA CONTROLLER
        // ========================================

        this.controllers.receita.on('receitaSalva', ({ dados }) => {
            console.log('🔄 Coordenador: Receita salva, refazendo busca...');
            this.controllers.search.buscarComFiltrosAtuais();
            this.atualizarBotaoReceitaToolbar();  // ✅ NOVO
        });

        this.controllers.receita.on('receitaLimpa', () => {
            console.log('🔄 Coordenador: Receita limpa, zerando resultados...');
            
            this.controllers.search.limparResultado();
            this.controllers.ui.limparProdutos();
            this.controllers.ui.mostrarBotaoFlutuante(0, 'produtos');
            this.views.filtrosAplicados.atualizarQuantidade(0);
            this.views.toolbar.onReceitaLimpa();
            this.atualizarBotaoReceitaToolbar();  // ✅ NOVO
        });

        // ========================================
        // EVENTOS DO SIDEBAR CONTROLLER
        // ========================================

        this.controllers.sidebar.on('itemConfigClicado', ({ id }) => {
            this.controllers.navigation.navegarParaConfiguracao(id);
        });

        this.controllers.sidebar.on('itemCategoriaClicado', ({ id }) => {
            this.controllers.navigation.navegarParaCategoriaLimpandoContexto(id);
        });

        // ========================================
        // EVENTOS DO UI CONTROLLER
        // ========================================

        this.controllers.ui.on('botaoFlutuanteClicado', ({ quantidade }) => {
            console.log('🔘 Coordenador: Botão flutuante clicado');
            
            const resultados = this.controllers.search.getUltimoResultado();
            this.controllers.ui.renderProdutos(resultados);
            this.controllers.ui.pulsarBotao();
            
            this.emit('verResultados', { quantidade });
        });

        // ========================================
        // EVENTOS DAS VIEWS (não delegados)
        // ========================================

        // Card clicks
        this.views.card.on('click', (data) => this.handleCardClick(data));

        // Seleção ativa - remover
        this.views.selecaoAtiva.on('remover', ({ tipo, id }) => {
            const tipoRemovido = this.controllers.selection.removerFiltro(tipo, id);
            
            if (!this.models.selecaoAtiva.ehTipoMultiplo(tipoRemovido)) {
                this.controllers.navigation.voltarParaNivel(tipoRemovido);
            }
            
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.views.selecaoAtiva.on('limpar', () => {
            this.controllers.selection.limparTudo();
            this.controllers.navigation.goHome();
        });

        // Filtros aplicados
        this.views.filtrosAplicados.on('removerFiltro', ({ tipo, id }) => {
            const tipoRemovido = this.controllers.selection.removerFiltro(tipo, id);
            
            if (!this.models.selecaoAtiva.ehTipoMultiplo(tipoRemovido)) {
                this.controllers.navigation.voltarParaNivel(tipoRemovido);
            }
            
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.views.filtrosAplicados.on('removerProduto', ({ marca }) => {
            this.controllers.selection.removerProduto(marca);
            this.controllers.search.buscarComFiltrosAtuais();
        });

        this.views.filtrosAplicados.on('buscar', () => {
            this.views.filtrosAplicados.mostrarCarregando();
            this.controllers.search.buscarComFiltrosAtuais();
        });

        // ✅ MODIFICADO - Produtos - Adicionar ao Carrinho
        this.views.produtos.on('addCarrinho', ({ codigo, marca, produto }) => {
            console.log('🛒 Adicionando ao carrinho:', marca, codigo);
            this.controllers.carrinho.adicionarProduto(produto);
            this.emit('addCarrinho', { codigo, marca, produto });
        });

        this.views.produtos.on('produtoClick', (data) => {
            this.emit('produtoClick', data);
        });

        // ========================================
        // ✅ NOVO - EVENTOS DO CARRINHO CONTROLLER
        // ========================================

        this.controllers.carrinho.on('carrinhoAberto', () => {
            console.log('🛒 Carrinho aberto');
        });

        this.controllers.carrinho.on('carrinhoFechado', () => {
            console.log('🛒 Carrinho fechado');
        });

        this.controllers.carrinho.on('voltarParaProdutos', () => {
            const resultados = this.controllers.search.getUltimoResultado();
            this.controllers.ui.renderProdutos(resultados);
        });

        this.controllers.carrinho.on('finalizarPedido', async (dados) => {
            console.log('💳 Finalizando pedido:', dados);
            
            try {
                const response = await this.enviarPedido(dados);
                
                if (response.success) {
                    this.models.carrinho.limpar();
                    this.controllers.carrinho.fechar();
                    this.controllers.ui.mostrarToast('✅ Pedido enviado com sucesso!');
                    
                    if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    }
                } else {
                    this.controllers.ui.mostrarToast('❌ Erro: ' + response.message);
                }
            } catch (error) {
                console.error('Erro ao enviar pedido:', error);
                this.controllers.ui.mostrarToast('❌ Erro ao enviar pedido');
            }
        });

        this.controllers.carrinho.on('salvarOrcamento', async (dados) => {
            console.log('💾 Salvando orçamento:', dados);
            
            try {
                const response = await this.salvarOrcamento(dados);
                
                if (response.success) {
                    this.controllers.carrinho.fechar();
                    this.controllers.ui.mostrarToast('✅ Orçamento salvo com sucesso!');
                    
                    // Opcionalmente limpar o carrinho após salvar
                    // this.models.carrinho.limpar();
                } else {
                    this.controllers.ui.mostrarToast('❌ Erro: ' + response.message);
                }
            } catch (error) {
                console.error('Erro ao salvar orçamento:', error);
                this.controllers.ui.mostrarToast('❌ Erro ao salvar orçamento');
            }
        });

        this.controllers.carrinho.on('itemAdicionado', ({ item, tipo }) => {
            this.atualizarBadgeCarrinho();
        });

        this.controllers.carrinho.on('itemRemovido', ({ item, tipo }) => {
            this.atualizarBadgeCarrinho();
        });

        this.controllers.carrinho.on('carrinhoLimpo', () => {
            this.atualizarBadgeCarrinho();
        });

        // ========================================
        // ✅ NOVO - EVENTOS DA TOOLBAR INFERIOR
        // ========================================

        this.views.toolbarInferior.on('home', () => {
            console.log('🏠 Toolbar: Home');
            this.controllers.navigation.goHome();
        });

        this.views.toolbarInferior.on('buscar', () => {
            console.log('🔍 Toolbar: Buscar');
            // Abre modal de busca ou mostra resultados
            const resultados = this.controllers.search.getUltimoResultado();
            if (resultados && resultados.length > 0) {
                this.controllers.ui.renderProdutos(resultados);
            }
        });

        this.views.toolbarInferior.on('receita', () => {
            console.log('📋 Toolbar: Receita');
            this.controllers.receita.abrirModal();
        });

        this.views.toolbarInferior.on('orcamentos', () => {
            console.log('📑 Toolbar: Orçamentos');
            this.controllers.orcamentos.abrir();
        });

        this.views.toolbarInferior.on('vendas', () => {
            console.log('🧾 Toolbar: Vendas');
            this.controllers.vendas.abrir();
        });

        this.views.toolbarInferior.on('dashboard', () => {
            console.log('📊 Toolbar: Dashboard');
            this.controllers.dashboard.abrir();
        });

        this.views.toolbarInferior.on('carrinho', () => {
            console.log('🛒 Toolbar: Carrinho');
            this.controllers.carrinho.toggle();
        });

        // ========================================
        // ✅ NOVO - EVENTOS DO ORÇAMENTOS CONTROLLER
        // ========================================

        this.controllers.orcamentos.on('orcamentoRecuperado', ({ orcamento }) => {
            console.log('📋 Orçamento recuperado:', orcamento.id);
            
            // Abre o carrinho para mostrar os itens
            this.controllers.carrinho.abrir();
            
            // Atualiza badges
            this.atualizarBadgeCarrinho();
        });

        this.controllers.orcamentos.on('orcamentoConvertido', ({ orcamento }) => {
            console.log('💳 Orçamento convertido em venda:', orcamento.id);
            
            // Abre carrinho
            this.controllers.carrinho.abrir();
        });

        this.controllers.orcamentos.on('orcamentoExcluido', ({ id }) => {
            console.log('🗑️ Orçamento excluído:', id);
        });

        // ========================================
        // ✅ NOVO - EVENTOS DO DASHBOARD CONTROLLER
        // ========================================

        this.controllers.dashboard.on('verOrcamento', ({ id }) => {
            console.log('📊 Dashboard: Ver orçamento', id);
            // Fecha dashboard e abre lista de orçamentos
            this.controllers.dashboard.fechar();
            this.controllers.orcamentos.abrir();
        });

        // ========================================
        // ✅ NOVO - EVENTOS DO PAGAMENTO CONTROLLER
        // ========================================

        // Ir para pagamento (do carrinho)
        this.controllers.carrinho.on('irParaPagamento', () => {
            console.log('💳 Carrinho: Ir para pagamento');
            this.views.carrinho.fechar();
            this.controllers.pagamento.abrir();
        });

        // Venda confirmada - Abre comprovante
        this.controllers.pagamento.on('vendaConfirmada', (dadosVenda) => {
            console.log('✅ Venda confirmada:', dadosVenda.idPedido);
            
            // Atualiza badge do carrinho (agora zerado)
            this.atualizarBadgeCarrinho();
            
            // Abre o comprovante da venda
            this.views.comprovante.abrir(dadosVenda);
        });
        
        // Evento de nova venda (após fechar comprovante)
        this.views.comprovante.on('novaVenda', () => {
            console.log('➕ Nova venda solicitada');
            this.controllers.navigation.goHome();
        });

        // Venda cancelada
        this.controllers.pagamento.on('vendaCancelada', () => {
            console.log('❌ Venda cancelada');
            // Reabre o carrinho se o usuário cancelou
            this.controllers.carrinho.abrir();
        });

        // ========================================
        // ✅ NOVO - EVENTOS DO VENDAS CONTROLLER
        // ========================================

        // Venda cancelada na gestão de vendas
        this.controllers.vendas.on('vendaCancelada', ({ vendaId }) => {
            console.log('🗑️ Venda cancelada:', vendaId);
        });

        // Abrir caixa para uma venda específica
        this.controllers.vendas.on('abrirCaixa', ({ vendaId }) => {
            console.log('🏧 Abrir caixa para venda:', vendaId);
            // TODO: quando implementar o caixa, abrir diretamente na venda
            // this.controllers.caixa.abrir(vendaId);
            this.controllers.ui.mostrarToast('🏧 Funcionalidade de Caixa em desenvolvimento');
        });
    }

    // ========================================
    // HANDLER DE CARD CLICK
    // ========================================

    handleCardClick({ item, selectionMode }) {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  📌 CLIQUE EM CARD DETECTADO                                   ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('📋 Card:', item.label, '| Tipo:', item.type, '| Modo:', selectionMode);
        
        if (selectionMode === 'multiple') {
            console.log('🔀 Modo MÚLTIPLO → Seleção de configuração');
            this.controllers.selection.handleConfigSelection(item);
            return;
        }
        
        if (item.hasChildren) {
            console.log('🔀 Card TEM FILHOS → Navegando...');
            this.controllers.navigation.navigateTo(item.id);
        } else {
            if (this.controllers.selection.isConfigurationType(item.type)) {
                console.log('🔀 Card é CONFIGURAÇÃO → Selecionando filtro...');
                this.controllers.selection.handleConfigSelection(item);
            } else {
                console.log('🔀 Card é PRODUTO FINAL → Adicionando como filtro de marca...');
                this.controllers.selection.handleProductSelection(item);
            }
        }
    }

    // ========================================
    // DOM EVENTS
    // ========================================

    initDOMEvents() {
        // Botão receita
        const btnReceita = document.getElementById('toolbarPrescription');
        if (btnReceita) {
            btnReceita.addEventListener('click', () => {
                this.controllers.receita.abrirModal();
            });
        }
        
        // Botão voltar
        const btnBack = document.getElementById('btnBack');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.controllers.navigation.goBack();
            });
        }
        
        // Botão home
        const btnHome = document.getElementById('btnHome');
        if (btnHome) {
            btnHome.addEventListener('click', () => {
                this.controllers.navigation.goHome();
            });
        }
        
        // Backdrop sidebars
        const leftBackdrop = document.getElementById('leftBackdrop');
        if (leftBackdrop) {
            leftBackdrop.addEventListener('click', () => {
                this.controllers.sidebar.hideLeft();
            });
        }
        
        const rightBackdrop = document.getElementById('rightBackdrop');
        if (rightBackdrop) {
            rightBackdrop.addEventListener('click', () => {
                this.controllers.sidebar.hideRight();
            });
        }
        
        // ✅ Botão do carrinho na toolbar (se existir)
        const btnCarrinho = document.getElementById('btnCarrinho');
        if (btnCarrinho) {
            btnCarrinho.addEventListener('click', () => {
                this.controllers.carrinho.toggle();
            });
        }
        
        // Nota: O botão flutuante é criado automaticamente pelo CarrinhoView
        // e já possui seu próprio binding de evento
        
        // Viewport
        this.controllers.ui.setupViewport();
    }

    // ========================================
    // RENDER INICIAL
    // ========================================

    renderInitialUI() {
        this.controllers.sidebar.renderMenus();
        this.controllers.navigation.renderInitialUI();
        this.controllers.receita.atualizarBotaoReceita();
    }

    // ========================================
    // ✅ NOVOS MÉTODOS - CARRINHO
    // ========================================

    /**
     * Envia pedido para o backend
     */
    async enviarPedido(dados) {
        const baseUrl = this.detectContextPath();
        const url = baseUrl + '/AdicionarCarrinho';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: dados.payload.toString()
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Salva orçamento para consulta futura
     */
    async salvarOrcamento(dados) {
        const baseUrl = this.detectContextPath();
        const url = baseUrl + '/SalvarOrcamento';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: dados.payload.toString()
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Atualiza badge do carrinho (na toolbar inferior e na view)
     */
    atualizarBadgeCarrinho() {
        const quantidade = this.models.carrinho.getQuantidadeItens();
        
        // Atualiza na CarrinhoView (se tiver botão flutuante)
        this.views.carrinho.atualizarBadge(quantidade);
        
        // Atualiza na Toolbar Inferior
        this.views.toolbarInferior.atualizarBadge('carrinho', quantidade);
    }

    /**
     * Atualiza estado do botão de receita na toolbar
     */
    atualizarBotaoReceitaToolbar() {
        const temReceita = this.models.receita.temReceita();
        this.views.toolbarInferior.atualizarBotaoReceita(temReceita);
    }

    /**
     * Abre o modal do carrinho
     */
    abrirCarrinho() {
        this.controllers.carrinho.abrir();
    }
}
