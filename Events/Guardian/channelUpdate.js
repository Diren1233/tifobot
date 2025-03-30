const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: Events.ChannelUpdate,
    async execute(oldChannel, newChannel) {
        try {
            const auditLogs = await newChannel.guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelUpdate,
                limit: 1
            });

            const channelLog = auditLogs.entries.first();
            if (!channelLog) return;

            const { executor } = channelLog;

            // Yetkili roller
            const allowedRoles = [
                '1355532536708599909',
                '1355532306919456799'
            ];

            // Yetkili kontrolü
            const member = await newChannel.guild.members.fetch(executor.id);
            if (!member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                // Kanalı eski haline getir
                await newChannel.edit({
                    name: oldChannel.name,
                    type: oldChannel.type,
                    topic: oldChannel.topic,
                    nsfw: oldChannel.nsfw,
                    parent: oldChannel.parent,
                    permissionOverwrites: oldChannel.permissionOverwrites.cache,
                    rateLimitPerUser: oldChannel.rateLimitPerUser,
                    reason: 'Guardian: Yetkisiz kanal güncelleme işlemi engellendi'
                });

                // Log kanalına bildir
                const logChannel = newChannel.guild.channels.cache.get('1355532536708599909');
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('🛡️ Guardian: Yetkisiz Kanal Güncelleme İşlemi Engellendi')
                        .setDescription(`**Güncellenen Kanal:** ${newChannel.name}\n**İşlemi Yapan:** ${executor.tag}\n**Tarih:** ${new Date().toLocaleString('tr-TR')}`)
                        .setThumbnail(executor.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setFooter({ 
                            text: `${newChannel.guild.name} Sunucusu`,
                            iconURL: newChannel.guild.iconURL()
                        });

                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Guardian kanal güncelleme hatası:', error);
        }
    }
}; 