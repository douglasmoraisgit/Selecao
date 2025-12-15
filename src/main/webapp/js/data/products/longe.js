/**
 * products/longe.js
 * Lentes para visão à distância
 */

const longe = {
    id: 'longe',
    type: 'category',
    label: 'Longe',
    title: 'Lentes para Longe',
    icon: '🔭',
    description: 'Lentes para visão à distância',
    children: [
        // Filtros Rápidos
        {
            id: 'longe-filtros',
            type: 'subcategory',
            label: 'Filtros Rápidos',
            title: 'Filtros Rápidos',
            icon: '⚡',
            description: 'Encontre a lente ideal por característica específica',
            children: [
                {
                    id: 'longe-criancas',
                    type: 'filter',
                    label: 'Para Crianças/Miopia',
                    title: 'Controle de Miopia',
                    icon: '👶',
                    description: 'Controle de miopia infantil',
                    children: [
                        { id: 'myocare', type: 'product', label: 'MyoCare', title: 'Zeiss MyoCare', icon: '👦', description: 'Controle de miopia' },
                        { id: 'myocare-s', type: 'product', label: 'MyoCare S', title: 'Zeiss MyoCare S', icon: '👧', description: 'Controle avançado' },
                        { id: 'myosmart', type: 'product', label: 'MyoSmart', title: 'Hoya MyoSmart', icon: '👶', description: 'Tecnologia D.I.M.S.' }
                    ]
                },
                {
                    id: 'longe-dirigir',
                    type: 'filter',
                    label: 'Para Dirigir',
                    title: 'Para Dirigir',
                    icon: '🚗',
                    description: 'Otimizadas para direção',
                    children: [
                        { id: 'drivesafe-ind', type: 'product', label: 'DriveSafe Individual', title: 'Zeiss DriveSafe', icon: '🚗', description: 'Visão noturna' }
                    ]
                },
                {
                    id: 'longe-esportes',
                    type: 'filter',
                    label: 'Para Esportes',
                    title: 'Para Esportes',
                    icon: '⚽',
                    description: 'Alta performance esportiva',
                    children: [
                        { id: 'individual-sport', type: 'product', label: 'Individual SPORT', title: 'Zeiss Sport', icon: '⚽', description: 'Visão dinâmica' }
                    ]
                },
                {
                    id: 'longe-digital',
                    type: 'filter',
                    label: 'Digital/Telas',
                    title: 'Digital/Telas',
                    icon: '📱',
                    description: 'Proteção para uso digital',
                    children: [
                        { id: 'eyzen', type: 'product', label: 'EYZEN', title: 'Essilor EYZEN', icon: '👁️', description: 'Anti-fadiga digital' },
                        { id: 'energizeme', type: 'product', label: 'EnergizeMe', title: 'Zeiss EnergizeMe', icon: '⚡', description: 'Energia visual' },
                        { id: 'smartlife-young', type: 'product', label: 'SmartLife Young', title: 'Zeiss SmartLife Young', icon: '🧒', description: 'Para jovens' }
                    ]
                },
                {
                    id: 'longe-premium',
                    type: 'filter',
                    label: 'Premium/High-End',
                    title: 'Premium/High-End',
                    icon: '⭐',
                    description: 'Máxima qualidade ótica',
                    children: [
                        { id: 'smartlife-ind3', type: 'product', label: 'SMARTLIFE Ind. 3', title: 'Zeiss SmartLife Individual 3', icon: '📱', description: 'Top de linha' },
                        { id: 'mineral-tital', type: 'product', label: 'Mineral Tital', title: 'Zeiss Mineral Tital', icon: '💎', description: 'Cristal premium' },
                        { id: 'mineral-lantal', type: 'product', label: 'Mineral Lantal', title: 'Zeiss Mineral Lantal', icon: '💎', description: 'Alta refração' },
                        { id: 'stilys', type: 'product', label: 'STILYS', title: 'Essilor STILYS', icon: '✨', description: 'Design avançado' }
                    ]
                },
                {
                    id: 'longe-economico',
                    type: 'filter',
                    label: 'Econômico/Entrada',
                    title: 'Econômico/Entrada',
                    icon: '💰',
                    description: 'Melhor custo-benefício',
                    children: [
                        { id: 'orma', type: 'product', label: 'ORMA', title: 'ORMA', icon: '📱', description: 'Básica e confiável' },
                        { id: 'kodak-intro', type: 'product', label: 'KODAK INTRO', title: 'Kodak Intro', icon: '🌟', description: 'Entrada' },
                        { id: 'light2', type: 'product', label: 'Light 2', title: 'Zeiss Light 2', icon: '💡', description: 'Básica Zeiss' },
                        { id: 'hilux', type: 'product', label: 'Hilux', title: 'Hoya Hilux', icon: '✨', description: 'Econômica Hoya' }
                    ]
                }
            ]
        },
        // Por Marca
        {
            id: 'longe-marcas',
            type: 'subcategory',
            label: 'Por Marca',
            title: 'Por Marca',
            icon: '🏢',
            description: 'Navegue por fabricante',
            children: [
                {
                    id: 'longe-essilor',
                    type: 'brand',
                    label: 'Essilor',
                    title: 'Essilor - Longe',
                    icon: '🏢',
                    description: 'Família Essilor',
                    children: [
                        { id: 'essilor-orma', type: 'product', label: 'ORMA', title: 'ORMA', icon: '📱', description: 'Básica' },
                        { id: 'essilor-airwear', type: 'product', label: 'AIRWEAR', title: 'Essilor AIRWEAR', icon: '💨', description: 'Policarbonato' },
                        { id: 'essilor-stilys', type: 'product', label: 'STILYS', title: 'Essilor STILYS', icon: '✨', description: 'Premium' },
                        { id: 'essilor-eyzen', type: 'product', label: 'EYZEN', title: 'Essilor EYZEN', icon: '👁️', description: 'Anti-fadiga' }
                    ]
                },
                {
                    id: 'longe-kodak',
                    type: 'brand',
                    label: 'Kodak',
                    title: 'Kodak - Longe',
                    icon: '📷',
                    description: 'Família Kodak',
                    children: [
                        { id: 'kodak-intro', type: 'product', label: 'KODAK INTRO', title: 'Kodak Intro', icon: '🌟', description: 'Entrada' },
                        { id: 'kodak-city', type: 'product', label: 'KODAK CITY', title: 'Kodak City', icon: '🏙️', description: 'Urbano' }
                    ]
                },
                {
                    id: 'longe-zeiss',
                    type: 'brand',
                    label: 'Zeiss',
                    title: 'Zeiss - Longe',
                    icon: '🔬',
                    description: 'Família Zeiss',
                    children: [
                        { id: 'zeiss-clearview', type: 'product', label: 'ClearView', title: 'Zeiss ClearView', icon: '👓', description: 'Visão clara' },
                        { id: 'zeiss-classic', type: 'product', label: 'CLASSIC PLUS', title: 'Zeiss Classic Plus', icon: '⭐', description: 'Clássica' },
                        { id: 'zeiss-smartlife', type: 'product', label: 'SmartLife', title: 'Zeiss SmartLife', icon: '📱', description: 'Vida moderna' },
                        { id: 'zeiss-myocare', type: 'product', label: 'MyoCare', title: 'Zeiss MyoCare', icon: '👦', description: 'Controle miopia' },
                        { id: 'zeiss-light2', type: 'product', label: 'Light 2', title: 'Zeiss Light 2', icon: '💡', description: 'Leve' },
                        { id: 'zeiss-drivesafe', type: 'product', label: 'DriveSafe', title: 'Zeiss DriveSafe', icon: '🚗', description: 'Para dirigir' },
                        { id: 'zeiss-sport', type: 'product', label: 'Individual SPORT', title: 'Zeiss Sport', icon: '⚽', description: 'Esportes' }
                    ]
                },
                {
                    id: 'longe-hoya',
                    type: 'brand',
                    label: 'Hoya',
                    title: 'Hoya - Longe',
                    icon: '🏢',
                    description: 'Família Hoya',
                    children: [
                        { id: 'hoya-hilux', type: 'product', label: 'Hilux', title: 'Hoya Hilux', icon: '✨', description: 'Econômica' },
                        { id: 'hoya-nulux', type: 'product', label: 'Nulux', title: 'Hoya Nulux', icon: '🌟', description: 'Premium' },
                        { id: 'hoya-myosmart', type: 'product', label: 'MyoSmart', title: 'Hoya MyoSmart', icon: '👶', description: 'Controle miopia' }
                    ]
                }
            ]
        }
    ]
};

export default longe;
