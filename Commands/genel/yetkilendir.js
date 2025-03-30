const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'yetkilendir',
    description: 'Belirtilen kullanıcıya yetki verir',
    usage: '.yetkilendir <ID>',
    async execute(message, args) {
        try {
            // Yetki kontrolü
            const allowedRoles = [
                '1355532536708599909',
                '1355532306919456799',
                '1355532875017228508',
                '1355533261295587548'
            ];

            if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                return message.reply({
                    content: '❌ Bu komutu kullanmak için gerekli yetkiye sahip değilsin!',
                    ephemeral: true
                });
            }

            // ID kontrolü
            const userId = args[0];
            if (!userId) {
                return message.reply({
                    content: '❌ Lütfen bir kullanıcı ID\'si belirtin!\nÖrnek: `.yetkilendir 123456789`',
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

            // Kullanıcıyı bul
            const member = await message.guild.members.fetch(userId).catch(() => null);
            if (!member) {
                return message.reply({
                    content: '❌ Belirtilen ID\'ye sahip kullanıcı sunucuda bulunamadı!',
                    ephemeral: true
                });
            }

            // Rolleri al
            const roleIds = [
                '1336023734187856088',
                '1336023733038747730',
                '1336023731981652150',
                '1336023730609979495',
                '1336023729775317012',
                '1336023727414186126',
                '1336023726168342558',
                '1336023724750671956',
                '1336023723563683840',
                '1336023722401726556',
                '1336023721344892990'
            ];

            const roles = {};
            for (const roleId of roleIds) {
                const role = message.guild.roles.cache.get(roleId);
                if (role) {
                    roles[roleId] = {
                        name: role.name,
                        emoji: role.unicodeEmoji || '👑'
                    };
                }
            }

            // Panel oluştur
            const embed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('👑 Yetki Verme Paneli')
                .setDescription(`**Yetki Verilecek Kullanıcı:** ${member}`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ 
                    text: `${message.guild.name} Sunucusu`,
                    iconURL: message.guild.iconURL()
                });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('yetki_select')
                .setPlaceholder('Yetki seçin...')
                .addOptions(
                    Object.entries(roles).map(([id, data]) => ({
                        label: data.name,
                        value: id,
                        description: `${data.name} rolünü vermek için tıklayın`,
                        emoji: data.emoji
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await message.reply({ 
                embeds: [embed], 
                components: [row],
                ephemeral: true 
            });

        } catch (error) {
            console.error('Yetkilendir komutu hatası:', error);
            await message.reply({
                content: '❌ Panel oluşturulurken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 