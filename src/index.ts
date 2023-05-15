import * as dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { SETTINGS, qa_template, question_generator_template } from "./settings";

import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";

const prisma = new PrismaClient();

const token = process.env.TELEGRAM_BOT_TOKEN as string;

const generateBotResponse = async (
  chatId: string,
  message: string
): Promise<string> => {
  const llm = new OpenAI();

  const vectorStore = await HNSWLib.load(
    `vectors/nanozelle-slides`,
    new OpenAIEmbeddings()
  );

  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    vectorStore.asRetriever(),
    {
      questionGeneratorTemplate: question_generator_template,
      qaTemplate: qa_template,
    }
  );

  const messages: BaseChatMessage[] = [new SystemChatMessage(SETTINGS)];

  const storedMessages = await prisma.conversations.findMany({
    where: {
      chat_id: chatId,
    },
  });
  for (let msg of storedMessages) {
    if (msg.speaker === "user") {
      messages.push(new HumanChatMessage(msg.message));
    } else {
      messages.push(new AIChatMessage(msg.message));
    }
  }

  messages.push(new HumanChatMessage(message));

  const response = await chain
    .call({
      question: message,
      chat_history: messages,
    })
    .then((res) => res.text);
  // const botResponse = await llm.call(messages).then((res) => res.text);
  return response;
};

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", async (msg) => {
  if (!msg.text) {
    return;
  }

  if (msg.text === "/eotw") {
    if (Date.now() / 1000 - msg.date > 3) {
      return;
    }
    await bot.sendMessage(msg.chat.id, "OK bye!");
    process.exit(0);
  }

  let response = "Hãy đặt câu hỏi cho tôi về sản phẩn Nanozelle.";
  await bot.sendChatAction(msg.chat.id, "typing");

  if (msg.text !== "/start") {
    response = await generateBotResponse(msg.chat.id.toString(), msg.text);
  }

  bot.sendMessage(msg.chat.id, response);
  await prisma.conversations.create({
    data: {
      chat_id: msg.chat.id.toString(),
      speaker: "user",
      message: msg.text as string,
    },
  });
  await prisma.conversations.create({
    data: {
      chat_id: msg.chat.id.toString(),
      speaker: "bot",
      message: response,
    },
  });
});
