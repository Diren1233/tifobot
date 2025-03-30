const { Message } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ECONOMY_FILE = path.join(__dirname, '../data/economy.json');

// Ekonomi verilerini yükleme
function loadEconomy() {
    try {
        return JSON.parse(fs.readFileSync(ECONOMY_FILE));
    } catch (error) {
        return { users: {} };
    }
}

module.exports = {
    name: 'cüzdan',
    description: 'Mevcut paranızı gösterir',
    async execute(message) {
        // Sadece belirtilen kanalda çalışması için kontrol
        if (message.channelId !== '1355862592878547078') {
            return message.reply('Bu komut sadece özel kanalda kullanılabilir!');
        }

        const userId = message.author.id;
        const economy = loadEconomy();

        // Kullanıcının parasını kontrol et
        if (!economy.users[userId]) {
            economy.users[userId] = 1000; // Yeni kullanıcıya başlangıç parası
            fs.writeFileSync(ECONOMY_FILE, JSON.stringify(economy, null, 4));
        }

        const embed = {
            color: 0x0099ff,
            title: 'Cüzdan Bilgileri',
            fields: [
                {
                    name: 'Kullanıcı',
                    value: `<@${userId}>`,
                    inline: true
                },
                {
                    name: 'Mevcut Para',
                    value: `${economy.users[userId]} AS`,
                    inline: true
                }
            ]
        };

        await message.reply({ embeds: [embed] });
    }
}; 