const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'yetkistat',
    description: 'Belirtilen kullanıcının yetkili istatistiklerini gösterir',
    usage: '.yetkistat <@kullanıcı>',
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
                    .setDescription('Doğru kullanım: `.yetkistat <@kullanıcı>`')
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
            
            // Kullanıcının sunucuda olup olmadığını kontrol et
            if (!message.guild.members.cache.has(targetUser.id)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kullanıcı Bulunamadı')
                    .setDescription('Belirtilen kullanıcı sunucuda bulunamadı.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            const targetMember = await message.guild.members.fetch(targetUser.id);

            // Yetki kontrolü
            const isAdmin = targetMember.permissions.has(PermissionFlagsBits.Administrator);
            const roles = targetMember.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .join(', ');

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${targetUser.tag} Kullanıcı Bilgileri`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '👤 Kullanıcı', value: targetUser.tag, inline: true },
                    { name: '🆔 ID', value: targetUser.id, inline: true },
                    { name: '👑 Yetki Seviyesi', value: isAdmin ? 'Yönetici' : 'Yetkili', inline: true },
                    { name: '📅 Katılma Tarihi', value: targetMember.joinedAt.toLocaleDateString('tr-TR'), inline: true },
                    { name: '🎭 Roller', value: roles || 'Rol yok' }
                )
                .setTimestamp()
                .setFooter({ text: 'Yetkili İstatistik Sistemi', iconURL: message.guild.iconURL() });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Yetki istatistik hatası:', error);
            await message.reply({
                content: 'İstatistikler alınırken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 