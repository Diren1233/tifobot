const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'jail',
    description: 'Bir kullanıcıyı cezaevine gönderir',
    usage: '.jail <@kullanıcı> <süre> <sebep>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            const hasJailRole = message.member.roles.cache.has('1338201988869132468');
            if (!hasJailRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Yetki Hatası')
                    .setDescription('Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            // Argüman kontrolü
            if (args.length < 3) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kullanım Hatası')
                    .setDescription('Doğru kullanım: `.jail <@kullanıcı> <süre> <sebep>`\nÖrnek: `.jail @kullanıcı 1h spam`')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            const targetUser = message.mentions.users.first();
            if (!targetUser) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kullanıcı Bulunamadı')
                    .setDescription('Lütfen geçerli bir kullanıcı etiketleyin.')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            const member = await message.guild.members.fetch(targetUser.id);
            const duration = args[1];
            const reason = args.slice(2).join(' ');

            // Süre kontrolü
            const timeMatch = duration.match(/^(\d+)([smhd])$/);
            if (!timeMatch) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Geçersiz Süre')
                    .setDescription('Geçerli bir süre formatı kullanın: s (saniye), m (dakika), h (saat), d (gün)\nÖrnek: 1h, 30m, 1d')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            const [, amount, unit] = timeMatch;
            const units = {
                's': 1000,
                'm': 60000,
                'h': 3600000,
                'd': 86400000
            };
            const jailDuration = parseInt(amount) * units[unit];

            // Cezaevi rolünü bul
            const jailRole = message.guild.roles.cache.find(role => 
                role.name.toLowerCase().includes('jail') || 
                role.name.toLowerCase().includes('cezaevi')
            );

            if (!jailRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Rol Bulunamadı')
                    .setDescription('Cezaevi rolü bulunamadı.')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            // Kullanıcının mevcut rollerini kaydet
            const currentRoles = member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .map(role => role.id);

            // Cezaevi rolünü ekle ve diğer rolleri kaldır
            await member.roles.set([jailRole.id]);

            // Başarılı mesajı
            const successEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Kullanıcı Cezaevine Gönderildi')
                .setDescription(`${targetUser.tag} kullanıcısı cezaevine gönderildi.`)
                .addFields(
                    { name: '👤 Kullanıcı', value: targetUser.tag, inline: true },
                    { name: '⏱️ Süre', value: `${amount}${unit}`, inline: true },
                    { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true },
                    { name: '📝 Sebep', value: reason }
                )
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Süre sonunda rolleri geri ver
            setTimeout(async () => {
                try {
                    await member.roles.set(currentRoles);
                    const releaseEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('🔓 Kullanıcı Cezaevinden Çıkarıldı')
                        .setDescription(`${targetUser.tag} kullanıcısının cezaevi süresi doldu.`)
                        .setTimestamp();

                    await message.channel.send({ embeds: [releaseEmbed] });
                } catch (error) {
                    console.error('Cezaevi çıkarma hatası:', error);
                }
            }, jailDuration);

        } catch (error) {
            console.error('Jail hatası:', error);
            await message.reply({
                content: 'Cezaevi işlemi sırasında bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 