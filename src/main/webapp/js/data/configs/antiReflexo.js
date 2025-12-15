/**
 * configs/antiReflexo.js
 * Tratamento anti-reflexo
 */

const antiReflexo = {
    id: 'antiReflexo',
    type: 'config',
    label: 'Anti-Reflexo',
    title: 'Tratamento Anti-Reflexo',
    icon: '✨',
    description: 'Tratamento anti-reflexo',
    children: [
        { id: 'ar-sem', type: 'config-option', label: 'Sem Anti-Reflexo', title: 'Sem Anti-Reflexo', icon: '⚪', description: 'Lente sem tratamento' },
        { id: 'ar-easyclean', type: 'config-option', label: 'Crizal Easy Pro', title: 'Crizal Easy Pro', icon: '🟢', description: 'Fácil limpeza' },
        { id: 'ar-rock', type: 'config-option', label: 'Crizal Rock', title: 'Crizal Rock', icon: '🪨', description: 'Extra resistente' },
        { id: 'ar-sapphire', type: 'config-option', label: 'Crizal Sapphire', title: 'Crizal Sapphire', icon: '💎', description: 'Alta performance' },
        { id: 'ar-prevencia', type: 'config-option', label: 'Prevencia', title: 'Crizal Prevencia', icon: '🛡️', description: 'Protege luz azul' },
        { id: 'ar-chrome', type: 'config-option', label: 'DuraVision Chrome', title: 'DuraVision Chrome', icon: '⚫', description: 'Zeiss Chrome' },
        { id: 'ar-silver', type: 'config-option', label: 'DuraVision Silver', title: 'DuraVision Silver', icon: '⚪', description: 'Zeiss Silver' },
        { id: 'ar-platinum', type: 'config-option', label: 'DuraVision Platinum', title: 'DuraVision Platinum', icon: '🥇', description: 'Zeiss Premium' },
        { id: 'ar-hiperclean-sha', type: 'config-option', label: 'HIPERCLEAN SHA', title: 'HIPERCLEAN SHA', icon: '🔵', description: 'Anti-reflexo básico' },
        { id: 'ar-hiperclean-dual', type: 'config-option', label: 'HIPERCLEAN DUAL+', title: 'HIPERCLEAN DUAL+', icon: '🔷', description: 'Dupla proteção' },
        { id: 'ar-hiperclean-max', type: 'config-option', label: 'HIPERCLEAN MAX+', title: 'HIPERCLEAN MAX+', icon: '🔹', description: 'Máxima proteção' },
        { id: 'ar-hiperclean-blue', type: 'config-option', label: 'HIPERCLEAN BLUE', title: 'HIPERCLEAN BLUE', icon: '💙', description: 'Proteção luz azul' },
        { id: 'ar-co-clean', type: 'config-option', label: 'C.O. CLEAN', title: 'C.O. CLEAN', icon: '🧼', description: 'Anti-reflexo econômico' }
    ]
};

export default antiReflexo;
