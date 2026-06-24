import { ChatGroq } from "@langchain/groq"
import { TavilySearch } from "@langchain/tavily";
import { createAgent } from "langchain";
import * as z from "zod"
import { tool } from "langchain"
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



	const calendarEvent = tool(
		({ query }) => JSON.stringify([{ "event": "Meeting with rahul", "date": "24th june 2026", "day": "wednesday" }]),
		{
			name: "get-calendar-event",
			description: "Search the calendar for events",
			schema: z.object({
				query: z.string().describe("Search event to look for"),
			}),
		}
	)

	const agent = createAgent({
		model: llm,
		tools: [webSearch, calendarEvent],
		systemPrompt: "You are a helpful assistant. and you can use web search tool for real time data.",
	});

	const result = await agent.invoke(
		{
			messages: [
				{
					role: "human",
					content: "what is the current weather in mumbai?"
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