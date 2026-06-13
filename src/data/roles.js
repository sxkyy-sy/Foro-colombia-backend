const roles = [
    // Alta Dirección
    { name: '👑 Fiscal General de la República', color: '#FFD700', hoist: true, permissions: ['Administrator'] },
    { name: '🏛️ Fiscal Jefe de Distrito', color: '#FFA500', hoist: true, permissions: ['ManageGuild', 'ManageRoles', 'ManageChannels', 'KickMembers', 'BanMembers'] },
    { name: '📜 Fiscal Superior', color: '#C0392B', hoist: true, permissions: ['ManageMessages', 'KickMembers'] },

    // Cuerpo Fiscal Operativo
    { name: '⚖️ Fiscal Titular', color: '#E74C3C', hoist: true, permissions: ['ManageMessages'] },
    { name: '🔎 Fiscal Auxiliar', color: '#E67E22', hoist: true, permissions: [] },
    { name: '📋 Agente Fiscal', color: '#F39C12', hoist: true, permissions: [] },
    { name: '🗂️ Secretario Judicial', color: '#2980B9', hoist: true, permissions: [] },
    { name: '📁 Asistente Jurídico', color: '#3498DB', hoist: true, permissions: [] },

    // Investigación y Auxiliares
    { name: '🕵️ Investigador Criminal', color: '#8E44AD', hoist: true, permissions: [] },
    { name: '🔬 Perito Forense', color: '#9B59B6', hoist: true, permissions: [] },
    { name: '👮 Policía de Apoyo', color: '#1ABC9C', hoist: true, permissions: [] },
    { name: '📸 Documentalista', color: '#16A085', hoist: true, permissions: [] },

    // Formación
    { name: '🎓 Fiscal en Formación', color: '#27AE60', hoist: true, permissions: [] },
    { name: '📚 Pasante Jurídico', color: '#2ECC71', hoist: true, permissions: [] },

    // Externos / Institucional
    { name: '🤝 Aliado Institucional', color: '#BDC3C7', hoist: true, permissions: [] },
    { name: '⚠️ Bajo Investigación', color: '#E74C3C', hoist: false, permissions: [] },
    { name: '👤 Ciudadano', color: '#95A5A6', hoist: true, permissions: [] },
    { name: '🤖 BOT Fiscalía', color: '#1ABC9C', hoist: false, permissions: [] } // Opcional crearlo, suele crearse al invitar el bot
];

module.exports = roles;
