const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const rolesData = require('../data/roles');
const categoriasData = require('../data/canales');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-fiscalia')
        .setDescription('Configura automáticamente el servidor de Fiscalía (Roles y Canales).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        await interaction.deferReply();
        const guild = interaction.guild;
        
        try {
            // 1. Crear Roles
            const createdRoles = new Map();
            const rolesToCreate = [...rolesData].reverse();
            
            for (const roleData of rolesToCreate) {
                let existingRole = guild.roles.cache.find(r => r.name === roleData.name);
                if (!existingRole) {
                    existingRole = await guild.roles.create({
                        name: roleData.name,
                        color: roleData.color,
                        hoist: roleData.hoist,
                        permissions: roleData.permissions.length > 0 ? roleData.permissions : [],
                        reason: 'Setup Fiscalía: Creación automática de rol',
                    });
                }
                createdRoles.set(roleData.name, existingRole);
            }

            // Función de ayuda para obtener ID del rol si existe
            const getRoleId = (name) => {
                const role = createdRoles.get(name);
                return role ? role.id : null;
            };

            // 2. Crear Categorías y Canales con sus Permisos
            for (const categoria of categoriasData) {
                let overwrites = [];
                const everyoneId = guild.roles.everyone.id;

                // Definimos los grupos de roles
                const admins = [getRoleId('👑 Fiscal General de la República'), getRoleId('🏛️ Fiscal Jefe de Distrito')];
                const altosFiscales = [getRoleId('📜 Fiscal Superior'), getRoleId('⚖️ Fiscal Titular')];
                const todosFiscales = [...altosFiscales, getRoleId('🔎 Fiscal Auxiliar'), getRoleId('📋 Agente Fiscal')];
                const investigacion = [...todosFiscales, getRoleId('🕵️ Investigador Criminal'), getRoleId('🔬 Perito Forense'), getRoleId('👮 Policía de Apoyo')];
                const staffApoyo = [getRoleId('🗂️ Secretario Judicial'), getRoleId('📁 Asistente Jurídico'), getRoleId('📸 Documentalista')];
                const todoStaff = [...investigacion, ...staffApoyo, getRoleId('🎓 Fiscal en Formación'), getRoleId('📚 Pasante Jurídico')];
                const ciudadanos = [getRoleId('👤 Ciudadano')];

                const filterValid = (arr) => arr.filter(id => id !== null);

                const viewAllow = [PermissionFlagsBits.ViewChannel];
                const viewDeny = [PermissionFlagsBits.ViewChannel];
                
                // Configurar overwrites basados en el permissionType
                switch(categoria.permissionType) {
                    case 'public_readonly':
                        overwrites.push({ id: everyoneId, allow: viewAllow, deny: [PermissionFlagsBits.SendMessages] });
                        filterValid(admins).forEach(id => overwrites.push({ id, allow: [PermissionFlagsBits.SendMessages] }));
                        break;
                        
                    case 'staff_only':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid(todoStaff).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;

                    case 'investigacion':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid(investigacion).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;

                    case 'audiencias':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid([...todosFiscales, ...staffApoyo, ...ciudadanos, getRoleId('🤝 Aliado Institucional')]).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;

                    case 'ciudadanos_only':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid([...ciudadanos, ...todoStaff]).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;

                    case 'aliados':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid([...todosFiscales, getRoleId('🤝 Aliado Institucional'), getRoleId('👮 Policía de Apoyo')]).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;

                    case 'formacion':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid([...todoStaff]).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;

                    case 'admin_only':
                        overwrites.push({ id: everyoneId, deny: viewDeny });
                        filterValid(admins).forEach(id => overwrites.push({ id, allow: viewAllow }));
                        break;
                        
                    default:
                        break;
                }

                let categoryChannel = guild.channels.cache.find(c => c.name === categoria.name && c.type === ChannelType.GuildCategory);
                if (!categoryChannel) {
                    categoryChannel = await guild.channels.create({
                        name: categoria.name,
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: overwrites,
                        reason: 'Setup Fiscalía: Creación de categoría'
                    });
                } else {
                    await categoryChannel.permissionOverwrites.set(overwrites);
                }

                for (const canal of categoria.channels) {
                    let textChannel = guild.channels.cache.find(c => c.name === canal.name && c.parentId === categoryChannel.id);
                    if (!textChannel) {
                        await guild.channels.create({
                            name: canal.name,
                            type: canal.type,
                            parent: categoryChannel.id,
                            reason: 'Setup Fiscalía: Creación de canal'
                        });
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('🏛️ Setup de Fiscalía Completado y Actualizado')
                .setDescription('Se han creado todos los roles, categorías y canales correctamente.\n\n✅ **Permisos Aplicados Exitosamente:**\n- **Investigación**: Solo para Fiscales e Investigadores.\n- **Audiencias**: Restringido a los roles necesarios.\n- **Atención Ciudadana**: Visible para los ciudadanos y staff de atención.\n- Todos los canales han heredado los permisos de sus respectivas categorías.')
                .setColor('#2ECC71')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en setup:', error);
            await interaction.editReply({ content: 'Hubo un error al configurar el servidor. Verifica que el bot tenga permisos de Administrador y su rol esté en lo más alto.' });
        }
    },
};
