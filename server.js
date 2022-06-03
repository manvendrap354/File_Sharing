const express = require('express');
const path= require('path')
const cors = require('cors');


const app = express()

const PORT = process.env.PORT || 3000;
const uploadRoute= require('./routes/files')
const download=require('./routes/download')
const downloadRoute=require('./routes/show')

app.use(express.static('public'))
app.use(express.json())

const connectDB = require('./config/db')
connectDB();

//template engine
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

//CORS
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
    // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
  }

  app.use(cors(corsOptions))

app.use('/api/files',uploadRoute)
app.use('/files',downloadRoute )
app.use('/files/download',download)

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}.`);
})