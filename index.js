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
var admin = require("firebase-admin");

var serviceAccount = require("./firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// jwt middlewear
const firebaseToken = async(req,res,next)=>{
  const authHeaders = req.headers.authorization;
 
  if(!authHeaders || !authHeaders.startsWith('Bearer ')){
   return res.status(401).send({message: 'UnAuthorization access' })
  }
  const token = authHeaders.split(' ')[1]
  console.log('Token in the middlewar',token)

  try{
 const decoded = await admin.auth().verifyIdToken(token)
 console.log('Decoded data',decoded)
 req.decoded = decoded;
   next()
  }
  catch(error){
    return res.status(401).send({message: 'UnAuthorization access' })
  }


}

async function run() {
  try {
    
    
    const database = client.db("tour-packages");
    const PackagesCollection = database.collection("packages");
    const BookingCollection = database.collection('booking')
    const ReviewsCollection = database.collection('reviews');


// post packages
app.post('/allPackages', firebaseToken, async(req,res)=>{
  const allPlants = req.body;
  

  const result = await PackagesCollection.insertOne(allPlants)
  res.send(result)

})
// post reviews
app.post('/reviews', firebaseToken, async(req,res)=>{
  const allReviews = req.body;
  const result = await ReviewsCollection.insertOne(allReviews)
  res.send(result)
})
app.get('/reviews',async(req,res)=>{
  const result = await ReviewsCollection.find().toArray()
  res.send(result)
})

app.get('/allPackages', async (req, res) => {
  try {
    const { sort } = req.query;
     console.log('Incoming sort:', sort);
    // Define sort option
    let sortOption = {};
    if (sort === 'asc') {
      sortOption = { price: 1 };
    } else if (sort === 'desc') {
      sortOption = { price: -1 };
    }

    // Apply sorting in MongoDB query
    const result = await PackagesCollection.find().sort(sortOption).toArray();
    res.send(result);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    res.status(500).send({ error: "Failed to load packages" });
  }
});



app.get('/tour-short', async (req, res) => {
  const result = await PackagesCollection.find({
    duration: { $regex: /^(1|2)\s?Days?/i }
  }).toArray();

  res.send(result);
});


app.get('/mid-tour', async (req, res) => {
  const result = await PackagesCollection.find({
    duration: { $regex: /^(3|4|5)\s?Days?/i }
  }).toArray();

  res.send(result);
});



// get a specific package
app.get('/allPackages/:id', firebaseToken, async(req,res)=>{

  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const result = await PackagesCollection.findOne(quary)
  res.send(result)


})

// get a specific packages based on email
app.get('/myPackages', firebaseToken, async(req,res)=>{
  const email = req.query.email;
  if(email !== req.decoded.email){
    return res.status(403).send({message:'Forbidden Access'})
  }
  const query = { guideEmail: email }
  const result = await PackagesCollection.find(query).toArray();
 
  res.send(result)

})

// Update a packages 
app.put('/allPackages/:id', firebaseToken, async(req,res)=>{
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
app.delete('/allPackages/:id', firebaseToken, async(req,res)=>{

  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const result = await PackagesCollection.deleteOne(quary)
  res.send(result)

})


// post for Booing Data
app.post('/bookings',  firebaseToken, async(req,res)=>{
  const allBooking = req.body;
  const result = await BookingCollection.insertOne(allBooking)
  res.send(result)

})
app.get('/bookingsCount', async (req, res) => {
  const count = await BookingCollection.estimatedDocumentCount();
  res.send({ total: count });
});

app.patch('/allPackages/:id/increment', firebaseToken, async(req,res)=>{
  const id = req.params.id;
  const result = await PackagesCollection.updateOne(
    {_id: new ObjectId(id)},
    {
      $inc:{
        bookingCount:1
      }
    }
  )
  res.send(result)
})

app.get('/bookings', firebaseToken,  async(req,res)=>{
  const result = await BookingCollection.find().toArray()
  res.send(result)
})
app.get('/bookings/:id', firebaseToken, async(req,res)=>{
  const id = req.params.id;
  const quary = {_id: new ObjectId(id)}
  const result = await BookingCollection.findOne(quary)
  res.send(result)

})

// GET /popularTours
app.get('/popularTours', async (req, res) => {
  try {
    const result = await PackagesCollection.find()
      .sort({ bookingCount: -1 }) // descending
      .limit(10)
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch popular tours" });
  }
});



// get a specific booking data filtered by email
app.get('/myBookings', firebaseToken, async (req, res) => {
  const email = req.query.email;
  
  if(email !== req.decoded.email){
    return res.status(403).send({message: 'Forbidden Access'})
  }

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
  
});

app.patch('/bookings/:id', firebaseToken, async(req,res)=>{
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


