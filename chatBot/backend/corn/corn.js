const cron = require("node-cron");
const MessageHistory = require("../models/messageHistory.model");

// console.log("corn imported")
// everyday 12Am midnight
cron.schedule("0 0 * * *", async () => {
	try {
		console.log("Running daily cleanup job...");

		// current time se 24 hours pehle ka time
		const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

		// delete old records
		const result = await MessageHistory.deleteMany({
			createdAt: { $lt: cutoff }
		});

		console.log(`Deleted ${result.deletedCount} old records`);
	} catch (error) {
		console.log("Cron job error:", error.message);
	}
});