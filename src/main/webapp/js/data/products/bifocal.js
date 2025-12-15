/**
 * products/bifocal.js
 * Lentes bifocais - duas zonas de visão distintas
 */

const bifocal = {
    id: 'bifocal',
    type: 'category',
    label: 'Bifocal',
    title: 'Lentes Bifocais',
    icon: '👓',
    description: 'Duas zonas de visão distintas',
    children: [
        { id: 'bifocal-tradicional', type: 'product', label: 'Tradicional', title: 'Bifocal Tradicional', icon: '📏', description: 'Com linha de separação visível' },
        { id: 'bifocal-executiva', type: 'product', label: 'Executiva', title: 'Bifocal Executiva', icon: '📊', description: 'Linha horizontal completa' },
        { id: 'bifocal-semlinha', type: 'product', label: 'Sem Linha', title: 'Bifocal Sem Linha', icon: '🫥', description: 'Transição invisível' },
        { id: 'bifocal-segpequeno', type: 'product', label: 'Segmento Pequeno', title: 'Segmento Pequeno', icon: '🔍', description: 'Área de perto reduzida' },
        { id: 'bifocal-seggrande', type: 'product', label: 'Segmento Grande', title: 'Segmento Grande', icon: '📏', description: 'Área ampliada' },
        { id: 'bifocal-ultex', type: 'product', label: 'Ultex', title: 'Bifocal Ultex', icon: '💎', description: 'Material resistente' }
    ]
};

export default bifocal;
