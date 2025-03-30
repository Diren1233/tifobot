function loadEvents(client) {
    const ascii = require('ascii-table');
    const fs = require('fs');
    const path = require('path');
    const table = new ascii().setHeading('Events', 'Status');

    // Ana Events klasörünü kontrol et
    const eventFiles = fs.readdirSync(path.join(__dirname, '../Events')).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(__dirname, '../Events', file));
        if (event.name) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            table.addRow(event.name, '✅');
        }
    }

    // Interactions klasörünü kontrol et
    const interactionsPath = path.join(__dirname, '../Events/Interactions');
    if (fs.existsSync(interactionsPath)) {
        const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));
        for (const file of interactionFiles) {
            const event = require(path.join(interactionsPath, file));
            if (event.name) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                table.addRow(event.name, '✅');
            }
        }
    }

    console.log(table.toString());
}

module.exports = { loadEvents };