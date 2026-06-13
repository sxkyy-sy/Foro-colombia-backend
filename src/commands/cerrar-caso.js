const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cerrar-caso')
        .setDescription('Cierra el caso actual.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const channel = interaction.channel;

        if (!channel.name.startsWith('caso-')) {
            return interaction.reply({ content: '❌ Este comando solo se puede usar dentro de un canal de caso.', ephemeral: true });
        }

        await interaction.reply({ content: '🔒 Cerrando el caso en 5 segundos...' });

        setTimeout(async () => {
            try {
                await channel.delete('Caso cerrado por un fiscal.');
            } catch (error) {
                console.error('Error al borrar canal:', error);
            }
        }, 5000);
    },
};
