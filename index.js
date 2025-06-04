require('dotenv').config()
const express = require('express')

const app = express()
const cors = require('cors');
const port = 3000


app.use(cors());
app.use(express.json())






const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.voaefs5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    const database = client.db("tour-packages");
    const PackagesCollection = database.collection("packages");
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
   
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Booking Management System server ')
})

app.listen(port, () => {
  console.log(`Booking Management system server is listening on port ${port}`)
})


