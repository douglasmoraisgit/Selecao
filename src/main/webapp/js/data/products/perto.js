/**
 * products/perto.js
 * Lentes para leitura e trabalhos de perto
 */

const perto = {
    id: 'perto',
    type: 'category',
    label: 'Perto',
    title: 'Lentes para Perto',
    icon: '📖',
    description: 'Para leitura e trabalhos de perto',
    children: [
        { id: 'perto-leitura', type: 'product', label: 'Leitura Básica', title: 'Leitura Básica', icon: '📚', description: 'Simples para leitura' },
        { id: 'perto-antiblue', type: 'product', label: 'Perto Anti-Blue', title: 'Perto Anti-Blue', icon: '🖥️', description: 'Proteção para telas próximas' },
        { id: 'perto-bifocal', type: 'product', label: 'Bifocal de Perto', title: 'Bifocal de Perto', icon: '📝', description: 'Duas zonas para perto' },
        { id: 'perto-degressive', type: 'product', label: 'Degressive', title: 'Degressive', icon: '📊', description: 'Variação suave' },
        { id: 'perto-ocupacional', type: 'product', label: 'Ocupacional', title: 'Ocupacional', icon: '💼', description: 'Para trabalho específico' }
    ]
};

export default perto;
