import { ChatGroq } from "@langchain/groq";
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import * as z from "zod";
import dotenv from "dotenv"
dotenv.config({})
import { writeFileSync } from "fs";
import readline from "node:readline/promises"


//------------ tools --------------

const webSearch = new TavilySearch({
	maxResults: 5,
	topic: "general",
});


const calendarEvent = tool(
	(state) => {
		return [{ "date": "27-june-2026", "event": "meeting with rahul", "place": "noida cricket stadium" }]
	},
	{
		name: "get-calendar-event",
		description: "get event from calendar",
		schema: z.object({ query: z.string() })
	}
)

const shouldContinue = (state) => {
	const lastMessage = state.messages.at(-1);

	if (lastMessage.tool_calls?.length) {
		return "tools";
	}

	return "__end__";
}

const tools = [webSearch, calendarEvent];

const toolNode = new ToolNode(tools);


//------------------ initializing llm -----------

const model = new ChatGroq({
	model: "openai/gpt-oss-120b",
	temperature: 0,
}).bindTools(tools);

const callingllm = async (state) => {
	const result = await model.invoke(state.messages)
	return { messages: [result] }
}

// -----------making graph---------------------


const graph = new StateGraph(MessagesAnnotation)
	.addNode("llm", callingllm)
	.addNode("tools", toolNode)
	.addEdge("__start__", "llm")
	.addEdge("tools", "llm")
	.addConditionalEdges(
		"llm",
		shouldContinue,
		{
			tools: "tools",
			__end__: END,
		}
	);

const compiledGraph = graph.compile()

const main = async () => {

	//image genration
	const drawableGraph = await compiledGraph.getGraphAsync();
	const image = await drawableGraph.drawMermaidPng();
	writeFileSync(
		"graph.png",
		Buffer.from(await image.arrayBuffer())
	);

	console.log("Graph image saved!");

	//-------------- taking user input --------------

	const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

	while (true) {
		const userInput = await rl.question("You: ")
		if (userInput === "bye") {
			break;
		}

		const result = await compiledGraph.invoke(
			{
				messages: [
					{
						role: "human",
						content: userInput
					}
				]
			}
		)
		const lastMessage = result.messages.at(-1);
		console.log(lastMessage.content);
	}
	rl.close()
}

main()