const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'register',
    description: 'Kullanıcıyı kayıt eder',
    usage: '.register <@kullanıcı> <erkek/kadın>',
    async execute(message, args) {
        try {
            // Kayıt yetkisi kontrolü
            const hasRegisterRole = message.member.roles.cache.has('1336023742186520648');
            if (!hasRegisterRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Yetki Hatası')
                    .setDescription('Bu komutu kullanmak için kayıt yetkisine sahip olmalısınız.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            // Argüman kontrolü
            if (args.length < 2) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kullanım Hatası')
                    .setDescription('Doğru kullanım: `.register <@kullanıcı> <erkek/kadın>`')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            const targetUser = message.mentions.users.first();
            if (!targetUser) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Kullanıcı Bulunamadı')
                    .setDescription('Lütfen geçerli bir kullanıcı etiketleyin.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            const member = await message.guild.members.fetch(targetUser.id);
            const gender = args[1].toLowerCase();

            // Cinsiyet kontrolü
            if (gender !== 'erkek' && gender !== 'kadın') {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Geçersiz Cinsiyet')
                    .setDescription('Lütfen "erkek" veya "kadın" olarak belirtin.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            // Rolleri bul
            const maleRole = message.guild.roles.cache.find(role => 
                role.name.toLowerCase().includes('erkek') || 
                role.name.toLowerCase().includes('male')
            );
            const femaleRole = message.guild.roles.cache.find(role => 
                role.name.toLowerCase().includes('kadın') || 
                role.name.toLowerCase().includes('female')
            );

            if (!maleRole || !femaleRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Rol Bulunamadı')
                    .setDescription('Erkek veya kadın rolleri bulunamadı.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            // Kayıtsız rolünü bul
            const unregisteredRole = message.guild.roles.cache.find(role => 
                role.name.toLowerCase().includes('kayıtsız') || 
                role.name.toLowerCase().includes('unregistered')
            );

            if (!unregisteredRole) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Rol Bulunamadı')
                    .setDescription('Kayıtsız rolü bulunamadı.')
                    .setTimestamp();
                
                return await message.reply({ embeds: [errorEmbed] });
            }

            // Rolleri güncelle
            await member.roles.remove(unregisteredRole);
            await member.roles.add(gender === 'erkek' ? maleRole : femaleRole);

            // İsim güncelleme
            const newNickname = `・${targetUser.username}`;
            await member.setNickname(newNickname);

            // Başarılı mesajı
            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Kayıt Başarılı')
                .setDescription(`${targetUser.tag} kullanıcısı başarıyla kayıt edildi.`)
                .addFields(
                    { name: '👤 Kullanıcı', value: targetUser.tag, inline: true },
                    { name: '🎭 Cinsiyet', value: gender === 'erkek' ? 'Erkek' : 'Kadın', inline: true },
                    { name: '👮 Kaydeden', value: message.author.tag, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Kayıt Sistemi', iconURL: message.guild.iconURL() });

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Kayıt hatası:', error);
            await message.reply({
                content: 'Kayıt işlemi sırasında bir hata oluştu!',
                ephemeral: true
            });
        }
    }
}; 