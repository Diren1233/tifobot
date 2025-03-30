const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Bir kullanıcının yasağını kaldırır',
    usage: '.unban <kullanıcı ID>',
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
                    content: 'Lütfen yasağı kaldırmak istediğiniz kullanıcının ID\'sini belirtin.',
                    ephemeral: true
                });
            }

            const userId = args[0];

            // ID kontrolü
            if (!/^\d+$/.test(userId)) {
                return await message.reply({
                    content: 'Geçerli bir kullanıcı ID\'si belirtin.',
                    ephemeral: true
                });
            }

            // Kullanıcının yasaklı olup olmadığını kontrol et
            try {
                await message.guild.members.unban(userId);
            } catch (error) {
                if (error.code === 10026) { // Unknown Ban
                    return await message.reply({
                        content: 'Bu kullanıcı zaten yasaklı değil.',
                        ephemeral: true
                    });
                }
                throw error;
            }

            // Başarılı mesajı
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Kullanıcı Yasağı Kaldırıldı')
                .setDescription(`<@${userId}> kullanıcısının yasağı kaldırıldı.`)
                .addFields(
                    { name: 'Kullanıcı ID', value: userId },
                    { name: 'Yasağı Kaldıran', value: message.author.tag }
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Unban hatası:', error);
            await message.reply({
                content: 'Ban kaldırılırken bir hata oluştu. Lütfen ID\'nin doğru olduğundan emin olun.',
                ephemeral: true
            });
        }
    }
};