const { Events } = require('discord.js');
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
    name: Events.VoiceStateUpdate,

    async execute(oldState, newState) {
        try {
            const stats = loadStats();
            const userId = newState.member.id;

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

            const userStats = stats[userId];

            // Ses kanalına giriş
            if (!oldState.channelId && newState.channelId) {
                userStats.lastVoiceJoin = Date.now();
                if (!userStats.voiceChannels[newState.channelId]) {
                    userStats.voiceChannels[newState.channelId] = 0;
                }
            }
            // Ses kanalından çıkış
            else if (oldState.channelId && !newState.channelId) {
                if (userStats.lastVoiceJoin) {
                    const timeSpent = Date.now() - userStats.lastVoiceJoin;
                    userStats.voiceTime += timeSpent;
                    userStats.voiceChannels[oldState.channelId] += timeSpent;
                    userStats.lastVoiceJoin = null;
                }
            }

            saveStats(stats);
        } catch (error) {
            console.error('Voice state update hatası:', error);
        }
    }
}; 