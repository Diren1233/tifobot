const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'streamer',
    description: 'Belirtilen ID\'ye sahip kullanıcıya Streamer rolü verir',
    usage: '.streamer <ID>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply({
                    content: '❌ Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!',
                    ephemeral: true
                });
            }

            // ID kontrolü
            const userId = args[0];
            if (!userId) {
                return message.reply({
                    content: '❌ Lütfen bir kullanıcı ID\'si belirt!',
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

            const member = await message.guild.members.fetch(userId).catch(() => null);
            if (!member) {
                return message.reply({
                    content: '❌ Belirtilen ID\'ye sahip kullanıcı sunucuda bulunamadı!',
                    ephemeral: true
                });
            }

            const streamerRole = message.guild.roles.cache.get('1336023756769857629');
            if (!streamerRole) {
                return message.reply({
                    content: '❌ Streamer rolü bulunamadı!',
                    ephemeral: true
                });
            }

            // Rol verme işlemi
            await member.roles.add(streamerRole);

            const embed = {
                color: 0x2b2d31,
                title: '🎮 Streamer Rolü Verildi',
                description: `${member.user.tag} kullanıcısına Streamer rolü verildi!`,
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
            console.error('Streamer komutu hatası:', error);
            await message.reply({
                content: '❌ Rol verilirken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 