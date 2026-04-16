const MessageHistory = require("../models/messageHistory.model")

exports.saveHistory = async (messages, sessionId) => {
	try {
		const existingHistory = await MessageHistory.findOne({ sessionId });

		if (!existingHistory) {
			const newHistory = await MessageHistory.create({ sessionId, messages });
			return newHistory

		}

		const updatedHistory = await MessageHistory.findOneAndUpdate(
			{ sessionId },
			{
				$push: {
					messages: { $each: Array.isArray(messages) ? messages : [messages] }
				}
			},
			{ new: true }
		);

		return updatedHistory;

	} catch (error) {
		console.log("something went wrong while saving message history");
		throw error.message
	}
}