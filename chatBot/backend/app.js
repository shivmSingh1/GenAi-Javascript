const express = require("express")
const cors = require("cors")
const app = express()
const genrateResponse = require('./chatbot.js')
const dbConnect = require("./config/dbConnect.js")
require("./corn/corn.js")
require("dotenv").config()

app.use(cors())
app.use(express.json())

const PORT = 5000;

app.get("/", (req, res) => {
	console.log("hello")
	return res.json("hello")
})
app.post('/chat', async (req, res) => {
	try {
		console.log("Request received at /chat endpoint")
		const { userMessage, sessionId } = req.body
		// console.log("User message:", userMessage)

		if (!userMessage) {
			return res.status(400).json({ error: "User message is required" })
		}

		const result = await genrateResponse(userMessage, sessionId)
		// console.log("Response from chatbot:", result)
		return res.json({
			sender: 'assistant',
			text: result
		})
	} catch (error) {
		console.error("Error in /chat endpoint:", error)
		return res.status(500).json({ error: error.message })
	}
})

app.listen(PORT, () => {
	dbConnect()
	console.log(`server is listining on port:${PORT}`)
})