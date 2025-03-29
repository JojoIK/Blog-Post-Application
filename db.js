const mongoose = require("mongoose")

const dbConnect = async (req, res) => {
    await mongoose.connect(process.env.MONGO)
        .then(() => console.log('Connected to DB'))
        .catch(err => console.error(`MongoDB connection error: ${err}`))
}


module.exports = dbConnect;