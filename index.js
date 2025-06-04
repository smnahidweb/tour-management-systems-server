require('dotenv').config()
const express = require('express')

const app = express()
const cors = require('cors');
const port = 3000


app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Booking Management System server ')
})

app.listen(port, () => {
  console.log(`Booking Management system server is listening on port ${port}`)
})


