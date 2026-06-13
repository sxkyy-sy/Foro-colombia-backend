require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Collections para comandos y tickets
client.commands = new Collection();
client.cooldowns = new Collection();

// Cargar Handlers
const handlersPath = path.join(__dirname, 'src', 'handlers');
if (fs.existsSync(handlersPath)) {
    const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
    for (const file of handlerFiles) {
        require(path.join(handlersPath, file))(client);
    }
} else {
    console.warn("Directorio de handlers no encontrado. Se omitirá la carga de handlers por ahora.");
}

// Iniciar sesión
client.login(process.env.TOKEN).then(async () => {
    console.log("Bot logueado correctamente como " + client.user.tag);
    
    // Iniciar DB y Servidor
    const { setupDB } = require('./db');
    const { startServer } = require('./server');
    
    try {
        await setupDB();
        console.log("Base de datos SQLite inicializada correctamente.");
        startServer(client);
    } catch (e) {
        console.error("Error al iniciar DB o Servidor:", e);
    }
}).catch(error => {
    console.error("Error al iniciar sesión con el token proporcionado:", error);
});
