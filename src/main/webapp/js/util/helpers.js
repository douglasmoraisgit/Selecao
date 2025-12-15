/**
 * helpers.js
 * Funções utilitárias do sistema
 */

// DOM Helpers
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

export function createElement(tag, attrs = {}, content = null) {
    const el = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });

    if (content) {
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else if (content instanceof Element) {
            el.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(c => {
                if (c instanceof Element) el.appendChild(c);
            });
        }
    }

    return el;
}

// String Helpers
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugify(str) {
    return removeAccents(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export function truncate(str, length) {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// Formatação
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

export function formatDate(date, format = 'short') {
    const d = date instanceof Date ? date : new Date(date);
    
    const options = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { day: '2-digit', month: 'long', year: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        full: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return d.toLocaleDateString('pt-BR', options[format] || options.short);
}

// Debounce / Throttle
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Storage
export function storageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
    }
}

export function storageGet(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn('Erro ao ler localStorage:', e);
        return defaultValue;
    }
}

export function storageRemove(key) {
    localStorage.removeItem(key);
}

// Validação
export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

export function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// Viewport
export function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

export function isMobile() {
    return window.innerWidth <= 768;
}

export function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

// Export default como objeto (opcional)
export default {
    $, $$, createElement,
    capitalize, removeAccents, slugify, truncate,
    formatCurrency, formatDate,
    debounce, throttle,
    storageSet, storageGet, storageRemove,
    isEmpty, isNumber,
    setViewportHeight, isMobile, isTablet
};
