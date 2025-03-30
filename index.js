const {Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, Events, ActionRowBuilder, ButtonStyle} = require('discord.js');
const keepAlive = require('./keepAlive.js');
require('dotenv').config();

const {Guilds, GuildMembers, GuildMessages, MessageContent, GuildMessageReactions, GuildModeration, GuildVoiceStates} = GatewayIntentBits;
const {User, Message, GuildMember, ThreadMember, Channel, DirectMessages} = Partials;

const {loadEvents} = require('./Handlers/eventHandler');
const {loadCommands} = require('./Handlers/commandHandler');

const client = new Client({
    intents: [
        Guilds,
        GuildMembers,
        GuildMessages,
        GuildVoiceStates,
        MessageContent,
        GuildMessageReactions,
        GuildModeration
    ],
    partials: [User, Message, GuildMember, ThreadMember, Channel, DirectMessages],
    allowedMentions: {
        repliedUser: false,
    },
    restRequestTimeout: 60000,
    ws: {
        properties: {
            browser: 'Discord iOS'
        }
    }
});

// Komutları ve eventleri yükle
client.commands = new Collection();
client.config = require('./config.json');

process.on('unhandledRejection', error => {
    console.error('Yakalanmamış hata:', error);
});

client.on("ready", async () => {
    console.log("Now Online: " + client.user.tag);
    keepAlive(); // KeepAlive sistemini başlat
    
    // Komutları ve eventleri yükle
    await loadCommands(client);
    await loadEvents(client);
    
    console.log('Komutlar ve eventler yüklendi!');
});

client.on('guildCreate', guild => {
    const defaultChannel = guild.systemChannel;
    if (defaultChannel) {
        const embed = new EmbedBuilder()
        .setColor('#e01444')
        .setTitle('Merhaba!')
        .setDescription("Beni sunucuna eklediğin için teşekkürler!\n'.' ön ekini kullanarak komutları çağırabilirsin.\n\nHerhangi bir kanala '.yardım' yazarak komutları görebilirsin :)");
        defaultChannel.send({ embeds: [embed] });
    }
});

const { joinVoiceChannel } = require('@discordjs/voice');
client.on('ready', () => { 
    joinVoiceChannel({
        channelId: "1355343038175772754",
        guildId: "1296927427846733967",       
        adapterCreator: client.guilds.cache.get("1296927427846733967").voiceAdapterCreator
    });
});

// Botu başlat
client.login(process.env.DISCORD_TOKEN);