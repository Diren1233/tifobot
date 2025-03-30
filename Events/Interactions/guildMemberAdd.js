const { Events, ChannelType, joinVoiceChannel } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        try {
            console.log('Yeni üye katıldı:', member.user.tag);
            console.log('Sunucu ID:', member.guild.id);
            console.log('Kanal ID:', '1336023908117381212');

            // Hoş geldin mesajı
            const welcomeMessage = `ASHIM Bakım Hoş Geldin, <a:konfeti:1352657813775712397> ${member} Seninle beraber sunucumuz ${member.guild.memberCount} üye sayısına ulaştık\n` +
                `<:alt:1352657783144714353> Hesabın ${member.user.createdAt.toLocaleString('tr-TR')} tarihinde oluşturulmuş Güvenli Hesap! <a:green:1352744536790663258>\n\n` +
                `Kayıt işleminden sonra <#1336023918372454462> kanalına göz atmayı unutmayın.\n\n` +
                `<#1336023909774000220> Kanalına katılarak "İsminizi" vererek kayıt olabilirsiniz,\n\n` +
                `<@&1336023742186520648> kayıt yetkililerimiz gelecektir.`;

            // Tüm kanalları listele
            console.log('Sunucudaki tüm kanallar:');
            member.guild.channels.cache.forEach(channel => {
                console.log(`Kanal: ${channel.name} (${channel.id})`);
            });

            // Hoş geldin kanalını bul
            const welcomeChannel = member.guild.channels.cache.get('1336023908117381212');
            console.log('Hoş geldin kanalı:', welcomeChannel ? `Bulundu: ${welcomeChannel.name}` : 'Bulunamadı');

            if (welcomeChannel) {
                try {
                    // Mesajı gönder
                    const sentMessage = await welcomeChannel.send({
                        content: welcomeMessage,
                        allowedMentions: {
                            parse: ['users', 'roles']
                        }
                    });
                    console.log('Mesaj başarıyla gönderildi:', sentMessage.id);
                } catch (error) {
                    console.error('Mesaj gönderme hatası:', error.message);
                    console.error('Hata detayı:', error);
                }
            } else {
                console.error('Hoş geldin kanalı bulunamadı! Lütfen kanal ID\'sini kontrol edin.');
            }

            // Kayıt kanalını bul
            const registerChannel = member.guild.channels.cache.find(channel => 
                channel.name.toLowerCase().includes('kayıt') || 
                channel.name.toLowerCase().includes('register')
            );
            console.log('Kayıt kanalı bulundu:', registerChannel ? 'Evet' : 'Hayır');

            if (registerChannel) {
                // Kayıt ses kanalına hoş geldin mesajı
                const voiceWelcomeMessage = `🎤 Kayıt Ses Kanalı\n\n` +
                    `${member} kayıt ses kanalına hoş geldin!\n\n` +
                    `📝 Kayıt İşlemi\n` +
                    `<@&1336023742186520648> yetkililerimiz sizi kayıt edene kadar burada bekleyiniz.\n\n` +
                    `⚠️ Önemli\n` +
                    `• Mikrofonunuzun açık olduğundan emin olun\n` +
                    `• Yetkili gelene kadar bekleyin\n` +
                    `• Gereksiz ses çıkarmayın`;

                try {
                    await registerChannel.send({
                        content: voiceWelcomeMessage,
                        allowedMentions: {
                            parse: ['users', 'roles']
                        }
                    });
                    console.log('Kayıt kanalı mesajı gönderildi');
                } catch (error) {
                    console.error('Kayıt kanalı mesajı gönderme hatası:', error);
                }
            }

            // Kayıt ses kanalını bul
            const registerVoiceChannel = member.guild.channels.cache.find(channel => 
                channel.type === ChannelType.GuildVoice && 
                (channel.name.toLowerCase().includes('kayıt') || 
                channel.name.toLowerCase().includes('register'))
            );
            console.log('Kayıt ses kanalı bulundu:', registerVoiceChannel ? 'Evet' : 'Hayır');

            if (registerVoiceChannel) {
                try {
                    // Kullanıcıyı kayıt ses kanalına yönlendir
                    await member.voice.setChannel(registerVoiceChannel);
                    console.log('Kullanıcı ses kanalına yönlendirildi');

                    // Bot'u ses kanalına katıl
                    try {
                        const connection = joinVoiceChannel({
                            channelId: registerVoiceChannel.id,
                            guildId: member.guild.id,
                            adapterCreator: member.guild.voiceAdapterCreator,
                            selfDeaf: false,
                            selfMute: true
                        });

                        // Bağlantı olaylarını dinle
                        connection.on('stateChange', (oldState, newState) => {
                            console.log(`Ses bağlantı durumu değişti: ${oldState.status} -> ${newState.status}`);
                        });

                        connection.on('error', (error) => {
                            console.error('Ses bağlantı hatası:', error);
                        });

                        console.log('Bot ses kanalına katıldı');

                        // 30 saniye sonra bot'u kanaldan çıkar
                        setTimeout(async () => {
                            try {
                                if (connection.state.status !== 'destroyed') {
                                    connection.destroy();
                                    console.log('Bot ses kanalından ayrıldı');
                                }
                            } catch (error) {
                                console.error('Bot ses kanalından ayrılma hatası:', error);
                            }
                        }, 30000);

                    } catch (voiceError) {
                        console.error('Bot ses kanalına katılma hatası:', voiceError);
                        // Ses hatası olsa bile diğer işlemlere devam et
                    }

                } catch (error) {
                    console.error('Ses kanalı işlemleri hatası:', error);
                }
            }

            // Kayıtsız rolünü ver
            const unregisteredRole = member.guild.roles.cache.get('1336070224327479380');
            console.log('Kayıtsız rolü bulundu:', unregisteredRole ? `Evet: ${unregisteredRole.name}` : 'Hayır');

            if (unregisteredRole) {
                try {
                    await member.roles.add(unregisteredRole);
                    console.log('Kayıtsız rolü verildi');
                } catch (error) {
                    console.error('Rol verme hatası:', error);
                }
            } else {
                console.error('Kayıtsız rolü bulunamadı! Lütfen rol ID\'sini kontrol edin.');
            }

        } catch (error) {
            console.error('Genel hata:', error.message);
            console.error('Hata detayı:', error);
        }
    },
}; 