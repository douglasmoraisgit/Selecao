/**
 * UsuarioModel.js
 * Model para gerenciar dados do usuário logado
 * 
 * @author OptoFreela
 */
import EventEmitter from '../util/EventEmitter.js';

class UsuarioModel extends EventEmitter {
    
    constructor() {
        super();
        this.usuario = null;
        this.loja = null;
        this.perfil = null;
        this.logado = false;
    }

    /**
     * Carrega dados do usuário logado do servidor
     */
    async carregar() {
        console.log('');
        console.log('┌─────────────────────────────────────────────────────────────────┐');
        console.log('│ 🔍 UsuarioModel.carregar() - Chamando API                       │');
        console.log('└─────────────────────────────────────────────────────────────────┘');
        
        try {
            console.log('📡 Fazendo fetch para: UsuarioLogado');
            const response = await fetch('UsuarioLogado');
            
            console.log('📥 Response status:', response.status);
            console.log('📥 Response ok:', response.ok);
            
            if (!response.ok) {
                console.error('❌ Response não OK:', response.status, response.statusText);
                throw new Error('Erro na requisição: ' + response.status);
            }
            
            const data = await response.json();
            console.log('📦 Dados recebidos:', data);
            
            if (data.logado) {
                this.usuario = data.usuario;
                this.loja = data.loja || null;
                this.perfil = data.perfil || null;
                this.logado = true;
                
                console.log('✅ Usuário autenticado:', this.usuario.nome);
                this.emit('usuarioCarregado', this.getDados());
                return true;
            } else {
                console.warn('⚠️ API retornou logado=false');
                this.logado = false;
                this.emit('naoAutenticado');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar usuário:', error);
            this.emit('erroCarregamento', error);
            throw error;
        }
    }

    /**
     * Retorna todos os dados
     */
    getDados() {
        return {
            usuario: this.usuario,
            loja: this.loja,
            perfil: this.perfil,
            logado: this.logado
        };
    }

    /**
     * Retorna dados do usuário
     */
    getUsuario() {
        return this.usuario;
    }

    /**
     * Retorna dados da loja
     */
    getLoja() {
        return this.loja;
    }

    /**
     * Retorna dados do perfil
     */
    getPerfil() {
        return this.perfil;
    }

    /**
     * Retorna ID do usuário
     */
    getId() {
        return this.usuario?.id || null;
    }

    /**
     * Retorna nome do usuário
     */
    getNome() {
        return this.usuario?.nome || '';
    }

    /**
     * Retorna iniciais do nome
     */
    getIniciais() {
        return this.usuario?.iniciais || '?';
    }

    /**
     * Retorna nome da loja
     */
    getLojaNome() {
        return this.loja?.nome || '';
    }

    /**
     * Retorna ID da loja
     */
    getLojaId() {
        return this.loja?.id || null;
    }

    /**
     * Retorna nome do perfil
     */
    getPerfilNome() {
        return this.perfil?.nome || '';
    }

    /**
     * Verifica se está logado
     */
    isLogado() {
        return this.logado === true;
    }

    /**
     * Verifica se tem determinado perfil
     */
    temPerfil(nomePerfil) {
        return this.perfil?.nome?.toLowerCase() === nomePerfil.toLowerCase();
    }

    /**
     * Verifica se é admin
     */
    isAdmin() {
        return this.temPerfil('Administrador') || this.temPerfil('Admin');
    }

    /**
     * Faz logout (redireciona)
     */
    logout() {
        window.location.href = 'LogoutServlet';
    }
}

export default UsuarioModel;
