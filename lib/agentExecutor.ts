import { ChatOpenAI } from "langchain/chat_models/openai";
import { CAgent } from "./CAgent.ts";
import {
  LLMAugmentedHumanReply,
  LLMAugmentedJsonParse,
  LLMAugmentedJsonTruncate,
  NewLLMAugmentedHumanReply,
  NewLLMAugmentedJsonTruncate,
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
    modelName: "gpt-4", /*, modelName: "gpt-3.5-turbo" | maxTokens: 8000*/
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
  /******* CALL LLM *********/
  console.log(
    `[Trace] [Executor] Calling LLM @ ${new Date().toLocaleString()}`,
  );
  response = await chat.call(chat_messages);
  console.log(
    `[Trace] [Executor] LLM Responsd @ ${new Date().toLocaleString()}`,
  );
  console.log(`[DEBUG] [Executor] LLM response: ${JSON.stringify(response)}`);
  if (isToolInvokation) { // If this was a recursive call to parse tool response
    // return await NewLLMAugmentedJsonTruncate(response.text); // The LLMAugmentedHumaan reply may be used
    try {
      return agent.getResponse(JSON.parse(response.text.replace(/\n/g, "")));
    } catch (e) {
      return response.text;
    }
  }
  let responseObect = {};
  /******* Pasre LLM output as a json if possible *********/
  // responseObect = await JSONParse(response.text);
  try {
    responseObect = JSON.parse(response.text.replace(/\n/g, ""));
  } catch (e) {
    //return `response returned as it is as it failed to be parsed as a json \n LLM Response -> ${response.text}`;
    return `${response.text}`;
  }

  console.log(
    `[Trace] [Executor] [callLLM()] responseObect after JSONParse -> ${
      JSON.stringify(responseObect)
    }`,
  );
  /******* Extract Response section if possible *********/
  let responseOutput = await agent.getResponse(responseObect);
  console.log("[Debug] [Executor] [callLLM] responseOutput: ", responseOutput);
  /******* Check if the LLM response is a Tool call invocation request *********/
  if (agent.isTool(responseObect)) {
    console.log(
      "[Debug] [Executor] [callLLM] Seem this response isTool request ",
    );
    /******* Try to parse Tool output *********/
    let tool_response = await agent.callTool(responseObect);
    try {
      /*Try to parse the tool response as a json*/
      tool_response = JSON.stringify(tool_response);
    } catch (e) {
      console.log("[Debug] [Executor] [callLLM] Tool response is not a json");
      return tool_response as string;
    }
    console.log("[Debug] [Executor] [callLLM] Tool output: ", tool_response);

    console.log(
      "[Debug] [Executor] [callLLM] After check Tool output: ",
      tool_response,
    );
    history.push({
      content: JSON.stringify(responseObect),
      role: "assistant",
    });
    history.push({
      content: `Tool Response is : """\n ${tool_response} \n"""`,
      role: "assistant",
    });

    return callLLM(history, persona_id, isToolInvokation = true); // recursive call Here we can add max tool recursion request
  }
  // Below section is for that response is not a tool request and it is a response for a user
  // return NewLLMAugmentedHumanReply(JSON.stringify(responseOutput));

  return JSON.stringify(responseOutput);
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
