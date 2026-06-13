require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
// Cargar los archivos de comandos de la carpeta src/commands
const commandsPath = path.join(__dirname, 'src', 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] El comando en ${filePath} le falta la propiedad "data" o "execute".`);
        }
    }
} else {
    console.error("El directorio src/commands no existe. No se cargarán comandos.");
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Desplegar comandos
(async () => {
    try {
        console.log(`Empezando a refrescar ${commands.length} comandos slash de aplicación (/).`);

        if (!process.env.CLIENT_ID || !process.env.GUILD_ID) {
            console.error("CLIENT_ID o GUILD_ID faltan en el .env");
            return;
        }

        // El método put se usa para sobrescribir completamente todos los comandos en el servidor con el conjunto actual
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Se recargaron exitosamente ${data.length} comandos slash (/).`);
    } catch (error) {
        // Log the error
        console.error(error);
    }
})();
