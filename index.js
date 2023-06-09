const { createServer } = require("http");

const https = require("https");

const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

const port = process.env.PORT || 3001;
const mongoUri =
  "mongodb+srv://vercel-admin-user:multicls123@cluster0.3kgd1xy.mongodb.net/?retryWrites=true&w=majority";

async function startServer() {
  const client = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db("test");
  const collection = db.collection("products");
  const collectionUser = db.collection("users");

  const httpServer = createServer();

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const userData = socket.handshake.query.email;

    
    if (socket.handshake.query.email) {
      https
        .get(
          "https://multicls-dashborad.vercel.app/api/user?email=" +
            userData +
            "&&status=1",
          (res) => {
            res.on("data", (d) => {
              process.stdout.write(d);
            });
          }
        )
        .on("error", (e) => {
          console.error(e);
        });
    }

    const changeStreamUser = collectionUser.watch();

    changeStreamUser.on("change", (change) => {
      socket.emit("userChange", change);
    });

    const changeStream = collection.watch();
    changeStream.on("change", (change) => {
      socket.emit("productChange", change);
    });

    socket.on("disconnect", () => {
      changeStream.close();
      changeStreamUser.close();

      const userData = socket.handshake.query.email;

      if (userData) {
        https
          .get(
            "https://multicls-dashborad.vercel.app/api/user?email=" +
              userData +
              "&&status=0",
            (res) => {
              res.on("data", (d) => {
                process.stdout.write(d);
              });
            }
          )
          .on("error", (e) => {
            console.error(e);
          });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch(console.error);
