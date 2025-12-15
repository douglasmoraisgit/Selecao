/**
 * EventEmitter.js
 * Sistema de eventos para comunicação entre componentes MVC
 */

export default class EventEmitter {
    constructor() {
        this._events = {};
    }

    on(event, listener) {
        if (!this._events[event]) {
            this._events[event] = [];
        }
        this._events[event].push(listener);
        return this;
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            listener.apply(this, args);
            this.off(event, onceWrapper);
        };
        return this.on(event, onceWrapper);
    }

    off(event, listener) {
        if (!this._events[event]) return this;
        this._events[event] = this._events[event].filter(l => l !== listener);
        return this;
    }

    emit(event, ...args) {
        if (!this._events[event]) return false;
        
        this._events[event].forEach(listener => {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Erro no listener do evento '${event}':`, error);
            }
        });
        return true;
    }

    removeAllListeners(event) {
        if (event) {
            delete this._events[event];
        } else {
            this._events = {};
        }
    }
}
