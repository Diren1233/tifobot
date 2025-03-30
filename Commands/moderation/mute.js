const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Bir kullanıcıyı susturur',
    usage: '.mute <@kullanıcı> <süre> <sebep>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            const hasMuteRole = message.member.roles.cache.has('1336023743515983914');
            if (!hasMuteRole) {
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
                    .setDescription('Doğru kullanım: `.mute <@kullanıcı> <süre> <sebep>`\nÖrnek: `.mute @kullanıcı 1h spam`')
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
            const muteDuration = parseInt(amount) * units[unit];

            // Susturma rolünü bul
            const muteRole = message.guild.roles.cache.find(role => 
                role.name.toLowerCase().includes('mute') || 
                role.name.toLowerCase().includes('susturma')
            );

            if (!muteRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Rol Bulunamadı')
                    .setDescription('Susturma rolü bulunamadı.')
                    .setTimestamp();

                return await message.reply({ embeds: [errorEmbed] });
            }

            // Kullanıcıyı sustur
            await member.roles.add(muteRole);

            // Başarılı mesajı
            const successEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔇 Kullanıcı Susturuldu')
                .setDescription(`${targetUser.tag} kullanıcısı susturuldu.`)
                .addFields(
                    { name: '👤 Kullanıcı', value: targetUser.tag, inline: true },
                    { name: '⏱️ Süre', value: `${amount}${unit}`, inline: true },
                    { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true },
                    { name: '📝 Sebep', value: reason }
                )
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Süre sonunda susturmayı kaldır
            setTimeout(async () => {
                try {
                    await member.roles.remove(muteRole);
                    const unmuteEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('🔊 Kullanıcının Susturması Kaldırıldı')
                        .setDescription(`${targetUser.tag} kullanıcısının susturma süresi doldu.`)
                        .setTimestamp();

                    await message.channel.send({ embeds: [unmuteEmbed] });
                } catch (error) {
                    console.error('Susturma kaldırma hatası:', error);
                }
            }, muteDuration);

        } catch (error) {
            console.error('Mute hatası:', error);
            await message.reply({
                content: 'Susturma işlemi sırasında bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 