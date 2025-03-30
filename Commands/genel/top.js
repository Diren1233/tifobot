const { EmbedBuilder } = require('discord.js');
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

// Süreyi formatla
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün ${hours % 24} saat`;
    if (hours > 0) return `${hours} saat ${minutes % 60} dakika`;
    if (minutes > 0) return `${minutes} dakika ${seconds % 60} saniye`;
    return `${seconds} saniye`;
}

module.exports = {
    name: 'top',
    description: 'En aktif 15 kullanıcıyı gösterir',
    usage: '.top',
    async execute(message) {
        try {
            const stats = loadStats();
            const guild = message.guild;

            // Ses istatistiklerini hesapla
            const voiceStats = Object.entries(stats).map(([userId, userStats]) => {
                let totalVoiceTime = userStats.voiceTime;
                if (userStats.lastVoiceJoin) {
                    totalVoiceTime += Date.now() - userStats.lastVoiceJoin;
                }
                return {
                    userId,
                    voiceTime: totalVoiceTime
                };
            }).sort((a, b) => b.voiceTime - a.voiceTime).slice(0, 15);

            // Mesaj istatistiklerini hesapla
            const messageStats = Object.entries(stats).map(([userId, userStats]) => ({
                userId,
                messageCount: userStats.messageCount
            })).sort((a, b) => b.messageCount - a.messageCount).slice(0, 15);

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🏆 Sunucu Liderlik Tablosu')
                .setDescription(`Son Güncelleme: ${new Date().toLocaleString('tr-TR')}`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));

            // Ses istatistikleri
            let voiceList = '';
            for (let i = 0; i < voiceStats.length; i++) {
                const user = await guild.members.fetch(voiceStats[i].userId).catch(() => null);
                if (user) {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
                    voiceList += `${medal} **${user.user.tag}**\n⏱️ ${formatDuration(voiceStats[i].voiceTime)}\n\n`;
                }
            }

            embed.addFields({
                name: '🎙️ En Çok Ses Kanalında Kalanlar',
                value: voiceList || 'Henüz veri yok'
            });

            // Mesaj istatistikleri
            let messageList = '';
            for (let i = 0; i < messageStats.length; i++) {
                const user = await guild.members.fetch(messageStats[i].userId).catch(() => null);
                if (user) {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
                    messageList += `${medal} **${user.user.tag}**\n💬 ${messageStats[i].messageCount} mesaj\n\n`;
                }
            }

            embed.addFields({
                name: '💬 En Çok Mesaj Atanlar',
                value: messageList || 'Henüz veri yok'
            });

            embed.setFooter({ 
                text: `${guild.name} Sunucusu`,
                iconURL: guild.iconURL()
            });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Top komutu hatası:', error);
            await message.reply({
                content: 'Liderlik tablosu alınırken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 