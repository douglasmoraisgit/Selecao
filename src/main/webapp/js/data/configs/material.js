/**
 * configs/material.js
 * Material da lente
 */

const material = {
    id: 'material',
    type: 'config',
    label: 'Material',
    title: 'Material da Lente',
    icon: '🔬',
    description: 'Escolha o material da lente',
    children: [
        {
            id: 'material-acrilico',
            type: 'config-option',
            label: 'Acrílico',
            title: 'Acrílico',
            icon: '💎',
            description: 'Material acrílico (leve e resistente)',
            children: [
                { id: 'acrilico-150', type: 'config-value', label: '1.50', title: 'Índice 1.50', icon: '1️⃣', description: 'Padrão' },
                { id: 'acrilico-156', type: 'config-value', label: '1.56', title: 'Índice 1.56', icon: '2️⃣', description: 'Fino' },
                { id: 'acrilico-160', type: 'config-value', label: '1.60', title: 'Índice 1.60', icon: '3️⃣', description: 'Mais fino' },
                { id: 'acrilico-167', type: 'config-value', label: '1.67', title: 'Índice 1.67', icon: '4️⃣', description: 'Super fino' }
            ]
        },
        {
            id: 'material-policarbonato',
            type: 'config-option',
            label: 'Policarbonato',
            title: 'Policarbonato',
            icon: '🛡️',
            description: 'Resistente a impactos',
            children: [
                { id: 'poli-159', type: 'config-value', label: '1.59', title: 'Índice 1.59', icon: '1️⃣', description: 'Alta resistência' }
            ]
        },
        { id: 'material-trivex', type: 'config-option', label: 'Trivex', title: 'Trivex', icon: '⭐', description: 'Leve e resistente' },
        { id: 'material-cristal', type: 'config-option', label: 'Cristal', title: 'Cristal', icon: '💠', description: 'Óptica superior' },
        { id: 'material-orma', type: 'config-option', label: 'Orma', title: 'Orma CR-39', icon: '🔵', description: 'Resina CR-39' },
        { id: 'material-airwear', type: 'config-option', label: 'Airwear', title: 'Airwear', icon: '🌪️', description: 'Policarbonato Essilor' }
    ]
};

export default material;
