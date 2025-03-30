const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Botun ping değerini gösterir',
    usage: '.ping',
    async execute(message) {
        try {
            const sent = await message.reply({ content: 'Ping ölçülüyor...' });
            const latency = sent.createdTimestamp - message.createdTimestamp;
            const apiLatency = Math.round(message.client.ws.ping);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: '📡 Bot Gecikmesi', value: `${latency}ms`, inline: true },
                    { name: '🌐 API Gecikmesi', value: `${apiLatency}ms`, inline: true }
                )
                .setTimestamp();

            await sent.edit({ content: null, embeds: [embed] });
        } catch (error) {
            console.error('Ping hatası:', error);
            await message.reply({
                content: 'Ping ölçülürken bir hata oluştu!',
                ephemeral: true
            });
        }
    }
};