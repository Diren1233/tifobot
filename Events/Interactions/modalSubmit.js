const { Events, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'streamer_basvuru_modal') {
            try {
                const speedtestUrl = interaction.fields.getTextInputValue('speedtest_url');

                // URL formatı kontrolü
                if (!speedtestUrl.startsWith('https://www.speedtest.net/result/')) {
                    return await interaction.reply({
                        content: '❌ Geçersiz Speedtest URL\'si! Lütfen doğru bir Speedtest sonuç URL\'si girin.',
                        ephemeral: true
                    });
                }

                // Speedtest sonucunu al
                const response = await axios.get(speedtestUrl);
                const html = response.data;

                // Hız değerini bul (MB/s)
                const speedMatch = html.match(/"download":(\d+\.?\d*)/);
                if (!speedMatch) {
                    return await interaction.reply({
                        content: '❌ Speedtest sonucundan hız değeri alınamadı!',
                        ephemeral: true
                    });
                }

                const speed = parseFloat(speedMatch[1]);
                const streamerRole = interaction.guild.roles.cache.get('1336023756769857629');

                if (!streamerRole) {
                    return await interaction.reply({
                        content: '❌ Streamer rolü bulunamadı!',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle('🎮 Streamer Başvuru Sonucu')
                    .setDescription(`**İnternet Hızınız:** ${speed.toFixed(2)} MB/s\n\n` +
                        (speed >= 4 
                            ? `✅ Tebrikler! İnternet hızınız yeterli. Streamer rolü verildi!`
                            : `❌ Üzgünüz, internet hızınız yeterli değil. Minimum 4 MB/s gerekiyor.`))
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ 
                        text: `${interaction.guild.name} Sunucusu`,
                        iconURL: interaction.guild.iconURL()
                    });

                // Hız yeterliyse rolü ver
                if (speed >= 4) {
                    await interaction.member.roles.add(streamerRole);
                }

                await interaction.reply({ embeds: [embed], ephemeral: true });

            } catch (error) {
                console.error('Streamer başvuru işleme hatası:', error);
                await interaction.reply({
                    content: '❌ Başvuru işlenirken bir hata oluştu!',
                    ephemeral: true
                });
            }
        }
    }
}; 