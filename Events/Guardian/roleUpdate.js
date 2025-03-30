const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(oldRole, newRole) {
        try {
            // Rol silme kontrolü
            if (!newRole) {
                const auditLogs = await oldRole.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleDelete,
                    limit: 1
                });

                const roleLog = auditLogs.entries.first();
                if (!roleLog) return;

                const { executor } = roleLog;

                // Yetkili roller
                const allowedRoles = [
                    '1355532536708599909',
                    '1355532306919456799'
                ];

                // Yetkili kontrolü
                const member = await oldRole.guild.members.fetch(executor.id);
                if (!member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                    // Rolü geri yükle
                    await oldRole.guild.roles.create({
                        name: oldRole.name,
                        color: oldRole.color,
                        hoist: oldRole.hoist,
                        position: oldRole.position,
                        permissions: oldRole.permissions,
                        mentionable: oldRole.mentionable,
                        reason: 'Guardian: Yetkisiz rol silme işlemi engellendi'
                    });

                    // Log kanalına bildir
                    const logChannel = oldRole.guild.channels.cache.get('1355532536708599909');
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('🛡️ Guardian: Yetkisiz Rol Silme İşlemi Engellendi')
                            .setDescription(`**Silinen Rol:** ${oldRole.name}\n**İşlemi Yapan:** ${executor.tag}\n**Tarih:** ${new Date().toLocaleString('tr-TR')}`)
                            .setThumbnail(executor.displayAvatarURL({ dynamic: true, size: 256 }))
                            .setFooter({ 
                                text: `${oldRole.guild.name} Sunucusu`,
                                iconURL: oldRole.guild.iconURL()
                            });

                        await logChannel.send({ embeds: [embed] });
                    }
                }
            }

            // Rol güncelleme kontrolü
            if (oldRole && newRole) {
                const auditLogs = await newRole.guild.fetchAuditLogs({
                    type: AuditLogEvent.RoleUpdate,
                    limit: 1
                });

                const roleLog = auditLogs.entries.first();
                if (!roleLog) return;

                const { executor } = roleLog;

                // Yetkili roller
                const allowedRoles = [
                    '1355532536708599909',
                    '1355532306919456799'
                ];

                // Yetkili kontrolü
                const member = await newRole.guild.members.fetch(executor.id);
                if (!member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                    // Rolü eski haline getir
                    await newRole.edit({
                        name: oldRole.name,
                        color: oldRole.color,
                        hoist: oldRole.hoist,
                        position: oldRole.position,
                        permissions: oldRole.permissions,
                        mentionable: oldRole.mentionable,
                        reason: 'Guardian: Yetkisiz rol güncelleme işlemi engellendi'
                    });

                    // Log kanalına bildir
                    const logChannel = newRole.guild.channels.cache.get('1355532536708599909');
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('🛡️ Guardian: Yetkisiz Rol Güncelleme İşlemi Engellendi')
                            .setDescription(`**Güncellenen Rol:** ${newRole.name}\n**İşlemi Yapan:** ${executor.tag}\n**Tarih:** ${new Date().toLocaleString('tr-TR')}`)
                            .setThumbnail(executor.displayAvatarURL({ dynamic: true, size: 256 }))
                            .setFooter({ 
                                text: `${newRole.guild.name} Sunucusu`,
                                iconURL: newRole.guild.iconURL()
                            });

                        await logChannel.send({ embeds: [embed] });
                    }
                }
            }
        } catch (error) {
            console.error('Guardian rol güncelleme hatası:', error);
        }
    }
}; 