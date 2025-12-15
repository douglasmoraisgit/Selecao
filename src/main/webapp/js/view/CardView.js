/**
 * CardView.js
 * View - Renderiza e controla UI dos cards de seleção
 * 
 * ATUALIZADO: Suporte a imagens de cor (corImagem) para cards de coloração
 */

import EventEmitter from '../util/EventEmitter.js';

export default class CardView extends EventEmitter {
    
    constructor(containerId = 'cardsContainer') {
        super();
        this.container = document.getElementById(containerId);
        this.cards = [];
    }

    render(items, options = {}) {
        if (!this.container) return;
        
        const { selectedId = null, selectedIds = [], columns = 4, selectionMode = 'single' } = options;
        
        this.container.innerHTML = '';
        this.cards = [];
        
        const grid = document.createElement('div');
        grid.className = `simple-cards-grid simple-cards-grid--${columns}col`;
        
        items.forEach(item => {
            const isSelected = selectionMode === 'single' 
                ? item.id === selectedId 
                : selectedIds.includes(item.id);
            
            const card = this.createCard(item, isSelected);
            grid.appendChild(card);
            this.cards.push({ element: card, data: item });
        });
        
        this.container.appendChild(grid);
        this.animateIn();
    }

    createCard(item, isSelected = false) {
		    console.log('🎨 createCard:', item.label, 'corImagem:', item.corImagem);  // ADICIONE ISSO

        const card = document.createElement('div');
        card.className = 'simple-card';
        card.dataset.id = item.id;
        
        // Verifica se é um card de cor
        const isColorCard = item.corImagem || item.corHex;
        if (isColorCard) {
            card.classList.add('simple-card--color');
        }
        
        if (isSelected) card.classList.add('simple-card--selected');
        
        // Renderiza conteúdo diferente para cards de cor
        if (item.corImagem) {
            // Card com imagem de cor (base64 ou URL)
            card.innerHTML = `
                <div class="simple-card__color-preview">
                    <img src="${item.corImagem}" alt="${item.label}" class="simple-card__color-image" />
                </div>
                <h3 class="simple-card__title">${item.title || item.label || ''}</h3>
                <p class="simple-card__description">${item.description || ''}</p>
            `;
        } else if (item.corHex) {
            // Card com cor sólida (hex)
            card.innerHTML = `
                <div class="simple-card__color-preview">
                    <div class="simple-card__color-circle" style="background-color: ${item.corHex};"></div>
                </div>
                <h3 class="simple-card__title">${item.title || item.label || ''}</h3>
                <p class="simple-card__description">${item.description || ''}</p>
            `;
        } else {
            // Card normal com ícone
            card.innerHTML = `
                <div class="simple-card__icon">${item.icon || '📦'}</div>
                <h3 class="simple-card__title">${item.title || item.label || ''}</h3>
                <p class="simple-card__description">${item.description || ''}</p>
            `;
        }
        
        card.addEventListener('click', () => this.handleCardClick(item, card));
        
        return card;
    }

    selectCard(id, clearOthers = true) {
        if (clearOthers) this.clearSelection();
        const cardInfo = this.cards.find(c => c.data.id === id);
        if (cardInfo) cardInfo.element.classList.add('simple-card--selected');
    }

    deselectCard(id) {
        const cardInfo = this.cards.find(c => c.data.id === id);
        if (cardInfo) cardInfo.element.classList.remove('simple-card--selected');
    }

    clearSelection() {
        this.cards.forEach(({ element }) => element.classList.remove('simple-card--selected'));
    }

    getSelectedIds() {
        return this.cards
            .filter(({ element }) => element.classList.contains('simple-card--selected'))
            .map(({ data }) => data.id);
    }

    showEmpty(message = 'Nenhum item disponível') {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🔭</div>
                <p class="empty-state__message">${message}</p>
            </div>
        `;
    }

    showLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Carregando...</p>
            </div>
        `;
    }

    handleCardClick(item, cardElement) {
        this.emit('click', { 
            item, 
            element: cardElement,
            isSelected: cardElement.classList.contains('simple-card--selected')
        });
    }

    animateIn() {
        this.cards.forEach(({ element }, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    clear() {
        if (this.container) this.container.innerHTML = '';
        this.cards = [];
    }
}