const { Events, EmbedBuilder, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// İstatistik dosyasının yolu
const statsPath = path.join(__dirname, '../../data/userStats.json');

// İstatistikleri yükle
function loadStats() {
    try {
        if (!fs.existsSync(statsPath)) {
            fs.writeFileSync(statsPath, JSON.stringify({}));
        }
        return JSON.parse(fs.readFileSync(statsPath));
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
        return {};
    }
}

// İstatistikleri kaydet
function saveStats(stats) {
    try {
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 4));
    } catch (error) {
        console.error('İstatistik kaydetme hatası:', error);
    }
}

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        try {
            // Bot mesajlarını ve prefix kontrolünü yap
            if (message.author.bot || !message.content.startsWith('.')) {
                // Mesaj istatistiklerini güncelle
                const stats = loadStats();
                const userId = message.author.id;

                // Kullanıcı istatistiklerini al veya oluştur
                if (!stats[userId]) {
                    stats[userId] = {
                        voiceTime: 0,
                        messageCount: 0,
                        voiceChannels: {},
                        textChannels: {},
                        lastVoiceJoin: null
                    };
                }

                // Mesaj sayısını güncelle
                stats[userId].messageCount++;
                saveStats(stats);
                return;
            }

            // Komut işleme
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.commands.get(commandName);
            if (!command) return;

            try {
                await command.execute(message, args);
            } catch (error) {
                console.error(error);
                await message.reply('Komut çalıştırılırken bir hata oluştu!');
            }

        } catch (error) {
            console.error('MessageCreate event hatası:', error);
        }
    }
}; 