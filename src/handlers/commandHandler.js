const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    
    if (!fs.existsSync(commandsPath)) {
        console.warn(`[WARNING] Directorio de comandos no existe: ${commandsPath}`);
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        // Un comando válido tiene 'data' y 'execute'
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[OK] Comando cargado: ${command.data.name}`);
        } else {
            console.warn(`[WARNING] El comando en ${filePath} le falta "data" o "execute".`);
        }
    }
};
