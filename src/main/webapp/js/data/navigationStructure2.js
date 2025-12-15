/**
 * data/navigationStructure.js
 * Estrutura hierárquica de navegação do sistema de lentes
 * Baseado no lensData com estrutura completa
 * @author OptoFreela
 */

const navigationStructure = {
    id: 'root',
    type: 'root',
    label: 'Sistema de Lentes',
    title: 'Escolha o Tipo de Lente',
    icon: '👓',
    children: [
        // ========================================
        // 🔭 LONGE
        // ========================================
        {
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
        },

        // ========================================
        // 📖 PERTO
        // ========================================
        {
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
        },

        // ========================================
        // 💻 MEIA DISTÂNCIA
        // ========================================
        {
            id: 'meia-distancia',
            type: 'category',
            label: 'Meia Distância',
            title: 'Lentes para Meia Distância',
            icon: '💻',
            description: 'Para visão intermediária e trabalho',
            children: [
                { id: 'meia-intermediaria', type: 'product', label: 'Intermediária', title: 'Intermediária', icon: '🎯', description: 'Para distâncias médias' },
                { id: 'meia-escritorio', type: 'product', label: 'Escritório', title: 'Escritório', icon: '🏢', description: 'Ambiente de trabalho' },
                { id: 'meia-computador', type: 'product', label: 'Computador Plus', title: 'Computador Plus', icon: '🖥️', description: 'Telas e documentos' },
                { id: 'meia-degressive', type: 'product', label: 'Degressive', title: 'Degressive', icon: '🌊', description: 'Transição suave de foco' },
                { id: 'meia-antifadiga', type: 'product', label: 'Anti-Fadiga', title: 'Anti-Fadiga', icon: '😌', description: 'Conforto prolongado' }
            ]
        },

        // ========================================
        // 👓 BIFOCAL
        // ========================================
        {
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
        },

        // ========================================
        // 🎭 MULTIFOCAL
        // ========================================
        {
            id: 'multifocal',
            type: 'category',
            label: 'Multifocal',
            title: 'Lentes Multifocais',
            icon: '🎭',
            description: 'Múltiplas distâncias em uma única lente',
            children: [
                // Varilux
                {
                    id: 'varilux',
                    type: 'brand',
                    label: 'Varilux',
                    title: 'Família Varilux',
                    icon: '🌈',
                    description: 'Essilor Varilux',
                    children: [
                        { id: 'varilux-comfort-max', type: 'product', label: 'Comfort Max', title: 'Varilux Comfort Max', icon: '📱', description: 'Conforto máximo' },
                        { id: 'varilux-liberty30', type: 'product', label: 'Liberty 3.0', title: 'Varilux Liberty 3.0', icon: '🎨', description: 'Nova geração' },
                        { id: 'varilux-liberty', type: 'product', label: 'Liberty', title: 'Varilux Liberty', icon: '🎨', description: 'Versátil' },
                        { id: 'varilux-physio', type: 'product', label: 'Physio', title: 'Varilux Physio', icon: '👤', description: 'Natural' }
                    ]
                },
                // Zeiss Multifocal
                {
                    id: 'zeiss-multi',
                    type: 'brand',
                    label: 'Zeiss',
                    title: 'Família Zeiss Multifocal',
                    icon: '🎪',
                    description: 'Zeiss Progressivas',
                    children: [
                        { id: 'zeiss-smartlife-ind3', type: 'product', label: 'SmartLife Individual 3', title: 'Zeiss SmartLife Individual 3', icon: '📱', description: 'Top personalizado' },
                        { id: 'zeiss-ind-drivesafe', type: 'product', label: 'Individual DriveSafe', title: 'Zeiss Individual DriveSafe', icon: '🚗', description: 'Para dirigir' },
                        { id: 'zeiss-ind-sport', type: 'product', label: 'Individual Sport', title: 'Zeiss Individual Sport', icon: '⚽', description: 'Esportivo' },
                        { id: 'zeiss-smartlife-superb', type: 'product', label: 'SmartLife Superb', title: 'Zeiss SmartLife Superb', icon: '⭐', description: 'Excepcional' },
                        { id: 'zeiss-smartlife-plus', type: 'product', label: 'SmartLife Plus', title: 'Zeiss SmartLife Plus', icon: '📱', description: 'Avançado' },
                        { id: 'zeiss-smartlife-pure', type: 'product', label: 'SmartLife Pure', title: 'Zeiss SmartLife Pure', icon: '💎', description: 'Puro' },
                        { id: 'zeiss-smartlife-ess', type: 'product', label: 'SmartLife Essencial', title: 'Zeiss SmartLife Essencial', icon: '📱', description: 'Essencial' },
                        { id: 'zeiss-light2-3dv', type: 'product', label: 'Light 2 3Dv', title: 'Zeiss Light 2 3Dv', icon: '📱', description: '3D vertical' },
                        { id: 'zeiss-light2-3d', type: 'product', label: 'Light 2 3D', title: 'Zeiss Light 2 3D', icon: '📱', description: '3D completo' },
                        { id: 'zeiss-light2-d', type: 'product', label: 'Light 2 D', title: 'Zeiss Light 2 D', icon: '📱', description: 'Digital' },
                        { id: 'zeiss-gt2', type: 'product', label: 'GT2', title: 'Zeiss GT2', icon: '📱', description: 'Performance' },
                        { id: 'zeiss-classicplus', type: 'product', label: 'ClassicPlus', title: 'Zeiss ClassicPlus', icon: '📱', description: 'Clássico' }
                    ]
                },
                // Hoya Multifocal
                {
                    id: 'hoya-multi',
                    type: 'brand',
                    label: 'Hoya',
                    title: 'Família Hoya Multifocal',
                    icon: '👑',
                    description: 'Hoya Progressivas',
                    children: [
                        { id: 'hoyalux-myself', type: 'product', label: 'iD MySelf', title: 'Hoyalux iD MySelf', icon: '📱', description: 'Personalizado' },
                        { id: 'hoyalux-mystyle', type: 'product', label: 'iD MyStyle V+', title: 'Hoyalux iD MyStyle V+', icon: '📱', description: 'Seu estilo' },
                        { id: 'hoyalux-lifestyle4i', type: 'product', label: 'iD LifeStyle 4i', title: 'Hoyalux iD LifeStyle 4i', icon: '📱', description: 'Estilo de vida' },
                        { id: 'hoyalux-lifestyle4', type: 'product', label: 'iD LifeStyle 4', title: 'Hoyalux iD LifeStyle 4', icon: '📱', description: 'Lifestyle' },
                        { id: 'hoyalux-balansis', type: 'product', label: 'Balansis', title: 'Hoyalux Balansis', icon: '📱', description: 'Equilíbrio' },
                        { id: 'hoyalux-daynamic', type: 'product', label: 'Daynamic', title: 'Hoyalux Daynamic', icon: '📱', description: 'Dinâmico' },
                        { id: 'hoya-argos', type: 'product', label: 'Argos', title: 'Hoya Argos', icon: '📱', description: 'Versátil' },
                        { id: 'hoya-amplus', type: 'product', label: 'Amplus', title: 'Hoya Amplus', icon: '📱', description: 'Amplo' },
                        { id: 'hoya-amplitude', type: 'product', label: 'Amplitude', title: 'Hoya Amplitude', icon: '📱', description: 'Amplitude visual' },
                        { id: 'hoya-maxxee', type: 'product', label: 'Maxxee Progressive', title: 'Hoya Maxxee Progressive', icon: '📱', description: 'Progressiva' }
                    ]
                },
                // Ultra
           // Adicionar seção para Ultra no multifocal
{
    id: 'multi-ultra',
    type: 'brand',
    label: 'Ultra',
    title: 'Ultra - Multifocal',
    icon: '🏢',
    description: 'Família Ultra',
    children: [
        { id: 'ultra-hd', type: 'product', label: 'Ultra HD', title: 'Ultra HD', icon: '💡', marca: 'Ultra HD', familia: 'Ultra' },
        { id: 'ultra-max-hd', type: 'product', label: 'Ultra Max HD', title: 'Ultra Max HD', icon: '⭐', marca: 'Ultra Max HD', familia: 'Ultra' }
    ]
},
                // Multi C.O.
                {
                    id: 'multico-multi',
                    type: 'brand',
                    label: 'Multi C.O.',
                    title: 'Família Multi C.O.',
                    icon: '😌',
                    description: 'Multi C.O. Progressivas',
                    children: [
                        { id: 'multico-basico', type: 'product', label: 'Multi C.O.', title: 'Multi C.O. básico', icon: '📱', description: 'Básico' },
                        { id: 'multico-prohd', type: 'product', label: 'Multi C.O. PRO HD', title: 'Multi C.O. PRO HD', icon: '⭐', description: 'Pro HD' },
                        { id: 'multico-select', type: 'product', label: 'Multi C.O. Select', title: 'Multi C.O. Select', icon: '💎', description: 'Select' }
                    ]
                },
                // Optwiss
                { id: 'optwiss', type: 'product', label: 'Optwiss', title: 'Optwiss', icon: '🌐', description: 'Campo visual amplo' }
            ]
        },

        // ========================================
        // ⚒️ OCUPACIONAL
        // ========================================
        {
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
        },

        // ========================================
        // ⚙️ CONFIGURAÇÕES
        // ========================================
        
        // 🔬 MATERIAL
        {
            id: 'material',
            type: 'config',
            label: 'Material',
            title: 'Material da Lente',
            icon: '🔬',
            description: 'Escolha o material da lente',
            children: [
                {
                    id: 'material-acrilico',
                    type: 'config-option',
                    label: 'Acrílico',
                    title: 'Acrílico',
                    icon: '💎',
                    description: 'Material acrílico (leve e resistente)',
                    children: [
                        { id: 'acrilico-150', type: 'config-value', label: '1.50', title: 'Índice 1.50', icon: '1️⃣', description: 'Padrão' },
                        { id: 'acrilico-156', type: 'config-value', label: '1.56', title: 'Índice 1.56', icon: '2️⃣', description: 'Fino' },
                        { id: 'acrilico-160', type: 'config-value', label: '1.60', title: 'Índice 1.60', icon: '3️⃣', description: 'Mais fino' },
                        { id: 'acrilico-167', type: 'config-value', label: '1.67', title: 'Índice 1.67', icon: '4️⃣', description: 'Super fino' }
                    ]
                },
                {
                    id: 'material-policarbonato',
                    type: 'config-option',
                    label: 'Policarbonato',
                    title: 'Policarbonato',
                    icon: '🛡️',
                    description: 'Resistente a impactos',
                    children: [
                        { id: 'poli-159', type: 'config-value', label: '1.59', title: 'Índice 1.59', icon: '1️⃣', description: 'Alta resistência' }
                    ]
                },
                { id: 'material-trivex', type: 'config-option', label: 'Trivex', title: 'Trivex', icon: '⭐', description: 'Leve e resistente' },
                { id: 'material-cristal', type: 'config-option', label: 'Cristal', title: 'Cristal', icon: '💠', description: 'Óptica superior' },
                { id: 'material-orma', type: 'config-option', label: 'Orma', title: 'Orma CR-39', icon: '🔵', description: 'Resina CR-39' },
                { id: 'material-airwear', type: 'config-option', label: 'Airwear', title: 'Airwear', icon: '🌪️', description: 'Policarbonato Essilor' }
            ]
        },

        // ✨ ANTI-REFLEXO
        {
            id: 'antiReflexo',
            type: 'config',
            label: 'Anti-Reflexo',
            title: 'Tratamento Anti-Reflexo',
            icon: '✨',
            description: 'Tratamento anti-reflexo',
            children: [
                { id: 'ar-sem', type: 'config-option', label: 'Sem Anti-Reflexo', title: 'Sem Anti-Reflexo', icon: '⚪', description: 'Lente sem tratamento' },
                { id: 'ar-easyclean', type: 'config-option', label: 'Crizal EasyClean Pro', title: 'Crizal EasyClean Pro', icon: '🟢', description: 'Fácil limpeza' },
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
}
        ,

        // 🌞 FOTOSSENSÍVEL
        {
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
        },

        // 💙 ANTI-BLUE
        {
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
        },

        // 🔢 ÍNDICE DE REFRAÇÃO
        {
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
        }
    ]
};

export default navigationStructure;
