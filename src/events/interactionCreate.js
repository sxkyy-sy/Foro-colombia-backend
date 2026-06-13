const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No se encontró el comando ${interaction.commandName}.`);
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error ejecutando ${interaction.commandName}`);
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Hubo un error al ejecutar este comando.', ephemeral: true });
                }
            }
        }
        
        if (interaction.isButton()) {
            // Manejador simple para botones (ej: tickets)
            if (interaction.customId === 'abrir_ticket') {
                // Aquí iría la lógica de tickets, la crearemos pronto
                await interaction.reply({ content: 'Sistema de tickets en desarrollo...', ephemeral: true });
            }
        }
    },
};
