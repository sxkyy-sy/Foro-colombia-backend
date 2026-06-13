const { ChannelType } = require('discord.js');

const categorias = [
    {
        name: '📢 INFORMACIÓN Y BIENVENIDA',
        permissionType: 'public_readonly', // Todos pueden ver, nadie puede escribir (excepto Admins)
        channels: [
            { name: '👋-bienvenida', type: ChannelType.GuildText },
            { name: '📌-anuncios-oficiales', type: ChannelType.GuildText },
            { name: '📜-reglamento-interno', type: ChannelType.GuildText },
            { name: '🗺️-guía-de-roles', type: ChannelType.GuildText },
            { name: '❓-preguntas-frecuentes', type: ChannelType.GuildText },
            { name: '📊-estadísticas-del-servidor', type: ChannelType.GuildText },
            { name: '🔗-enlaces-útiles', type: ChannelType.GuildText }
        ]
    },
    {
        name: '🏛️ SEDE PRINCIPAL — FISCALÍA',
        permissionType: 'staff_only', // Solo cuerpo fiscal y admin
        channels: [
            { name: '💬-sala-general-fiscal', type: ChannelType.GuildText },
            { name: '📂-registro-de-casos-activos', type: ChannelType.GuildText },
            { name: '📁-archivo-de-casos-cerrados', type: ChannelType.GuildText },
            { name: '⚖️-sala-de-deliberación', type: ChannelType.GuildText },
            { name: '📑-documentos-y-formatos', type: ChannelType.GuildText },
            { name: '🔔-notificaciones-bot', type: ChannelType.GuildText },
            { name: '📰-boletín-institucional', type: ChannelType.GuildText }
        ]
    },
    {
        name: '🔍 INVESTIGACIÓN Y DILIGENCIAS',
        permissionType: 'investigacion', // Solo fiscales, investigadores y policías
        channels: [
            { name: '🕵️-sala-de-investigación', type: ChannelType.GuildText },
            { name: '📸-evidencias-y-pruebas', type: ChannelType.GuildText },
            { name: '🗂️-expedientes-digitales', type: ChannelType.GuildText },
            { name: '🔬-informes-periciales', type: ChannelType.GuildText },
            { name: '📞-coordinación-policial', type: ChannelType.GuildText },
            { name: '🧪-sala-de-peritos', type: ChannelType.GuildText },
            { name: '📋-diligencias-pendientes', type: ChannelType.GuildText }
        ]
    },
    {
        name: '⚖️ SALA DE AUDIENCIAS',
        permissionType: 'audiencias', // Roles necesarios para audiencias
        channels: [
            { name: '📝-actas-de-audiencias', type: ChannelType.GuildText },
            { name: '📣-convocatorias-de-audiencia', type: ChannelType.GuildText },
            { name: '🎙️-audiencia-principal', type: ChannelType.GuildVoice },
            { name: '🎙️-audiencia-2', type: ChannelType.GuildVoice },
            { name: '🔏-sala-privada-fiscal', type: ChannelType.GuildVoice },
            { name: '🔐-sala-de-deliberación-voz', type: ChannelType.GuildVoice },
            { name: '📡-sala-de-espera', type: ChannelType.GuildVoice }
        ]
    },
    {
        name: '📨 ATENCIÓN CIUDADANA Y TICKETS',
        permissionType: 'ciudadanos_only', // Solo ciudadanos y staff de atención
        channels: [
            { name: '📬-abrir-caso-denuncia', type: ChannelType.GuildText },
            { name: '📣-denuncias-públicas', type: ChannelType.GuildText },
            { name: '📋-estado-de-mi-caso', type: ChannelType.GuildText },
            { name: '💬-consulta-ciudadana', type: ChannelType.GuildText }
        ]
    },
    {
        name: '🤝 COORDINACIÓN INSTITUCIONAL',
        permissionType: 'aliados', // Aliados institucionales y fiscales
        channels: [
            { name: '🤝-enlace-institucional', type: ChannelType.GuildText },
            { name: '📡-coordinación-pnc', type: ChannelType.GuildText },
            { name: '🏥-coordinación-medicina-legal', type: ChannelType.GuildText },
            { name: '📢-comunicados-externos', type: ChannelType.GuildText }
        ]
    },
    {
        name: '🎓 FORMACIÓN Y CAPACITACIÓN',
        permissionType: 'formacion', // Pasantes y fiscales
        channels: [
            { name: '📚-material-de-estudio', type: ChannelType.GuildText },
            { name: '📖-legislación-vigente', type: ChannelType.GuildText },
            { name: '🧪-simulacros-de-audiencia', type: ChannelType.GuildText },
            { name: '✅-evaluaciones-y-pruebas', type: ChannelType.GuildText },
            { name: '🏆-ranking-de-méritos', type: ChannelType.GuildText },
            { name: '📝-solicitud-de-ascenso', type: ChannelType.GuildText },
            { name: '🎙️-sala-de-formación', type: ChannelType.GuildVoice }
        ]
    },
    {
        name: '📊 ADMINISTRACIÓN INTERNA',
        permissionType: 'admin_only', // Solo Fiscal Jefe y General
        channels: [
            { name: '⚙️-configuración-del-bot', type: ChannelType.GuildText },
            { name: '📋-altas-y-bajas-de-personal', type: ChannelType.GuildText },
            { name: '💼-agenda-institucional', type: ChannelType.GuildText },
            { name: '📊-reportes-semanales', type: ChannelType.GuildText },
            { name: '⚠️-sanciones-internas', type: ChannelType.GuildText },
            { name: '🔐-sala-ejecutiva', type: ChannelType.GuildVoice },
            { name: '📁-contratos-y-acuerdos', type: ChannelType.GuildText }
        ]
    },
    {
        name: '🛡️ MODERACIÓN Y LOGS',
        permissionType: 'admin_only',
        channels: [
            { name: '🛡️-log-general', type: ChannelType.GuildText },
            { name: '🔨-log-sanciones', type: ChannelType.GuildText },
            { name: '👋-log-entradas-salidas', type: ChannelType.GuildText },
            { name: '✏️-log-edición-mensajes', type: ChannelType.GuildText },
            { name: '🗑️-log-eliminación-mensajes', type: ChannelType.GuildText },
            { name: '⚙️-log-cambios-roles', type: ChannelType.GuildText },
            { name: '🤖-log-comandos-bot', type: ChannelType.GuildText }
        ]
    },
    {
        name: '🎉 ZONA SOCIAL',
        permissionType: 'staff_only',
        channels: [
            { name: '😄-off-topic', type: ChannelType.GuildText },
            { name: '🎵-música', type: ChannelType.GuildText },
            { name: '🖼️-memes-jurídicos', type: ChannelType.GuildText },
            { name: '🎙️-sala-social', type: ChannelType.GuildVoice },
            { name: '🎮-sala-de-juegos', type: ChannelType.GuildVoice }
        ]
    }
];

module.exports = categorias;
