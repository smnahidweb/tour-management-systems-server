require('dotenv').config()
const express = require('express')

const app = express()
const cors = require('cors');
const port = 3000


app.use(cors());
app.use(express.json())






const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const BookingCollection = database.collection('booking')


// post packages
app.post('/allPackages',async(req,res)=>{
  const allPlants = req.body;
  const result = await PackagesCollection.insertOne(allPlants)
  res.send(result)

})

app.get('/allPackages',async(req,res)=>{
  const result = await PackagesCollection.find().toArray()
  res.send(result)
})


// get a specific package
app.get('/allPackages/:id',async(req,res)=>{

  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const result = await PackagesCollection.findOne(quary)
  res.send(result)


})

// get a specific packages based on email
app.get('/myPackages',async(req,res)=>{
  const email = req.query.email;
  const query = { guideEmail: email }
  const result = await PackagesCollection.find(query).toArray();
  res.send(result)

})

// Update a packages 
app.put('/allPackages/:id',async(req,res)=>{
  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const {
     tourName,
    imageUrl,
    duration,
    price,
    departureLocation,
    destination,
    departureDate,
    contactNo,
    guideName,
    guidePhoto,
    guideEmail,
    packageDetails
  } = req.body

  const updatedDoc ={
    $set:{
    tourName,
    imageUrl,
    duration,
    price,
    departureLocation,
    destination,
    departureDate,
    contactNo,
    guideName,
    guidePhoto,
    guideEmail,
    packageDetails
    }

  }
  const result = await PackagesCollection.updateOne(quary,updatedDoc)
  res.send(result)
})


// delete 
app.delete('/allPackages/:id',async(req,res)=>{

  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const result = await PackagesCollection.deleteOne(quary)
  res.send(result)
   



})


// post for Booing Data
app.post('/bookings',async(req,res)=>{
  const allBooking = req.body;
  const result = await BookingCollection.insertOne(allBooking)
  res.send(result)

})

app.get('/bookings',async(req,res)=>{
  const result = await BookingCollection.find().toArray()
  res.send(result)
})
app.get('/bookings/:id',async(req,res)=>{
  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const result = await BookingCollection.findOne(quary)
  res.send(result)

})

// get a specific booking data filtered by email
app.get('/myBookings', async (req, res) => {
  const email = req.query.email;

  const query = {
    buyerEmail: email
  };
  
  const result = await BookingCollection.find(query).toArray();

 
 
  for(const booking of result){
   
    const tourId = booking.tourId
    const PackageId = { _id: new ObjectId(tourId)}
    const packageData = await PackagesCollection.findOne(PackageId);

   
      
    if(packageData){
         booking.departureLocation = packageData.departureLocation;
      booking.departureDate = packageData.departureDate;
      booking.contactNo = packageData.contactNo;
      booking.guideName = packageData.guideName;
      booking.destination = packageData.destination;
    }
      
     
    
  }

  res.send(result);
  console.log(result)
});

app.patch('/bookings/:id',async(req,res)=>{
const id = req.params.id
const filter = {_id: new ObjectId(id)}
const {status} = req.body;
const UpdatedStatus ={
  $set:{
    status : status
  }
}
const result = await BookingCollection.updateOne(filter,UpdatedStatus)
res.send(result)

})









   
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


