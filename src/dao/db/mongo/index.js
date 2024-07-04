const mongoose = require("mongoose")
const config = require("../../../config/config")

module.exports = {
    connection: null,
    connect: () => {
        return mongoose.connect(config.MONGO_URL)
        .then(() => {
            console.log('Database connection successful.')
        })
        .catch((err) =>{
            console.error(`Error connecting to the database: ${err}`)
        });
    }
}