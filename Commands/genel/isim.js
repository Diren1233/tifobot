const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'isim',
    description: 'Belirtilen kullanıcının ismini değiştirir',
    usage: '.isim <ID> <yeni isim>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            const allowedRoles = [
                '1355532536708599909',
                '1355532306919456799',
                '1355532875017228508',
                '1355533261295587548',
                '1355533486756200500',
                '1355533597288693821'
            ];

            if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                return message.reply({
                    content: '❌ Bu komutu kullanmak için gerekli yetkiye sahip değilsin!',
                    ephemeral: true
                });
            }

            // ID ve yeni isim kontrolü
            const userId = args[0];
            const newName = args.slice(1).join(' ');

            if (!userId) {
                return message.reply({
                    content: '❌ Lütfen bir kullanıcı ID\'si belirt!',
                    ephemeral: true
                });
            }

            if (!newName) {
                return message.reply({
                    content: '❌ Lütfen yeni ismi belirt!',
                    ephemeral: true
                });
            }

            // ID formatı kontrolü
            if (!/^\d{17,19}$/.test(userId)) {
                return message.reply({
                    content: '❌ Geçersiz ID formatı! Lütfen doğru bir Discord ID\'si girin.',
                    ephemeral: true
                });
            }

            // İsim uzunluğu kontrolü
            if (newName.length > 32) {
                return message.reply({
                    content: '❌ İsim 32 karakterden uzun olamaz!',
                    ephemeral: true
                });
            }

            // Kullanıcıyı bul ve ismini değiştir
            const member = await message.guild.members.fetch(userId).catch(() => null);
            if (!member) {
                return message.reply({
                    content: '❌ Belirtilen ID\'ye sahip kullanıcı sunucuda bulunamadı!',
                    ephemeral: true
                });
            }

            const oldName = member.displayName;
            await member.setNickname(newName);

            const embed = {
                color: 0x2b2d31,
                title: '📝 İsim Değiştirildi',
                description: `${member.user.tag} kullanıcısının ismi değiştirildi!\n\n**Eski İsim:** ${oldName}\n**Yeni İsim:** ${newName}\n**Değiştiren:** ${message.author.tag}`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true, size: 256 })
                },
                footer: {
                    text: `${message.guild.name} Sunucusu`,
                    icon_url: message.guild.iconURL()
                }
            };

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('İsim komutu hatası:', error);
            await message.reply({
                content: '❌ İsim değiştirilirken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 