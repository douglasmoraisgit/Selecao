/**
 * configs/antiBlue.js
 * Proteção contra luz azul de telas
 */

const antiBlue = {
    id: 'antiBlue',
    type: 'config',
    label: 'Anti-Blue',
    title: 'Proteção Luz Azul',
    icon: '💙',
    description: 'Proteção contra luz azul de telas',
    children: [
        { id: 'blue-sem', type: 'config-option', label: 'Sem Anti-Blue', title: 'Sem Anti-Blue', icon: '⚪', description: 'Sem proteção luz azul' },
        { id: 'blue-basico', type: 'config-option', label: 'Anti-Blue Básico', title: 'Anti-Blue Básico', icon: '💙', description: 'Proteção básica' },
        { id: 'blue-premium', type: 'config-option', label: 'Blue Cut Premium', title: 'Blue Cut Premium', icon: '🛡️', description: 'Proteção avançada' }
    ]
};

export default antiBlue;
