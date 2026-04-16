const mongoose = require("mongoose");

const messageHistorySchema = new mongoose.Schema({
	sessionId: {
		type: String,
		unique: true
	},
	messages: [{
		role: String,
		content: String,
		tool_call_id: String,
		name: String
	}]
}, {
	timestamps: true
})

messageHistorySchema.index(
	{ createdAt: 1 },
	{ expireAfterSeconds: 60 }
)

const MessageHistory = mongoose.model("MessageHistory", messageHistorySchema)

module.exports = MessageHistory;