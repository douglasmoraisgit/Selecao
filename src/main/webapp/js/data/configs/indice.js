/**
 * configs/indice.js
 * Índice de refração - define a espessura da lente
 */

const indice = {
    id: 'indice',
    type: 'config',
    label: 'Índice de Refração',
    title: 'Índice de Refração',
    icon: '🔢',
    description: 'Define a espessura da lente',
    children: [
        { id: 'indice-150', type: 'config-option', label: '1.50', title: 'Índice 1.50', icon: '1️⃣', description: 'Padrão' },
        { id: 'indice-156', type: 'config-option', label: '1.56', title: 'Índice 1.56', icon: '2️⃣', description: 'Fino' },
        { id: 'indice-159', type: 'config-option', label: '1.59', title: 'Índice 1.59', icon: '3️⃣', description: 'Policarbonato' },
        { id: 'indice-160', type: 'config-option', label: '1.60', title: 'Índice 1.60', icon: '4️⃣', description: 'Mais fino' },
        { id: 'indice-167', type: 'config-option', label: '1.67', title: 'Índice 1.67', icon: '5️⃣', description: 'Super fino' },
        { id: 'indice-174', type: 'config-option', label: '1.74', title: 'Índice 1.74', icon: '6️⃣', description: 'Ultra fino' },
        { id: 'indice-180', type: 'config-option', label: '1.80', title: 'Índice 1.80', icon: '7️⃣', description: 'Extremamente fino' },
        { id: 'indice-190', type: 'config-option', label: '1.90', title: 'Índice 1.90', icon: '8️⃣', description: 'Máximo fino' }
    ]
};

export default indice;
