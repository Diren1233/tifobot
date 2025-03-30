const fs = require('fs');
const path = require('path');

function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../Commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const stat = fs.statSync(folderPath);

        if (stat.isDirectory()) {
            // Alt klasördeki komutları yükle
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const commandFile = require(path.join(folderPath, file));
                if (commandFile.name) {
                    client.commands.set(commandFile.name, commandFile);
                    console.log(`Komut yüklendi: ${commandFile.name}`);
                }
            }
        } else if (folder.endsWith('.js')) {
            // Ana klasördeki komutları yükle
            const commandFile = require(path.join(commandsPath, folder));
            if (commandFile.name) {
                client.commands.set(commandFile.name, commandFile);
                console.log(`Komut yüklendi: ${commandFile.name}`);
            }
        }
    }
}

module.exports = { loadCommands };