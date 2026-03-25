import dotenv from "dotenv"
dotenv.config()
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
	const completion = await groq.chat.completions.create({
		model: "llama-3.3-70b-versatile",
		temperature: 0,
		messages: [
			{
				role: "system",
				content: `you are a personal assistant who answer the question asked.you have access to following tools:
				1 webSearch({query}) // search the lastest information and real time data.
				`
			},
			{
				role: "user",
				content: "when was iphone 16 launched?",
			},
		],
		tools: [
			{
				"type": "function",
				"function": {
					"name": "webSearch",
					"description": "search the web for query",
					"parameters": {
						// JSON Schema object
						"type": "object",
						"properties": {
							"query": {
								"type": "string",
								"description": "the search query to perform search on"
							},
						},
						"required": ["query"]
					}
				}
			}
		],
		tool_choice: "auto"
	});
	// console.log(completion.choices[0]?.message?.content);
	const toolcalls = completion.choices[0]?.message.tool_calls;

	if (!toolcalls) {
		console.log(completion.choices[0]?.message?.content);
		return;
	}

	for (const tool of toolcalls) {
		const functionName = tool.function.name;
		const functionParams = tool.function.arguments
		console.log(tool)
		// if (functionName === "webSearch") {
		// 	const result = await webSearch(functionParams)
		// 	console.log(result)
		// }
	}
}


main();

const webSearch = async ({ query }) => {
	return "iphone 16 lunched on 20 sept 2026"
}