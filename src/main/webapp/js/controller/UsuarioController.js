/**
 * UsuarioController.js
 * Controller para gerenciar o menu do usuário logado
 * 
 * @author OptoFreela
 */
import EventEmitter from '../util/EventEmitter.js';

class UsuarioController extends EventEmitter {
    
    constructor(usuarioModel, usuarioView) {
        super();
        this.model = usuarioModel;
        this.view = usuarioView;
    }

    /**
     * Inicializa o controller
     */
    async init(containerId = 'userMenuContainer') {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  🔐 UsuarioController.init() - INICIANDO                       ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('Container ID:', containerId);
        
        // Inicializa a view
        if (!this.view.init(containerId)) {
            console.warn('❌ UsuarioController: Container não encontrado:', containerId);
            return false;
        }
        console.log('✅ View inicializada');
        
        // Bind eventos do model
        this.bindModelEvents();
        console.log('✅ Eventos do model bindados');
        
        // Bind eventos da view
        this.bindViewEvents();
        console.log('✅ Eventos da view bindados');
        
        // Mostra loading
        this.view.renderLoading();
        console.log('⏳ Mostrando loading...');
        
        // Carrega dados do usuário
        try {
            console.log('📡 Chamando model.carregar()...');
            const sucesso = await this.model.carregar();
            
            console.log('📥 Resultado do carregar():', sucesso);
            
            if (!sucesso) {
                console.warn('⚠️ Não autenticado - redirecionando para login');
                this.redirecionarLogin('session');
                return false;
            }
            
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════════╗');
            console.log('║  ✅ USUÁRIO CARREGADO COM SUCESSO                              ║');
            console.log('╠════════════════════════════════════════════════════════════════╣');
            console.log('║  Nome:', this.model.getNome());
            console.log('║  Loja:', this.model.getLojaNome() || 'N/A');
            console.log('╚════════════════════════════════════════════════════════════════╝');
            return true;
            
        } catch (error) {
            console.error('❌ UsuarioController: Erro ao carregar usuário:', error);
            this.redirecionarLogin('error');
            return false;
        }
    }

    /**
     * Bind eventos do model
     */
    bindModelEvents() {
        // Usuário carregado com sucesso
        this.model.on('usuarioCarregado', (dados) => {
            this.view.render(dados);
            this.emit('usuarioCarregado', dados);
        });
        
        // Não autenticado
        this.model.on('naoAutenticado', () => {
            this.redirecionarLogin('session');
        });
        
        // Erro no carregamento
        this.model.on('erroCarregamento', (error) => {
            console.error('Erro ao carregar usuário:', error);
        });
    }

    /**
     * Bind eventos da view
     */
    bindViewEvents() {
        // Logout
        this.view.on('logout', () => {
            this.logout();
        });
    }

    /**
     * Redireciona para login
     */
    redirecionarLogin(motivo = '') {
        const url = motivo ? `login.html?error=${motivo}` : 'login.html';
        window.location.href = url;
    }

    /**
     * Faz logout
     */
    logout() {
        console.log('🚪 UsuarioController: Fazendo logout...');
        this.model.logout();
    }

    /**
     * Retorna dados do usuário (atalho)
     */
    getUsuario() {
        return this.model.getUsuario();
    }

    /**
     * Retorna nome do usuário (atalho)
     */
    getNome() {
        return this.model.getNome();
    }

    /**
     * Retorna dados da loja (atalho)
     */
    getLoja() {
        return this.model.getLoja();
    }

    /**
     * Retorna dados do perfil (atalho)
     */
    getPerfil() {
        return this.model.getPerfil();
    }

    /**
     * Verifica se está logado (atalho)
     */
    isLogado() {
        return this.model.isLogado();
    }

    /**
     * Verifica se é admin (atalho)
     */
    isAdmin() {
        return this.model.isAdmin();
    }
}

export default UsuarioController;
