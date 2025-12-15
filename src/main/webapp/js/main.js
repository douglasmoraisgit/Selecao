/**
 * main.js
 * Ponto de entrada da aplicação - ES6 Modules
 */

import AppController from './controller/AppController.js';

// Instância global da aplicação
let app = null;

// ========================================
// INICIALIZAÇÃO
// ========================================

async function initApp() {
    console.log('📦 Iniciando aplicação...');
    
    try {
        app = new AppController();
        await app.init();
        
        // Expõe globalmente para debug e funções onclick
        window.app = app;
        
        console.log('✅ Aplicação pronta!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        
        // Remove loader mesmo em caso de erro
        const loader = document.getElementById('globalLoader');
        if (loader) loader.remove();
    }
}

// ========================================
// FUNÇÕES GLOBAIS PARA ONCLICK
// ========================================

window.toggleLeftSidebar = function() {
    console.log('🔧 toggleLeftSidebar');
    if (app?.controllers?.sidebar) {
        app.controllers.sidebar.toggle('left');
    } else {
        // Fallback DOM
        const sidebar = document.getElementById('leftSidebar');
        const backdrop = document.getElementById('leftBackdrop');
        sidebar?.classList.toggle('sidebar--visible');
        backdrop?.classList.toggle('sidebar-backdrop--visible');
    }
};

window.closeLeftSidebar = function() {
    console.log('🔧 closeLeftSidebar');
    if (app?.controllers?.sidebar) {
        app.controllers.sidebar.hide('left');
    } else {
        document.getElementById('leftSidebar')?.classList.remove('sidebar--visible');
        document.getElementById('leftBackdrop')?.classList.remove('sidebar-backdrop--visible');
    }
};

window.toggleRightSidebar = function() {
    console.log('🔧 toggleRightSidebar');
    
    const sidebar = document.getElementById('optionsSidebar');
    const backdrop = document.getElementById('rightBackdrop');
    
    if (!sidebar) {
        console.error('❌ #optionsSidebar não encontrado');
        return;
    }
    
    if (app?.views?.sidebar) {
        const isVisible = app.views.sidebar.isRightVisible();
        if (isVisible) {
            app.views.sidebar.hideRight();
        } else {
            app.views.sidebar.showRight();
        }
    } else {
        // Fallback DOM direto
        const isVisible = sidebar.classList.contains('sidebar--visible');
        sidebar.classList.toggle('sidebar--visible', !isVisible);
        backdrop?.classList.toggle('sidebar-backdrop--visible', !isVisible);
    }
    
    console.log('📌 Sidebar classes:', sidebar.className);
};

window.closeRightSidebar = function() {
    console.log('🔧 closeRightSidebar');
    if (app?.views?.sidebar) {
        app.views.sidebar.hideRight();
    } else {
        document.getElementById('optionsSidebar')?.classList.remove('sidebar--visible');
        document.getElementById('rightBackdrop')?.classList.remove('sidebar-backdrop--visible');
    }
};

// ========================================
// INICIAR QUANDO DOM PRONTO
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
