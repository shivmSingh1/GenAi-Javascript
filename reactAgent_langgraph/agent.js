import { ChatGroq } from "@langchain/groq"
import { TavilySearch } from "@langchain/tavily";
import { createAgent } from "langchain";
import dotenv from "dotenv";

dotenv.config({})

const main = async () => {
	const llm = new ChatGroq({
		model: "openai/gpt-oss-120b",
		temperature: 0,
		// other params...
	})


	const webSearch = new TavilySearch({
		maxResults: 5,
		topic: "general",
	});

	const agent = createAgent({
		model: llm,
		tools: [webSearch],
		systemPrompt: "You are a helpful assistant. and you can use web search tool for real time data.",
	});

	const result = await agent.invoke(
		{
			messages: [
				{
					role: "human",
					content: "what is current weather in lucknow?"
				}
			],
		},
		{
			context: {
				userRole: "expert",
			},
		}
	);

	console.log(result.messages[(result.messages.length - 1)].content)
}

main()