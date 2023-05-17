import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

const indexData = async (path: string, name: string) => {
  const text = fs.readFileSync(path, "utf8");
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  await vectorStore.save(`vectors/${name}`);
};

const ingest = async () => {
  console.log("Start indexing");
  await indexData("./files/nanozelle-slides.txt", "nanozelle-slides");
  console.log("Done!");
};

ingest();
