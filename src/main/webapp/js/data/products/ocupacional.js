/**
 * products/ocupacional.js
 * Lentes para atividades e profissões específicas
 */

const ocupacional = {
    id: 'ocupacional',
    type: 'category',
    label: 'Ocupacional',
    title: 'Lentes Ocupacionais',
    icon: '⚒️',
    description: 'Para atividades e profissões específicas',
    children: [
        { id: 'ocup-computador', type: 'product', label: 'Computador', title: 'Ocupacional Computador', icon: '💻', description: 'Uso intensivo em telas' },
        { id: 'ocup-conducao', type: 'product', label: 'Condução', title: 'Ocupacional Condução', icon: '🚗', description: 'Para dirigir com segurança' },
        { id: 'ocup-esportes', type: 'product', label: 'Esportes', title: 'Ocupacional Esportes', icon: '⚽', description: 'Atividades físicas' },
        { id: 'ocup-trabalho', type: 'product', label: 'Trabalho', title: 'Ocupacional Trabalho', icon: '💼', description: 'Ambiente profissional' }
    ]
};

export default ocupacional;
