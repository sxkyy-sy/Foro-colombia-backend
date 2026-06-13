const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abrir-caso')
        .setDescription('Abre un nuevo caso o denuncia (crea un ticket privado).'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        const user = interaction.user;

        // Buscar categoría de tickets
        let category = guild.channels.cache.find(c => c.name === '🔒-tickets-activos' && c.type === ChannelType.GuildCategory);
        if (!category) {
            category = await guild.channels.create({
                name: '🔒-tickets-activos',
                type: ChannelType.GuildCategory
            });
        }

        // Crear el canal de texto
        const ticketChannel = await guild.channels.create({
            name: `caso-${user.username}`,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                }
                // Aquí podrías añadir un rol de "Staff" o "Fiscal" para que lo vean
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle(`🏛️ Caso Abierto: ${user.username}`)
            .setDescription('Un agente fiscal te atenderá en breve. Por favor, describe detalladamente tu caso o denuncia y aporta todas las pruebas que tengas.')
            .setColor('#E67E22');

        await ticketChannel.send({ content: `<@${user.id}>`, embeds: [embed] });
        await interaction.reply({ content: `✅ Tu caso ha sido abierto en ${ticketChannel}`, ephemeral: true });
    },
};
