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

// İstatistikleri kaydet
function saveStats(stats) {
    try {
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 4));
    } catch (error) {
        console.error('İstatistik kaydetme hatası:', error);
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
    name: 'stat',
    description: 'Kullanıcının ses ve metin istatistiklerini gösterir',
    usage: '.stat [@kullanıcı]',
    async execute(message, args) {
        try {
            const stats = loadStats();
            const targetUser = message.mentions.users.first() || message.author;
            const userId = targetUser.id;

            // Kullanıcı istatistiklerini al veya oluştur
            if (!stats[userId]) {
                stats[userId] = {
                    voiceTime: 0,
                    messageCount: 0,
                    voiceChannels: {},
                    textChannels: {},
                    lastVoiceJoin: null
                };
                saveStats(stats);
            }

            const userStats = stats[userId];

            // Ses kanallarındaki süreleri hesapla
            let totalVoiceTime = userStats.voiceTime;
            if (userStats.lastVoiceJoin) {
                const currentTime = Date.now();
                totalVoiceTime += currentTime - userStats.lastVoiceJoin;
            }

            // En çok kullanılan ses kanallarını sırala
            const sortedVoiceChannels = Object.entries(userStats.voiceChannels)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            // En çok mesaj atılan kanalları sırala
            const sortedTextChannels = Object.entries(userStats.textChannels)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({
                    name: targetUser.tag,
                    iconURL: targetUser.displayAvatarURL({ dynamic: true, size: 256 })
                })
                .setDescription(`<:join:1234567890> Sunucuya Katılma: ${targetUser.createdAt.toLocaleDateString('tr-TR')}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { 
                        name: '🎙️ Ses İstatistikleri',
                        value: `\`\`\`\nToplam Ses Süresi: ${formatDuration(totalVoiceTime)}\nAktif Ses Kanalı: ${userStats.lastVoiceJoin ? 'Evet' : 'Hayır'}\`\`\``,
                        inline: true
                    },
                    {
                        name: '💬 Metin İstatistikleri',
                        value: `\`\`\`\nToplam Mesaj: ${userStats.messageCount}\nAktif Kanal: ${userStats.lastVoiceJoin ? 'Evet' : 'Hayır'}\`\`\``,
                        inline: true
                    }
                );

            // En çok kullanılan ses kanalları
            if (sortedVoiceChannels.length > 0) {
                const voiceChannelList = sortedVoiceChannels
                    .map(([channelId, time], index) => {
                        const channel = message.guild.channels.cache.get(channelId);
                        return `${index + 1}. ${channel ? channel.name : 'Bilinmeyen Kanal'}: ${formatDuration(time)}`;
                    })
                    .join('\n');

                embed.addFields({
                    name: '🎵 En Çok Kullanılan Ses Kanalları',
                    value: `\`\`\`\n${voiceChannelList}\`\`\``
                });
            }

            // En çok mesaj atılan kanallar
            if (sortedTextChannels.length > 0) {
                const textChannelList = sortedTextChannels
                    .map(([channelId, count], index) => {
                        const channel = message.guild.channels.cache.get(channelId);
                        return `${index + 1}. ${channel ? channel.name : 'Bilinmeyen Kanal'}: ${count} mesaj`;
                    })
                    .join('\n');

                embed.addFields({
                    name: '📝 En Çok Mesaj Atılan Kanallar',
                    value: `\`\`\`\n${textChannelList}\`\`\``
                });
            }

            embed.setFooter({ 
                text: `Son Güncelleme: ${new Date().toLocaleString('tr-TR')}`,
                iconURL: message.guild.iconURL()
            });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Stat hatası:', error);
            await message.reply({
                content: 'İstatistikler alınırken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 