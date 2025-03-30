const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'streamerbasvuru',
    description: 'Streamer başvuru mesajını oluşturur',
    usage: '.streamerbasvuru',
    async execute(message) {
        try {
            // Yetki kontrolü
            if (!message.member.permissions.has('Administrator')) {
                return message.reply({
                    content: '❌ Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({
                    name: '🎮 Streamer Başvuru Sistemi',
                    iconURL: message.guild.iconURL({ dynamic: true, size: 256 })
                })
                .setDescription(`<:join:1234567890> **Streamer Olmak İçin Gerekenler**\n\n` +
                    `> 1️⃣ İnternet hızınızın en az 4 MB/s olması gerekmektedir\n` +
                    `> 2️⃣ Speedtest sonucunuzu aşağıdaki butona tıklayarak paylaşın\n` +
                    `> 3️⃣ Sistem otomatik olarak hızınızı kontrol edecek ve uygunsa Streamer rolü verecektir\n\n` +
                    `<:info:1234567890> **Önemli Notlar**\n\n` +
                    `> • Başvuru yapmadan önce internet hızınızı test etmeyi unutmayın\n` +
                    `> • Hız testi sonucunuz 4 MB/s'den düşükse başvurunuz reddedilecektir\n` +
                    `> • Başvuru yapmak için aşağıdaki butona tıklayın\n\n` +
                    `<:speed:1234567890> **Speedtest Yapmak İçin:**\n` +
                    `> [Speedtest.net](https://www.speedtest.net/) adresine gidin\n` +
                    `> Testi başlatın ve sonuçları bekleyin\n` +
                    `> Sonuç URL'sini kopyalayıp başvuru formuna yapıştırın`)
                .setFooter({ 
                    text: `${message.guild.name} Sunucusu • ${new Date().toLocaleDateString('tr-TR')}`,
                    iconURL: message.guild.iconURL()
                });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('streamer_basvuru')
                        .setLabel('Streamer Başvurusu Yap')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎮')
                );

            await message.channel.send({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Streamer başvuru mesajı oluşturma hatası:', error);
            await message.reply({
                content: '❌ Başvuru mesajı oluşturulurken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 