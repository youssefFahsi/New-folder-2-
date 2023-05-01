const { createServer } = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5001;
const mongoUri = "mongodb+srv://vercel-admin-user:multicls123@cluster0.3kgd1xy.mongodb.net/?retryWrites=true&w=majority";

async function startServer() {
  const client = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db("test");
  const collection = db.collection('products');

  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    const changeStream = collection.watch();
    changeStream.on('change', (change) => {
      console.log('change:', change);
      socket.emit('change', change);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      changeStream.close();
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch(console.error);