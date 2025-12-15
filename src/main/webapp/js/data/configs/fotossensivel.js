/**
 * configs/fotossensivel.js
 * Lentes fotossensíveis - escurecem automaticamente ao sol
 */

const fotossensivel = {
    id: 'fotossensivel',
    type: 'config',
    label: 'Fotossensível',
    title: 'Lentes Fotossensíveis',
    icon: '🌞',
    description: 'Lentes que escurecem automaticamente ao sol',
    children: [
        { id: 'foto-sem', type: 'config-option', label: 'Sem Fotossensível', title: 'Sem Fotossensível', icon: '⚪', description: 'Lente clara' },
        { id: 'foto-trans-cinza', type: 'config-option', label: 'Transitions Cinza', title: 'Transitions Cinza', icon: '⚫', description: 'Cinza clássico' },
        { id: 'foto-trans-marrom', type: 'config-option', label: 'Transitions Marrom', title: 'Transitions Marrom', icon: '🟤', description: 'Marrom elegante' },
        { id: 'foto-trans-verde', type: 'config-option', label: 'Transitions Verde', title: 'Transitions Verde', icon: '🟢', description: 'Verde natural' },
        { id: 'foto-trans-ambar', type: 'config-option', label: 'Transitions Âmbar', title: 'Transitions Âmbar', icon: '🟠', description: 'Âmbar contraste' },
        { id: 'foto-trans-esmeralda', type: 'config-option', label: 'Transitions Esmeralda', title: 'Transitions Esmeralda', icon: '💚', description: 'Verde esmeralda' },
        { id: 'foto-pf-cinza', type: 'config-option', label: 'PhotoFusionX Cinza', title: 'PhotoFusionX Cinza', icon: '⚫', description: 'Zeiss Cinza' },
        { id: 'foto-pf-extradark', type: 'config-option', label: 'PhotoFusionX ExtraDark', title: 'PhotoFusionX ExtraDark', icon: '⬛', description: 'Zeiss Extra Escuro' }
    ]
};

export default fotossensivel;
