const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'yardım',
    description: 'Tüm komutları ve açıklamalarını gösterir',
    usage: '.yardım [komut]',
    async execute(message, args) {
        const { commands } = message.client;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📚 Komut Listesi')
            .setDescription('Aşağıda kullanabileceğiniz tüm komutlar listelenmiştir.')
            .setTimestamp();

        // Eğer bir komut belirtilmişse, o komutun detaylı açıklamasını göster
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName);

            if (!command) {
                return message.reply({
                    content: 'Bu komut bulunamadı!',
                    ephemeral: true
                });
            }

            embed
                .setTitle(`📖 ${command.name} Komutu`)
                .setDescription(command.description)
                .addFields(
                    { name: 'Kullanım', value: command.usage }
                );

            return message.reply({ embeds: [embed] });
        }

        // Kategorilere göre komutları grupla
        const categories = {
            '🛡️ Moderasyon Komutları': [],
            '👥 Kayıt Komutları': [],
            '📊 İstatistik Komutları': [],
            '🔧 Genel Komutlar': []
        };

        commands.forEach(command => {
            if (command.name === 'ban' || command.name === 'unban' || command.name === 'mute' || 
                command.name === 'vmute' || command.name === 'jail' || command.name === 'clear') {
                categories['🛡️ Moderasyon Komutları'].push(command);
            } else if (command.name === 'register') {
                categories['👥 Kayıt Komutları'].push(command);
            } else if (command.name === 'yetkistat') {
                categories['📊 İstatistik Komutları'].push(command);
            } else {
                categories['🔧 Genel Komutlar'].push(command);
            }
        });

        // Her kategori için komutları ekle
        for (const [category, cmds] of Object.entries(categories)) {
            if (cmds.length > 0) {
                const commandList = cmds.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');
                embed.addFields({ name: category, value: commandList });
            }
        }

        embed.addFields({
            name: '💡 Detaylı Bilgi',
            value: 'Bir komut hakkında detaylı bilgi almak için `.yardım <komut>` şeklinde kullanabilirsiniz.\nÖrnek: `.yardım ban`'
        });

        await message.reply({ embeds: [embed] });
    }
}; 