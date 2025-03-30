// Commands/clear.js
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

let deletedMessagesCache = []; // Silinen mesajları saklamak için bir dizi

module.exports = {
    name: 'clear',
    description: 'Belirtilen sayıda mesajı siler',
    usage: '.clear <miktar>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Yetki Hatası')
                    .setDescription('Bu komutu kullanmak için "Mesajları Yönet" yetkisine sahip olmalısınız.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            // Argüman kontrolü
            if (args.length < 1) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kullanım Hatası')
                    .setDescription('Doğru kullanım: `.clear <miktar>`\nÖrnek: `.clear 10`')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            const amount = parseInt(args[0]);
            if (isNaN(amount) || amount < 1 || amount > 100) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Geçersiz Miktar')
                    .setDescription('Lütfen 1 ile 100 arasında bir sayı girin.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            // Mesajları sil
            const deletedMessages = await message.channel.bulkDelete(amount, true);

            // Başarılı mesajı
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Mesajlar Silindi')
                .setDescription(`**${deletedMessages.size}** mesaj başarıyla silindi!`)
                .addFields(
                    { name: '👤 İşlemi Yapan', value: `${message.author.tag}`, inline: true },
                    { name: '💬 Kanal', value: `${message.channel}`, inline: true },
                    { name: '🗑️ Silinen Mesaj Sayısı', value: `${deletedMessages.size}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Mesaj Temizleme Sistemi', iconURL: message.guild.iconURL() });

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Clear hatası:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Hata Oluştu')
                .setDescription('Mesajları silerken bir hata oluştu. Lütfen şunları kontrol edin:')
                .addFields(
                    { name: '🔍 Olası Sebepler', value: '• Botun yeterli yetkisi olmayabilir\n• Mesajlar 14 günden eski olabilir\n• Kanal üzerinde işlem yapma yetkisi olmayabilir' },
                    { name: '💡 Çözüm Önerileri', value: '• Botun yetkilerini kontrol edin\n• Daha yeni mesajları silmeyi deneyin\n• Botu kanala ekleyin' }
                )
                .setTimestamp()
                .setFooter({ text: 'Hata Yönetim Sistemi', iconURL: message.guild.iconURL() });

            await message.reply({ embeds: [errorEmbed] });
        }
    }
};
