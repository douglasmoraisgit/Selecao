/**
 * data/navigationStructure.js
 * Estrutura hierárquica de navegação do sistema de lentes
 * Arquivo principal - importa e monta todos os módulos
 * @author OptoFreela
 */

// ========================================
// PRODUTOS
// ========================================
import longe from './products/longe.js';
import perto from './products/perto.js';
import meiaDistancia from './products/meiaDistancia.js';
import bifocal from './products/bifocal.js';
import multifocal from './products/multifocal.js';
import ocupacional from './products/ocupacional.js';

// ========================================
// CONFIGURAÇÕES
// ========================================
import material from './configs/material.js';
import antiReflexo from './configs/antiReflexo.js';
import fotossensivel from './configs/fotossensivel.js';
import coloracao from './configs/coloracao.js';
import antiBlue from './configs/antiBlue.js';
import indice from './configs/indice.js';

// ========================================
// ESTRUTURA PRINCIPAL
// ========================================
const navigationStructure = {
    id: 'root',
    type: 'root',
    label: 'Sistema de Lentes',
    title: 'Escolha o Tipo de Lente',
    icon: '👓',
    children: [
        // Produtos (categorias de lentes)
        longe,
        perto,
        meiaDistancia,
        bifocal,
        multifocal,
        ocupacional,
        
        // Configurações
        material,
        antiReflexo,
        fotossensivel,
        coloracao,
        antiBlue,
        indice
    ]
};

export default navigationStructure;
