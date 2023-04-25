import { ChatOpenAI } from "langchain/chat_models/openai";
import { Bot } from "./bot.ts";
import { callTool, isTool, LLMAugmentedJsonParse } from "./tool.ts";
//TODO: add logging lib and make it read from config and pass this lib to Bot
import { log } from "https://deno.land/std/log/mod.ts";
import { cequens_types } from "./types.ts";

const config = {
  "redis": {
    "hostname": "127.0.0.1",
    "port": 6379,
  },
};

async function callLLM(history: object[], persona_id: number): Promise<string> {
  let bot = new Bot(config, persona_id);
  const chat = new ChatOpenAI({ temperature: 1, modelName: "gpt-4" });
  const user = await bot.getUser();

  console.log(
    `${
      new Date().toLocaleString()
    } INFO - Starting new request for user ${user.id} using persona ${persona_id}`,
  );
  //   const systemTemplate = await bot.buildSystemTemplate(persona_id);
  const chat_messages = await bot.convert_history_to_chat_messages(
    history,
  );
  let response;
  // CALL LLM
  try {
    response = await chat.call(chat_messages);
    console.log("LLM response: ", response);
  } catch (e) {
    console.error("Error calling chat: ", e);
    console.log("***************************************");
    console.log("chat_messages: ", chat_messages);
    console.log("***************************************");
    const input = await Deno.readTextFile("/dev/stdin");
  }
  // console.debug("callLLM() LLM response: ", response.text);
  // Try to parse response as JSON
  let responseObect = {};
  let isJson = true;
  // try {
  responseObect = JSONParse(response.text);
  console.log(`responseObect after JSONParse -> ${responseObect}`);
  if (typeof responseObect !== "object") {
    console.warn("Failed to do json parse trying LLMAugmentedJsonParse");
    responseObect = LLMAugmentedJsonParse(response.text);
    console.warn(`responseObect from LLMAugmented -> ${responseObect}`);
  }
  // } catch (e) {
  //   console.log(e);
  //   try {
  //     console.warn("Failed to do json parse trying LLMAugmentedJsonParse");
  //     responseObect = LLMAugmentedJsonParse(response.text);
  //     console.warn(`responseObect from LLMAugmented -> ${responseObect}`);
  //   } catch (e) {
  //     console.warn("Failed to do LLMAugmentedJsonParse");
  //     responseObect = response.text;
  //     isJson = false;
  //   }
  // Check if this response is a tool call request
  console.log(
    "if (isJson && bot.isTool(responseObect))",
    isJson && bot.isTool(responseObect),
  );
  console.log("isJson: ", isJson);
  console.log("bot.isTool(responseObect): ", bot.isTool(responseObect));
  if (isJson && bot.isTool(responseObect)) {
    return JSON.stringify(bot.callTool(responseObect));
  }
  // }
  return JSON.stringify(responseObect);
}

function JSONParse(o: string | object): any {
  if (typeof o === "string") {
    console.log("JSONParse() o is string");
    return JSON.parse(o);
  }
  console.log("JSONParse() o is object typeof o: ", typeof o);
  return o;
}
async function dummyLLM(
  history: object[],
  persona_id: number,
): Promise<string> {
  console.log("dummyLLM() called");
  let bot = new Bot(config, persona_id);
  const user = await bot.getUser();
  const chat_messages = await bot.convert_history_to_chat_messages(
    history,
  );
  const response = cequens_types.test_sample_tool_response;
  const responseObect = response;
  let out = bot.callTool(responseObect);
  return JSON.stringify(out);
}

export { callLLM, dummyLLM };
