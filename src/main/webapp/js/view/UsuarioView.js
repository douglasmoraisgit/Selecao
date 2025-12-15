/**
 * UsuarioView.js
 * View para renderizar o menu do usuário na toolbar
 * 
 * @author OptoFreela
 */
import EventEmitter from '../util/EventEmitter.js';

class UsuarioView extends EventEmitter {
    
    constructor() {
        super();
        this.container = null;
        this.injectStyles();
    }

    /**
     * Inicializa a view
     */
    init(containerId = 'userMenuContainer') {
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.warn('UsuarioView: Container não encontrado:', containerId);
            return false;
        }
        
        return true;
    }

    /**
     * Renderiza o menu do usuário
     */
    render(dados) {
        if (!this.container) return;
        
        if (!dados || !dados.logado) {
            this.container.innerHTML = '';
            return;
        }
        
        const { usuario, loja, perfil } = dados;
        
        this.container.innerHTML = `
            <div class="user-menu">
                <div class="user-info">
                    <span class="user-name">${usuario.nome}</span>
                    ${loja ? `<span class="user-loja">${loja.nome}</span>` : ''}
                </div>
                <div class="user-avatar" id="userAvatar" title="${usuario.nome}">
                    ${usuario.iniciais}
                </div>
                
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-header">
                        <div class="dropdown-user-name">${usuario.nome}</div>
                        ${perfil ? `<div class="dropdown-user-role">${perfil.nome}</div>` : ''}
                    </div>
                    
                    <div class="user-dropdown-body">
                        <a href="perfil.html" class="user-dropdown-item">
                            <span class="dropdown-icon">👤</span>
                            <span>Meu Perfil</span>
                        </a>
                        
                        <a href="configuracoes.html" class="user-dropdown-item">
                            <span class="dropdown-icon">⚙️</span>
                            <span>Configurações</span>
                        </a>
                        
                        <div class="user-dropdown-divider"></div>
                        
                        <button class="user-dropdown-item danger" id="btnLogout">
                            <span class="dropdown-icon">🚪</span>
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.bindEvents();
    }

    /**
     * Bind de eventos
     */
    bindEvents() {
        const avatar = document.getElementById('userAvatar');
        const dropdown = document.getElementById('userDropdown');
        const btnLogout = document.getElementById('btnLogout');
        
        if (avatar && dropdown) {
            // Toggle dropdown
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // Fecha ao clicar fora
            document.addEventListener('click', (e) => {
                if (!this.container.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
            
            // Fecha com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdown.classList.remove('show');
                }
            });
        }
        
        // Botão logout
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.emit('logout');
            });
        }
    }

    /**
     * Mostra estado de carregando
     */
    renderLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="user-menu">
                <div class="user-avatar loading">
                    <span class="spinner-small"></span>
                </div>
            </div>
        `;
    }

    /**
     * Injeta estilos CSS
     */
    injectStyles() {
        if (document.getElementById('usuarioViewStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'usuarioViewStyles';
        style.textContent = `
            /* ========================================
               MENU DO USUÁRIO
            ======================================== */
            
            .user-menu {
                position: relative;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                text-align: right;
            }
            
            .user-name {
                font-weight: 600;
                color: white;
                font-size: 13px;
                line-height: 1.2;
            }
            
            .user-loja {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.7);
                line-height: 1.2;
            }
            
            .user-avatar {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .user-avatar:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }
            
            .user-avatar.loading {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .spinner-small {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* ========================================
               DROPDOWN
            ======================================== */
            
            .user-dropdown {
                position: absolute;
                top: calc(100% + 12px);
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                min-width: 220px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                z-index: 10001;
                overflow: hidden;
            }
            
            .user-dropdown.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .user-dropdown-header {
                padding: 16px;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border-bottom: 1px solid #e5e7eb;
            }
            
            .dropdown-user-name {
                font-weight: 600;
                color: #1f2937;
                font-size: 15px;
            }
            
            .dropdown-user-role {
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
            }
            
            .user-dropdown-body {
                padding: 8px 0;
            }
            
            .user-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 16px;
                color: #374151;
                text-decoration: none;
                transition: all 0.15s;
                cursor: pointer;
                font-size: 14px;
                border: none;
                background: none;
                width: 100%;
                text-align: left;
            }
            
            .user-dropdown-item:hover {
                background: #f3f4f6;
            }
            
            .user-dropdown-item.danger {
                color: #dc2626;
            }
            
            .user-dropdown-item.danger:hover {
                background: #fef2f2;
            }
            
            .dropdown-icon {
                font-size: 16px;
                width: 20px;
                text-align: center;
            }
            
            .user-dropdown-divider {
                height: 1px;
                background: #e5e7eb;
                margin: 8px 0;
            }
            
            /* ========================================
               RESPONSIVO
            ======================================== */
            
            @media (max-width: 768px) {
                .user-info {
                    display: none;
                }
                
                .user-avatar {
                    width: 34px;
                    height: 34px;
                    font-size: 13px;
                }
                
                .user-dropdown {
                    right: -10px;
                    min-width: 200px;
                }
            }
            
            @media (max-width: 480px) {
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    font-size: 12px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

export default UsuarioView;
