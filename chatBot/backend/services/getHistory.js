const MessageHistory = require("../models/messageHistory.model")

const getHistory = async (sessionId) => {
	try {
		const history = await MessageHistory.findOne({ sessionId }).select("messages.role messages.content messages.tool_call_id messages.name");
		if (!history || history.messages.length <= 0) {
			return null
		}
		return history
	} catch (error) {
		console.log("something went wrong while getting the message history.", error.message)
	}
}

module.exports = getHistory;
