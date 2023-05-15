import { ChatOpenAI } from "langchain/chat_models/openai";
import { CAgent } from "./CAgent.ts";
import {
  LLMAugmentedHumanReply,
  LLMAugmentedJsonParse,
  LLMAugmentedJsonTruncate,
} from "./utils.ts";
//TODO: add logging lib and make it read from config and pass this lib to agent
import { cequens_types } from "./types.ts";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";

const config = {
  "redis": {
    "hostname": "127.0.0.1",
    "port": 6379,
  },
};

async function callLLM(
  history: object[],
  persona_id: number,
  isToolInvokation = false,
): Promise<string> {
  console.log("Starting callLLM()");
  if (isToolInvokation) {
    console.log(
      "[INFO] [callLLM] Recurse call to make LLM parse tool response",
    );
  } else {
    console.log("[INFO] [callLLM] New call request... ");
  }
  let agent = new CAgent(config, persona_id);
  const chat = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4", /*, maxTokens: 8000*/
  });
  const user = await agent.getUser();

  console.log(
    `${
      new Date().toLocaleString()
    } INFO - Starting new request for user ${user.id} using persona ${persona_id}`,
  );
  //   const systemTemplate = await agent.buildSystemTemplate(persona_id);
  const chat_messages = await agent.convert_history_to_chat_messages(
    history,
  );
  console.log(
    `[Debug] [Executor] chat_messages to be submitted to LLM:\n ${
      JSON.stringify(chat_messages)
    } \n`,
  );
  // console.log(`[Debug] [Executor] chat_messages to be submitted to LLM:\n ${chat_messages} \n`);
  let response;
  // CALL LLM
  response = await chat.call(chat_messages);
  console.log(`[DEBUG] [Executor] LLM response: ${JSON.stringify(response)}`);
  if (isToolInvokation) {
    return await LLMAugmentedJsonTruncate(response.text); // The LLMAugmentedHumaan reply may be used
  }
  let responseObect = {};

  responseObect = await JSONParse(response.text);

  console.log(
    `[Trace] [Executor] [callLLM()] responseObect after JSONParse -> ${
      JSON.stringify(responseObect)
    }`,
  );

  let responseOutput = await agent.getResponse(responseObect);
  console.log("[Debug] [Executor] [callLLM] responseOutput: ", responseOutput);
  if (agent.isTool(responseObect)) {
    console.log(
      "[Debug] [Executor] [callLLM] Entering agent.isTool to invoke tool ",
    );

    let _tool_output = JSON.stringify(await agent.callTool(responseObect));
    console.log("[Debug] [Executor] [callLLM] Tool output: ", _tool_output);
    if (
      _tool_output === undefined || Object.keys(_tool_output).length === 0 ||
      _tool_output === ""
    ) {
      _tool_output = "{'Status': 'Error', 'Error': 'Tool invocation failed'}";
    }
    console.log(
      "[Debug] [Executor] [callLLM] After check Tool output: ",
      _tool_output,
    );
    history.push({
      content: "Tool Response: " + _tool_output,
      role: "assistant",
    });

    return callLLM(history, persona_id, isToolInvokation = true); // recursive call Here we can add max tool recursion request
  }
  return LLMAugmentedHumanReply(JSON.stringify(responseOutput));
}

async function JSONParse(o: string | object): Promise<any> {
  if (typeof o === "string") {
    console.log("[Trace] [Executor] JSONParse() o is string");
    try {
      return JSON.parse(o);
    } catch (e) {
      console.log(
        "[Error] [Executor] JSONParse() o is string but failed to parse as JSON will try to do LLMAugmentedJsonParse",
      );
      return LLMAugmentedJsonParse(o);
    }
  }
}

async function dummyLLM(
  history: object[],
  persona_id: number,
): Promise<string> {
  console.log("dummyLLM() called");
  let agent = new CAgent(config, persona_id);
  const user = await agent.getUser();
  const chat_messages = await agent.convert_history_to_chat_messages(
    history,
  );
  const response = cequens_types.test_sample_tool_response;
  const responseObect = response;
  let out = agent.callTool(responseObect);
  return JSON.stringify(out);
}

export { callLLM, dummyLLM };
