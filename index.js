const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("views"));

app.set("view engine", "ejs");

io.on("connection", (socket) => {
  console.log("a user connected");

  // Listen for chat messages from the client
  socket.on("chat message", (message) => {
    // Broadcast the message to all connected clients
    io.emit("chat message", { msg: message, id: socket.id });
  });

  socket.on("image send", (data) => {
    // Broadcast the message to all connected clients
    io.emit("image send", {
      url: data.url,
      type: data.type,
      leng: data.leng,
      id: socket.id,
    });
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

http.listen(3000, () => {
  console.log("listening on port 3000");
});
