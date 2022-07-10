require('dotenv').config();
const mongoose = require('mongoose');
function connectDB() {
    // Database connection 
    mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true},
        () => {console.log(mongoose.connection.readyState)
            console.log('Connected to Database')
        });
   
}

module.exports = connectDB;
