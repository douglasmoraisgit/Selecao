/**
 * products/meiaDistancia.js
 * Lentes para visão intermediária e trabalho
 */

const meiaDistancia = {
    id: 'meia-distancia',
    type: 'category',
    label: 'Meia Distância',
    title: 'Lentes para Meia Distância',
    icon: '💻',
    description: 'Para visão intermediária e trabalho',
    children: [
        { id: 'meia-intermediaria', type: 'product', label: 'Intermediária', title: 'Intermediária', icon: '🎯', description: 'Para distâncias médias' },
        { id: 'meia-escritorio', type: 'product', label: 'Escritório', title: 'Escritório', icon: '🏢', description: 'Ambiente de trabalho' },
        { id: 'meia-computador', type: 'product', label: 'Computador Plus', title: 'Computador Plus', icon: '🖥️', description: 'Telas e documentos' },
        { id: 'meia-degressive', type: 'product', label: 'Degressive', title: 'Degressive', icon: '🌊', description: 'Transição suave de foco' },
        { id: 'meia-antifadiga', type: 'product', label: 'Anti-Fadiga', title: 'Anti-Fadiga', icon: '😌', description: 'Conforto prolongado' }
    ]
};

export default meiaDistancia;
