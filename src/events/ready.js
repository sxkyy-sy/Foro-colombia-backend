const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`¡Listo! El bot ha iniciado sesión como ${client.user.tag}`);
        
        client.user.setPresence({
            activities: [{ name: 'Justicia y Orden ⚖️', type: ActivityType.Watching }],
            status: 'online',
        });
    },
};
