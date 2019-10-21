const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http);
const port = process.env.PORT || 5000;
const GameService = require("./ServerDependencies/services/game-service").getGameService();

GS = new GameService(io);
GS.setup();

// Static file declaration
app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

io.on("connection", function(socket) {
  let clientCount = io.sockets.server.engine.clientsCount;
  if (clientCount === 1 && !GS.gameRunning) {
    // start game engine on server
    GS.runGame();
  }

  // letting all clients know the number of windows/players
  io.emit("numOfPlayersChanged", { clients: clientCount, increased: true });

  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  console.log("a user connected");

  // When a client connects then send it the current game state
  const curLiveCells = GS.getCurrentGameState();
  if (curLiveCells.length > 0) {
    socket.emit("newGameState", curLiveCells);
  }

  // When a cell changes then apply changes in server board and broadcast it to other clients
  socket.on("cellChanged", function(data) {
    console.log("cell changed");
    let row = data.key[0];
    let col = data.key[1];

    GS.board[row][col].alive = 1;
    GS.board[row][col].color = [data.color.r, data.color.g, data.color.b];

    // storing cell in live cells key-val store
    GS.liveCells[GS.get_key(row, col)] = GS.board[row][col];

    // need to emit the changes to other clients immediately...
    socket.broadcast.emit("otherChangedCell", {
      ind: [row, col],
      color: [data.color.r, data.color.g, data.color.b]
    });
  });

  // On client disconnect, stop game engine
  socket.on("disconnect", function() {
    let clientCount = io.sockets.server.engine.clientsCount;
    io.emit("numOfPlayersChanged", {
      clients: clientCount,
      increased: false
    });
    console.log("user disconnected");
  });
});

// start server
http.listen(port, (req, res) => {
  console.log(`server listening on port: ${port}`);
});
