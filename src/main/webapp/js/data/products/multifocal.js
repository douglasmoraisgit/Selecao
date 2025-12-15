/**
 * products/multifocal.js
 * Lentes multifocais - múltiplas distâncias em uma única lente
 */

const multifocal = {
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
};

export default multifocal;
