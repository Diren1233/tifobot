const { Message } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ECONOMY_FILE = path.join(__dirname, '../data/economy.json');

// Kart destesi oluşturma fonksiyonu
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    
    return shuffleDeck(deck);
}

// Desteyi karıştırma fonksiyonu
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// El değeri hesaplama fonksiyonu
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.value === 'A') {
            aces++;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }

    for (let i = 0; i < aces; i++) {
        if (value + 11 <= 21) {
            value += 11;
        } else {
            value += 1;
        }
    }

    return value;
}

// Kart gösterme fonksiyonu
function displayCard(card) {
    return `${card.value}${card.suit}`;
}

// Ekonomi verilerini yükleme
function loadEconomy() {
    try {
        return JSON.parse(fs.readFileSync(ECONOMY_FILE));
    } catch (error) {
        return { users: {} };
    }
}

// Ekonomi verilerini kaydetme
function saveEconomy(data) {
    fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 4));
}

module.exports = {
    name: 'bj',
    description: 'Blackjack oyunu oyna',
    async execute(message, args) {
        // Sadece belirtilen kanalda çalışması için kontrol
        if (message.channelId !== '1355862592878547078') {
            return message.reply('Bu komut sadece özel kanalda kullanılabilir!');
        }

        const betAmount = parseInt(args[0]);
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Lütfen geçerli bir bahis miktarı girin! Örnek: .bj 1000');
        }

        const userId = message.author.id;
        const economy = loadEconomy();

        // Kullanıcının parasını kontrol et
        if (!economy.users[userId]) {
            economy.users[userId] = 1000; // Yeni kullanıcıya başlangıç parası
            saveEconomy(economy);
        }

        if (economy.users[userId] < betAmount) {
            return message.reply(`Yeterli paranız yok! Mevcut paranız: ${economy.users[userId]} AS`);
        }

        // Oyun başlat
        const deck = createDeck();
        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        let result = '';
        let won = false;

        // Blackjack kontrolü
        if (playerValue === 21 && playerHand.length === 2) {
            result = 'Blackjack! Kazandınız!';
            won = true;
        } else if (dealerValue === 21 && dealerHand.length === 2) {
            result = 'Dealer Blackjack! Kaybettiniz!';
            won = false;
        } else {
            // Normal oyun mantığı
            if (playerValue > 21) {
                result = 'Kaybettiniz! 21\'i geçtiniz!';
                won = false;
            } else if (dealerValue > 21) {
                result = 'Kazandınız! Dealer 21\'i geçti!';
                won = true;
            } else if (playerValue > dealerValue) {
                result = 'Kazandınız!';
                won = true;
            } else if (playerValue < dealerValue) {
                result = 'Kaybettiniz!';
                won = false;
            } else {
                result = 'Berabere!';
                won = false;
            }
        }

        // Para güncelleme
        if (won) {
            economy.users[userId] += betAmount;
        } else {
            economy.users[userId] -= betAmount;
        }
        saveEconomy(economy);

        const embed = {
            color: won ? 0x00ff00 : 0xff0000,
            title: 'Blackjack Oyunu',
            fields: [
                {
                    name: 'Sizin Eliniz',
                    value: playerHand.map(displayCard).join(' ') + ` (${playerValue})`,
                    inline: false
                },
                {
                    name: 'Dealer Eli',
                    value: dealerHand.map(displayCard).join(' ') + ` (${dealerValue})`,
                    inline: false
                },
                {
                    name: 'Sonuç',
                    value: result,
                    inline: false
                },
                {
                    name: 'Mevcut Paranız',
                    value: `${economy.users[userId]} AS`,
                    inline: false
                }
            ]
        };

        await message.reply({ embeds: [embed] });
    }
}; 