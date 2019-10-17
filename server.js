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
    GS.board[data.key[0]][data.key[1]].alive = 1;
    GS.board[data.key[0]][data.key[1]].color = [
      data.color.r,
      data.color.g,
      data.color.b
    ];

    GS.liveCells[GS.get_key(data.key[0], data.key[1])] =
      GS.board[data.key[0]][data.key[1]];

    // need to emit the changes to other clients immediately...
    socket.broadcast.emit("otherChangedCell", {
      ind: [data.key[0], data.key[1]],
      color: [data.color.r, data.color.g, data.color.b]
    });
  });

  // On client disconnect, stop game engine and take care of saving resources
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

// start server
http.listen(port, (req, res) => {
  console.log(`server listening on port: ${port}`);
});
