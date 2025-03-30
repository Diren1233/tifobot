const { Message } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Botun çalışma süresini gösterir',
    async execute(message) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = {
            color: 0x00ff00,
            title: 'Bot Durumu',
            fields: [
                {
                    name: 'Çalışma Süresi',
                    value: `${days} gün, ${hours} saat, ${minutes} dakika, ${seconds} saniye`,
                    inline: false
                }
            ]
        };

        await message.reply({ embeds: [embed] });
    }
}; 