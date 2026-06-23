import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import dotenv from "dotenv";
dotenv.config({})



const embeddings = new OpenAIEmbeddings({
	model: "text-embedding-3-small",
});

const pinecone = new PineconeClient();
// Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(
	embeddings,
	{
		pineconeIndex,
		// Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
		maxConcurrency: 5,
		// You can pass a namespace here too
		// namespace: "foo",
	}
);


export const indexTheDocument = async (filePath) => {
	const loader = new PDFLoader(filePath, { splitPages: false });
	const docs = await loader.load();

	// console.log(docs[0].pageContent); // text content

	const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 100 })
	const texts = await splitter.splitText(docs[0].pageContent)
	console.log(texts.length)

	const documents = texts.map((chunk) => {
		return {
			pageContent: chunk,
			metadata: docs[0].metadata
		}
	})
	await vectorStore.addDocuments(documents);

}



