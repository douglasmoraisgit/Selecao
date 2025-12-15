/**
 * configs/coloracao.js
 * Coloração de lentes - cores sólidas e degradê
 * 
 * IMPORTANTE: Os labels devem corresponder EXATAMENTE ao campo 'nome' da tabela coloracao
 */

const coloracao = {
    id: 'coloracao',
    type: 'config',
    label: 'Coloração',
    title: 'Coloração de Lentes',
    icon: '🎨',
    description: 'Cores para lentes solares e fashion',
    children: [
        // ========================================
        // SEM COLORAÇÃO
        // ========================================
        { id: 'cor-sem', type: 'config-option', label: 'Sem Coloração', title: 'Sem Coloração', icon: '⚪', description: 'Lente transparente' },
        
        // ========================================
        // TOTAL (Cor sólida) - R$ 80,00
        // Labels correspondem à tabela: Cinza I, Cinza II, G15, etc.
        // ========================================
        {
            id: 'cor-total',
            type: 'config-group',
            label: 'Total (Sólida)',
            title: 'Coloração Total',
            icon: '🔵',
            description: 'Cor sólida uniforme - R$ 80,00',
            children: [
                // Cinza
                { id: 'total-cinza-i', type: 'config-option', label: 'Cinza I', title: 'Cinza I', icon: '⚫', corHex: '#C8C8D4', corImagem: 'img/coloracao/CINZA_I.png', description: 'Cinza claro' },
                { id: 'total-cinza-ii', type: 'config-option', label: 'Cinza II', title: 'Cinza II', icon: '⚫', corHex: '#9898A8', corImagem: 'img/coloracao/CINZA_II.png', description: 'Cinza médio' },
                { id: 'total-cinza-iii', type: 'config-option', label: 'Cinza III', title: 'Cinza III', icon: '⚫', corHex: '#686878', corImagem: 'img/coloracao/CINZA_III.png', description: 'Cinza escuro' },
                { id: 'total-cinza-black', type: 'config-option', label: 'Cinza Black', title: 'Cinza Black', icon: '⬛', corHex: '#2A2A3A', corImagem: 'img/coloracao/CINZA_BLACK.png', description: 'Cinza extra escuro' },
                
                // Verde
                { id: 'total-verde-i', type: 'config-option', label: 'Verde I', title: 'Verde I', icon: '🟢', corHex: '#C8D4C8', corImagem: 'img/coloracao/VERDE_I.png', description: 'Verde claro' },
                { id: 'total-verde-ii', type: 'config-option', label: 'Verde II', title: 'Verde II', icon: '🟢', corHex: '#7A9878', corImagem: 'img/coloracao/VERDE_II.png', description: 'Verde médio' },
                { id: 'total-verde-iii', type: 'config-option', label: 'Verde III', title: 'Verde III', icon: '🟢', corHex: '#4A6848', corImagem: 'img/coloracao/VERDE_III.png', description: 'Verde escuro' },
                { id: 'total-g15', type: 'config-option', label: 'G15', title: 'G15', icon: '🟢', corHex: '#1A3A28', corImagem: 'img/coloracao/G15.png', description: 'Verde G15 clássico' },
                
                // Marrom
                { id: 'total-marrom-i', type: 'config-option', label: 'Marrom I', title: 'Marrom I', icon: '🟤', corHex: '#D4C8B8', corImagem: 'img/coloracao/MARROM_I.png', description: 'Marrom claro' },
                { id: 'total-marrom-ii', type: 'config-option', label: 'Marrom II', title: 'Marrom II', icon: '🟤', corHex: '#B8986A', corImagem: 'img/coloracao/MARROM_II.png', description: 'Marrom médio' },
                { id: 'total-marrom-iii', type: 'config-option', label: 'Marrom III', title: 'Marrom III', icon: '🟤', corHex: '#8B6914', corImagem: 'img/coloracao/MARROM_III.png', description: 'Marrom escuro' },
                { id: 'total-marrom-dark', type: 'config-option', label: 'Marrom Dark', title: 'Marrom Dark', icon: '🟤', corHex: '#3A2A1A', corImagem: 'img/coloracao/MARROM_DARK.png', description: 'Marrom extra escuro' },
                
                // Ultra Marine
                { id: 'total-ultramarine-i', type: 'config-option', label: 'Ultra Marine I', title: 'Ultra Marine I', icon: '💙', corHex: '#B8C8E8', description: 'Azul claro' },
                { id: 'total-ultramarine-ii', type: 'config-option', label: 'Ultra Marine II', title: 'Ultra Marine II', icon: '💙', corHex: '#5878B8', description: 'Azul médio' },
                { id: 'total-ultramarine-iii', type: 'config-option', label: 'Ultra Marine III', title: 'Ultra Marine III', icon: '💙', corHex: '#1848A8', description: 'Azul escuro' },
                
                // Pink
                { id: 'total-pink-i', type: 'config-option', label: 'Pink I', title: 'Pink I', icon: '💗', corHex: '#F8D8E8', description: 'Rosa claro' },
                { id: 'total-pink-ii', type: 'config-option', label: 'Pink II', title: 'Pink II', icon: '💗', corHex: '#E898B8', description: 'Rosa médio' },
                { id: 'total-pink-iii', type: 'config-option', label: 'Pink III', title: 'Pink III', icon: '💗', corHex: '#D81878', description: 'Rosa escuro' },
                
                // Laranja
                { id: 'total-laranja-i', type: 'config-option', label: 'Laranja I', title: 'Laranja I', icon: '🟠', corHex: '#E8B898', description: 'Laranja claro' },
                { id: 'total-laranja-ii', type: 'config-option', label: 'Laranja II', title: 'Laranja II', icon: '🟠', corHex: '#D87848', description: 'Laranja médio' },
                { id: 'total-laranja-iii', type: 'config-option', label: 'Laranja III', title: 'Laranja III', icon: '🟠', corHex: '#C84818', description: 'Laranja escuro' },
                
                // Kalicrome
                { id: 'total-kalicrome', type: 'config-option', label: 'Kalicrome', title: 'Kalicrome', icon: '🪙', corHex: '#E8D818', description: 'Dourado espelhado' }
            ]
        },
        
        // ========================================
        // DEGRADÊ - R$ 100,00
        // Labels correspondem à tabela: Cinza Degradê I, G15 Degradê, etc.
        // ========================================
        {
            id: 'cor-degrade',
            type: 'config-group',
            label: 'Degradê',
            title: 'Coloração Degradê',
            icon: '🌅',
            description: 'Gradiente claro para escuro - R$ 100,00',
            children: [
                // Cinza Degradê
                { id: 'degrade-cinza-i', type: 'config-option', label: 'Cinza Degradê I', title: 'Cinza Degradê I', icon: '⚫', corHex: '#C8C8D4', corImagem: 'img/coloracao/CINZA_I.png', description: 'Cinza claro degradê' },
                { id: 'degrade-cinza-ii', type: 'config-option', label: 'Cinza Degradê II', title: 'Cinza Degradê II', icon: '⚫', corHex: '#9898A8', corImagem: 'img/coloracao/CINZA_II.png', description: 'Cinza médio degradê' },
                { id: 'degrade-cinza-iii', type: 'config-option', label: 'Cinza Degradê III', title: 'Cinza Degradê III', icon: '⚫', corHex: '#686878', corImagem: 'img/coloracao/CINZA_III.png', description: 'Cinza escuro degradê' },
                { id: 'degrade-cinza-black', type: 'config-option', label: 'Cinza Black Degradê', title: 'Cinza Black Degradê', icon: '⬛', corHex: '#2A2A3A', corImagem: 'img/coloracao/CINZA_BLACK.png', description: 'Cinza extra escuro degradê' },
                
                // Verde Degradê
                { id: 'degrade-verde-i', type: 'config-option', label: 'Verde Degradê I', title: 'Verde Degradê I', icon: '🟢', corHex: '#C8D4C8', corImagem: 'img/coloracao/VERDE_I.png', description: 'Verde claro degradê' },
                { id: 'degrade-verde-ii', type: 'config-option', label: 'Verde Degradê II', title: 'Verde Degradê II', icon: '🟢', corHex: '#7A9878', corImagem: 'img/coloracao/VERDE_II.png', description: 'Verde médio degradê' },
                { id: 'degrade-verde-iii', type: 'config-option', label: 'Verde Degradê III', title: 'Verde Degradê III', icon: '🟢', corHex: '#4A6848', corImagem: 'img/coloracao/VERDE_III.png', description: 'Verde escuro degradê' },
                { id: 'degrade-g15', type: 'config-option', label: 'G15 Degradê', title: 'G15 Degradê', icon: '🟢', corHex: '#1A3A28', corImagem: 'img/coloracao/G15.png', description: 'Verde G15 degradê' },
                
                // Marrom Degradê
                { id: 'degrade-marrom-i', type: 'config-option', label: 'Marrom Degradê I', title: 'Marrom Degradê I', icon: '🟤', corHex: '#D4C8B8', corImagem: 'img/coloracao/MARROM_I.png', description: 'Marrom claro degradê' },
                { id: 'degrade-marrom-ii', type: 'config-option', label: 'Marrom Degradê II', title: 'Marrom Degradê II', icon: '🟤', corHex: '#B8986A', corImagem: 'img/coloracao/MARROM_II.png', description: 'Marrom médio degradê' },
                { id: 'degrade-marrom-iii', type: 'config-option', label: 'Marrom Degradê III', title: 'Marrom Degradê III', icon: '🟤', corHex: '#8B6914', corImagem: 'img/coloracao/MARROM_III.png', description: 'Marrom escuro degradê' },
                { id: 'degrade-marrom-dark', type: 'config-option', label: 'Marrom Dark Degradê', title: 'Marrom Dark Degradê', icon: '🟤', corHex: '#3A2A1A', corImagem: 'img/coloracao/MARROM_DARK.png', description: 'Marrom extra escuro degradê' },
                
                // Ultra Marine Degradê (só II e III na tabela)
                { id: 'degrade-ultramarine-ii', type: 'config-option', label: 'Ultra Marine Degradê II', title: 'Ultra Marine Degradê II', icon: '💙', corHex: '#5878B8', description: 'Azul médio degradê' },
                { id: 'degrade-ultramarine-iii', type: 'config-option', label: 'Ultra Marine Degradê III', title: 'Ultra Marine Degradê III', icon: '💙', corHex: '#1848A8', description: 'Azul escuro degradê' },
                
                // Pink Degradê (só II e III na tabela)
                { id: 'degrade-pink-ii', type: 'config-option', label: 'Pink Degradê II', title: 'Pink Degradê II', icon: '💗', corHex: '#E898B8', description: 'Rosa médio degradê' },
                { id: 'degrade-pink-iii', type: 'config-option', label: 'Pink Degradê III', title: 'Pink Degradê III', icon: '💗', corHex: '#D81878', description: 'Rosa escuro degradê' },
                
                // Laranja Degradê (só II e III na tabela)
                { id: 'degrade-laranja-ii', type: 'config-option', label: 'Laranja Degradê II', title: 'Laranja Degradê II', icon: '🟠', corHex: '#D87848', description: 'Laranja médio degradê' },
                { id: 'degrade-laranja-iii', type: 'config-option', label: 'Laranja Degradê III', title: 'Laranja Degradê III', icon: '🟠', corHex: '#C84818', description: 'Laranja escuro degradê' }
            ]
        }
    ]
};

export default coloracao;