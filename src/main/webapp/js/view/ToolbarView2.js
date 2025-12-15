/**
 * ToolbarView.js
 * View - Renderiza e controla UI da toolbar superior
 */

import EventEmitter from '../util/EventEmitter.js';

export default class ToolbarView extends EventEmitter {
    
    constructor() {
        super();
        
        this.elements = {
            toolbar: document.querySelector('.toolbar'),
            searchInput: document.getElementById('toolbarSearch'),
            searchContainer: document.querySelector('.toolbar__search'),
            btnPrescription: document.getElementById('toolbarPrescription'),
            btnServer: document.getElementById('toolbarServer')
        };
        
        this.initEventListeners();
    }

    initEventListeners() {
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.emit('searchInput', { query: e.target.value });
            });
            
            this.elements.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.emit('searchSubmit', { query: e.target.value });
                }
                if (e.key === 'Escape') {
                    this.clearSearch();
                    e.target.blur();
                }
            });
        }
        
        if (this.elements.btnPrescription) {
            this.elements.btnPrescription.addEventListener('click', () => {
                this.emit('prescriptionClick');
            });
        }
        
        if (this.elements.btnServer) {
            this.elements.btnServer.addEventListener('click', () => {
                this.emit('serverClick');
            });
        }
        
        // Atalho Ctrl+K para busca
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    }

    focusSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.focus();
            this.elements.searchInput.select();
        }
    }

    setSearchValue(value) {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = value;
        }
    }

    getSearchValue() {
        return this.elements.searchInput?.value || '';
    }

    clearSearch() {
        this.setSearchValue('');
        this.emit('searchClear');
    }

    setSearchLoading(loading) {
        this.elements.searchContainer?.classList.toggle('toolbar__search--loading', loading);
    }

    setIndicatorStatus(status) {
        const indicator = document.querySelector('.toolbar__search-indicator');
        if (indicator) {
            indicator.className = `toolbar__search-indicator toolbar__search-indicator--${status}`;
        }
    }

    setButtonActive(button, active) {
        const btn = button === 'prescription' 
            ? this.elements.btnPrescription 
            : this.elements.btnServer;
        btn?.classList.toggle('toolbar__btn--active', active);
    }

    setButtonLoading(button, loading) {
        const btn = button === 'prescription' 
            ? this.elements.btnPrescription 
            : this.elements.btnServer;
        if (btn) {
            btn.classList.toggle('toolbar__btn--loading', loading);
            btn.disabled = loading;
        }
    }

    show() {
        this.elements.toolbar?.classList.add('toolbar--visible');
    }

    hide() {
        this.elements.toolbar?.classList.remove('toolbar--visible');
    }
}
