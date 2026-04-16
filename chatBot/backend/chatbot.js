const { Groq } = require('groq-sdk');
require("dotenv").config()
const { tavily } = require("@tavily/core");
const { saveHistory } = require('./services/saveHistory');
const getHistory = require('./services/getHistory');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

genrateResponse = async (userMessage = "HI", sessionId) => {

	const messages = [
		{
			role: "system",
			content: `
            You are a highly reliable and professional AI assistant.

            Your job is to give clear, accurate, and helpful answers to the user's questions.

            Rules you MUST follow:
            - Always understand the user's intent before answering.
            - Give direct and concise answers. Avoid unnecessary long explanations.
            - Do NOT make up facts. If you are unsure, say "I don't know".
            - Do NOT generate weird, irrelevant, or fictional content.
            - Stay focused on the question only.
            - Use simple and easy-to-understand language.
            - If needed, ask a short follow-up question for clarity.

            Tool usage:
            - You have access to a tool: webSearch({query})
            - Use this tool ONLY when:
              - The question requires real-time or external information
              - You are not confident about the answer
            - Do NOT use the tool unnecessarily.

            Behavior:
            - Be polite and professional.
            - Do not include internal reasoning in the response.
            - Do not expose tool usage unless required.

            Output:
            - Respond only with the final answer.
            - No extra metadata, no explanations about your thinking.
            
            `
		},
		{
			"role": "user",
			"content": `${userMessage}`
		}
	]
	console.log("messages", messages)
	const history = await getHistory(sessionId);
	console.log("history", history?.messages)
	if (history) {
		// console.log("pushed")
		messages.push(...history.messages)
	}

	// console.log(messages)

	const max_retires = 5;
	let count = 0;

	while (true) {

		if (count > max_retires) {
			return "Sorry i couldn't find the answer, Please try again later."
		}
		count++;

		const chatCompletion = await groq.chat.completions.create({
			"messages": messages,
			"model": "openai/gpt-oss-120b",
			"temperature": 1,
			"tools": [
				{
					"type": "function",
					"function": {
						"name": "webSearch",
						"description": "Search on the web for given query",
						"parameters": {
							// JSON Schema object
							"type": "object",
							"properties": {
								"query": {
									"type": "string",
									// "description": "City and state, e.g. San Francisco, CA"
								},
							},
							"required": ["query"]
						}
					}
				}
			],
		}
		);
		messages.push(chatCompletion.choices[0]?.message)

		const toolcalls = chatCompletion.choices[0]?.message.tool_calls
		if (!toolcalls) {
			const history = await saveHistory(messages, sessionId)
			return chatCompletion.choices[0]?.message?.content
		}

		for (const tool of toolcalls) {
			const functionName = tool.function.name;
			const functionParams = JSON.parse(tool.function.arguments);

			if (functionName === "webSearch") {
				console.log('searching web ...')
				const toolResult = await webSearch(functionParams)
				messages.push({
					tool_call_id: tool.id,
					role: "tool",
					name: functionName,
					content: toolResult
				})
			}
		}

	}

}

const webSearch = async ({ query }) => {
	const response = await tvly.search(query, { maxResults: 3 });
	const finalResult = response?.results.map((result) => result.content).join('\n\n')
	console.log("final ", finalResult)
	return finalResult
}


module.exports = genrateResponse;

