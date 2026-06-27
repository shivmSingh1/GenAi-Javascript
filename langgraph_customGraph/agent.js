import { ChatGroq } from "@langchain/groq";
import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatGroq({
	model: "openai/gpt-oss-120b",
	temperature: 0,
});

const cutTheVegitables = (state) => {
	console.log("cutting vegitables..")
	return state
}

const boilTheRice = (state) => {
	console.log("Rice is boiling.")
	return state
}

const addingSalt = (state) => {
	console.log("Adding stalt")
	return state
}

const tasteTheBiryani = (state) => {
	console.log("tasting biryani..")
	return state
}

const conditionalRoute = (state) => {
	if (true) {
		return "__end__"
	} else {
		return "addSalt"
	}
}

const graph = new StateGraph(MessagesAnnotation)
	.addNode("cutTheVegitables", cutTheVegitables)
	.addNode("boilTheRice", boilTheRice)
	.addNode("addSalt", addingSalt)
	.addNode("tasteTheBiryani", tasteTheBiryani)
	.addEdge("__start__", "cutTheVegitables")
	.addEdge('cutTheVegitables', "boilTheRice")
	.addEdge("boilTheRice", "addSalt")
	.addEdge("addSalt", "tasteTheBiryani")
	.addConditionalEdges("tasteTheBiryani", conditionalRoute, {
		"__end__": END,
		"addSalt": "addSalt"
	})

const biryaniProcess = graph.compile()


const main = async () => {
	// const result = await model.invoke([
	// 	{
	// 		role: "human",
	// 		content: "Hi",
	// 	},
	// ]);

	// console.log(result.content);

	const result = await biryaniProcess.invoke({ messages: [] });
	console.log("result", result)
};

main();