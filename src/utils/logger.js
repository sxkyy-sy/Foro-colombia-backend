const { EmbedBuilder } = require('discord.js');

module.exports = {
    async logAction(client, guild, actionName, description, color = '#3498DB') {
        try {
            // Buscar canal de log general
            const logChannel = guild.channels.cache.find(c => c.name === '🛡️-log-general');
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle(`Logs | ${actionName}`)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error al enviar log:', error);
        }
    }
};
