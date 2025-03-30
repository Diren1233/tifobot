const { Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        if (interaction.customId === 'streamer_basvuru') {
            try {
                const modal = new ModalBuilder()
                    .setCustomId('streamer_basvuru_modal')
                    .setTitle('Streamer Başvuru Formu');

                const speedtestInput = new TextInputBuilder()
                    .setCustomId('speedtest_url')
                    .setLabel('Speedtest Sonuç URL\'nizi Yapıştırın')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('https://www.speedtest.net/result/...')
                    .setRequired(true)
                    .setMinLength(30)
                    .setMaxLength(100);

                const firstActionRow = new ActionRowBuilder().addComponents(speedtestInput);
                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);

            } catch (error) {
                console.error('Streamer başvuru modal hatası:', error);
                await interaction.reply({
                    content: '❌ Başvuru formu açılırken bir hata oluştu!',
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'yetki_select') {
            try {
                const roleId = interaction.values[0];
                const message = interaction.message;
                
                // Kullanıcı ID'sini güvenli bir şekilde al
                const description = message.embeds[0].description;
                const userIdMatch = description.match(/\*\*Yetki Verilecek Kullanıcı:\*\* <@!?(\d+)>/);
                if (!userIdMatch) {
                    return await interaction.reply({
                        content: '❌ Kullanıcı bilgisi bulunamadı!',
                        ephemeral: true
                    });
                }
                
                const userId = userIdMatch[1];
                const member = await message.guild.members.fetch(userId).catch(() => null);
                if (!member) {
                    return await interaction.reply({
                        content: '❌ Kullanıcı sunucuda bulunamadı!',
                        ephemeral: true
                    });
                }

                // Yetki kontrolü
                const allowedRoleIds = [
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

                if (!allowedRoleIds.includes(roleId)) {
                    return await interaction.reply({
                        content: '❌ Bu rolü verme yetkiniz yok!',
                        ephemeral: true
                    });
                }

                // Yetki hiyerarşisi kontrolü
                const userRoles = interaction.member.roles.cache;
                const highestRole = userRoles.sort((a, b) => b.position - a.position).first();
                
                if (roleId === '1336023727414186126') {
                    const restrictedRoles = [
                        '1336023734187856088',
                        '1336023733038747730',
                        '1336023731981652150',
                        '1336023730609979495',
                        '1336023729775317012'
                    ];
                    
                    if (restrictedRoles.includes(highestRole.id)) {
                        return await interaction.reply({
                            content: '❌ Bu rolü verme yetkiniz yok! Bu rol sadece daha yüksek yetkili kişiler tarafından verilebilir.',
                            ephemeral: true
                        });
                    }
                }

                const role = message.guild.roles.cache.get(roleId);
                if (!role) {
                    return await interaction.reply({
                        content: '❌ Rol bulunamadı!',
                        ephemeral: true
                    });
                }

                // Rol verme işlemi
                await member.roles.add(role);

                // Otomatik rol verme
                const autoRoleIds = [
                    '1355533597288693821',
                    '1355533486756200500'
                ];

                for (const autoRoleId of autoRoleIds) {
                    const autoRole = message.guild.roles.cache.get(autoRoleId);
                    if (autoRole) await member.roles.add(autoRole);
                }

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle('👑 Yetki Verildi')
                    .setDescription(`**Yetki Verilen:** ${member.user.tag}\n**Verilen Rol:** ${role.name}\n**Yetki Veren:** ${interaction.user.tag}`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ 
                        text: `${message.guild.name} Sunucusu`,
                        iconURL: message.guild.iconURL()
                    });

                await interaction.reply({ embeds: [embed], ephemeral: true });

            } catch (error) {
                console.error('Yetki verme hatası:', error);
                await interaction.reply({
                    content: '❌ Yetki verilirken bir hata oluştu!',
                    ephemeral: true
                });
            }
        }
    }
}; 