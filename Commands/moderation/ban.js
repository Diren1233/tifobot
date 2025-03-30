const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Bir kullanıcıyı yasaklar',
    usage: '.ban <@kullanıcı> [sebep]',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return await message.reply({
                    content: 'Bu komutu kullanmak için yeterli yetkiniz yok!',
                    ephemeral: true
                });
            }

            // Argüman kontrolü
            if (args.length < 1) {
                return await message.reply({
                    content: 'Lütfen yasaklamak istediğiniz kullanıcıyı etiketleyin.',
                    ephemeral: true
                });
            }

            const targetUser = message.mentions.users.first();
            const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

            // Kullanıcıyı yasakla
            await message.guild.members.ban(targetUser.id, { reason: reason });

            // Başarılı mesajı
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Kullanıcı Yasaklandı')
                .setDescription(`${targetUser.tag} kullanıcısı yasaklandı.`)
                .addFields(
                    { name: 'Sebep', value: reason },
                    { name: 'Yasaklayan', value: message.author.tag }
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Ban hatası:', error);
            await message.reply({
                content: 'Kullanıcı yasaklanırken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
};