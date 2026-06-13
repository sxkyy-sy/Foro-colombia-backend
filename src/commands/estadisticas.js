const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('estadisticas')
        .setDescription('Muestra las estadísticas actuales del servidor de la Fiscalía.'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        const totalMembers = guild.memberCount;
        
        // Contar bots vs humanos
        const bots = guild.members.cache.filter(member => member.user.bot).size;
        const humanos = totalMembers - bots;

        // Contar canales
        const textChannels = guild.channels.cache.filter(c => c.isTextBased()).size;
        const voiceChannels = guild.channels.cache.filter(c => c.isVoiceBased()).size;

        const embed = new EmbedBuilder()
            .setTitle('📊 Estadísticas de la Fiscalía')
            .addFields(
                { name: '👥 Personal Total', value: `${humanos}`, inline: true },
                { name: '🤖 Bots Asistentes', value: `${bots}`, inline: true },
                { name: '🏛️ Canales de Texto', value: `${textChannels}`, inline: true },
                { name: '🎙️ Canales de Voz', value: `${voiceChannels}`, inline: true }
            )
            .setColor('#8E44AD')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
