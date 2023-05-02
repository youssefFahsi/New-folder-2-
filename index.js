const { createServer } = require("http");
const http = require("http");

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
    const index = socket.handshake.headers?.cookie?.indexOf(
      "next-auth.session-token="
    );
    const length = "next-auth.session-token=".length;
    const userData = socket.handshake.headers?.cookie?.slice(index + length);
    if (userData?.length === 36) {
      console.log("a user connected");

      
        


        
        https.get('https://multicls-dashborad.vercel.app/api/user?UserId=' + userData+"&&status=1", (res) => {
          console.log('statusCode:', res.statusCode);
        
          res.on('data', (d) => {
            process.stdout.write(d);
          });
        }).on('error', (e) => {
          console.error(e);
        });


    }

    const changeStream = collection.watch();
    changeStream.on("change", (change) => {
      console.log("change:", change);
      socket.emit("change", change);
    });

    const changeStreamUser = collectionUser.watch();

    changeStreamUser.on("change", (change) => {
      console.log("changeUser:", change);
      socket.emit("change", change);
    });


    socket.on("disconnect", () => {

      changeStream.close();
      changeStreamUser.close()


      if (userData?.length === 36) {

     


        https.get('https://multicls-dashborad.vercel.app/api/user?UserId=' + userData+"&&status=0", (res) => {
          console.log('statusCode:', res.statusCode);
        
          res.on('data', (d) => {
            process.stdout.write(d);
          });
        }).on('error', (e) => {
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
