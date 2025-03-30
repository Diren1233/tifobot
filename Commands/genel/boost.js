const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'boost',
    description: 'Kullanıcının kendi ismini değiştirir',
    usage: '.boost <yeni isim>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            if (!message.member.roles.cache.has('1297619445845332141')) {
                return message.reply({
                    content: '❌ Bu komutu kullanmak için gerekli role sahip değilsin!',
                    ephemeral: true
                });
            }

            // Yeni isim kontrolü
            const newName = args.join(' ');
            if (!newName) {
                return message.reply({
                    content: '❌ Lütfen yeni isminizi belirt!',
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

            // Kullanıcı ismini değiştir
            await message.member.setNickname(newName);

            const embed = {
                color: 0x2b2d31,
                title: '🚀 İsim Değiştirildi',
                description: `İsminiz başarıyla değiştirildi!\n\n**Eski İsim:** ${message.member.displayName}\n**Yeni İsim:** ${newName}`,
                thumbnail: {
                    url: message.author.displayAvatarURL({ dynamic: true, size: 256 })
                },
                footer: {
                    text: `${message.guild.name} Sunucusu`,
                    icon_url: message.guild.iconURL()
                }
            };

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Boost komutu hatası:', error);
            await message.reply({
                content: '❌ İsim değiştirilirken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 