const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: Events.GuildUpdate,
    async execute(oldGuild, newGuild) {
        try {
            const auditLogs = await newGuild.fetchAuditLogs({
                type: AuditLogEvent.GuildUpdate,
                limit: 1
            });

            const guildLog = auditLogs.entries.first();
            if (!guildLog) return;

            const { executor } = guildLog;

            // Yetkili roller
            const allowedRoles = [
                '1355532536708599909',
                '1355532306919456799'
            ];

            // Yetkili kontrolü
            const member = await newGuild.members.fetch(executor.id);
            if (!member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                // Sunucu ayarlarını eski haline getir
                await newGuild.edit({
                    name: oldGuild.name,
                    icon: oldGuild.iconURL(),
                    banner: oldGuild.bannerURL(),
                    description: oldGuild.description,
                    verificationLevel: oldGuild.verificationLevel,
                    explicitContentFilter: oldGuild.explicitContentFilter,
                    defaultMessageNotifications: oldGuild.defaultMessageNotifications,
                    systemChannel: oldGuild.systemChannel,
                    systemChannelFlags: oldGuild.systemChannelFlags,
                    reason: 'Guardian: Yetkisiz sunucu güncelleme işlemi engellendi'
                });

                // Log kanalına bildir
                const logChannel = newGuild.channels.cache.get('1355532536708599909');
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🛡️ Guardian: Yetkisiz Sunucu Güncelleme İşlemi Engellendi')
                        .setDescription(`**Sunucu:** ${newGuild.name}\n**İşlemi Yapan:** ${executor.tag}\n**Tarih:** ${new Date().toLocaleString('tr-TR')}`)
                        .setThumbnail(executor.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ 
                            text: `${newGuild.name} Sunucusu`,
                            iconURL: newGuild.iconURL()
                        });

                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Guardian sunucu güncelleme hatası:', error);
        }
    }
}; 