// A szükséges modulok importálása
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// Socket.IO szerver inicializálása
const io = new Server(server);

// A 'public' mappa statikus fájlok (HTML, CSS, kliens JS) kiszolgálására
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Kezeli a főoldalra érkező kéréseket
app.get('/', (req, res) => {
    // A klienst az index.html fájlra irányítja
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// A KULCSFONTOSSÁGÚ RÉSZ: Socket.IO kapcsolatok kezelése
io.on('connection', (socket) => {
    console.log(`A new user connected: ${socket.id}`);

    // Küldünk egy üdvözlő üzenetet az újonnan csatlakozott kliensnek
    socket.emit('welcome', { message: `Welcome to the server! Your ID is ${socket.id}` });

    // Fogadja az 'playerMovement' eseményt a klienstől
    socket.on('playerMovement', (data) => {
        console.log(`Movement received from ${socket.id}: ${JSON.stringify(data)}`);
        
        // **Itt történik a valós idejű kommunikáció:**
        // Visszaküldjük a mozgási adatot az ÖSSZES többi csatlakozott kliensnek
        // a 'movePlayer' eseményen keresztül, kivéve azt, aki küldte.
        socket.broadcast.emit('movePlayer', { 
            id: socket.id, 
            x: data.x, 
            y: data.y 
        });
    });

    // Ha egy felhasználó elhagyja a szervert
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Értesíti az összes többi klienst, hogy ez a játékos kilépett
        io.emit('playerDisconnected', { id: socket.id });
    });
});

// Szerver indítása
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser.`);
});
