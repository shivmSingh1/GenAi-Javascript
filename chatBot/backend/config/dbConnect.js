const mongoose = require("mongoose")
require("dotenv").config()

const dbConnect = async () => {
	try {
		const connect = await mongoose.connect(process.env.MONGO_URL)
		console.log("Database connected successfully");
	} catch (error) {
		console.log("something went wrong while connecting to DB", error.message)
	}
}

module.exports = dbConnect;