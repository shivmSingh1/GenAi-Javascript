import dotenv from "dotenv"
dotenv.config()
import Groq from "groq-sdk";
import { tavily } from "@tavily/core"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function main() {

	const messages = [
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
	]

	const completion = await groq.chat.completions.create({
		model: "llama-3.3-70b-versatile",
		temperature: 0,
		messages: messages,
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

	messages.push(completion.choices[0]?.message);
	const toolcalls = completion.choices[0]?.message.tool_calls;

	if (!toolcalls) {
		console.log(completion.choices[0]?.message?.content);
		return;
	}

	for (const tool of toolcalls) {
		const functionName = tool.function.name;
		const functionParams = tool.function.arguments
		// console.log(tool)
		messages.push({

		})

		if (functionName === "webSearch") {
			const result = await webSearch(functionParams)
			// console.log(result)
		}
	}

	const completion2 = await groq.chat.completions.create({
		model: "llama-3.3-70b-versatile",
		temperature: 0,
		messages: messages,
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

	console.log("comp2", completion2.choices[0]?.message?.content)
}


main();

const webSearch = async ({ query }) => {
	const response = await tvly.search(query);
	const finalResult = response?.results.map((result) => result.content).join('\n\n')
	return finalResult
}