const express = require('express');
const server = express();

server.all('/', (req, res) => {
    res.send('Bot aktif!');
});

function keepAlive() {
    server.listen(3000, () => {
        console.log('Server hazır!');
    });
}

module.exports = keepAlive; 