import { ChatOpenAI } from "langchain/chat_models/openai";
import { CAgent } from "./CAgent.ts";
import { callTool, isTool, LLMAugmentedJsonParse } from "./tool.ts";
//TODO: add logging lib and make it read from config and pass this lib to agent
import { log } from "https://deno.land/std/log/mod.ts";
import { cequens_types } from "./types.ts";

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
    console.log("[INFO] [callLLM] Recurse call to make LLM parse tool response");
  }else{
    console.log("[INFO] [callLLM] New call request... ");
  }
  let agent = new CAgent(config, persona_id);
  const chat = new ChatOpenAI({
    temperature: 0.7,
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
  try {
    response = await chat.call(chat_messages);
    console.log("[DEBUG] [Executor] LLM response: ", response);
  } catch (e) {
    console.error("Error calling chat: ", e);
    console.log("***************************************");
    console.log("chat_messages: ", chat_messages);
    console.log("***************************************");
    return "LLM_FAILED";
    // below line to suspend the process for sake of debugging
    //const input = await Deno.readTextFile("/dev/stdin");
  }
  // console.debug("callLLM() LLM response: ", response.text);
  // Try to parse response as JSON
  let responseObect = {};
  let isJson = true;
  // parse response as JSON
  try {
    responseObect = JSONParse(response.text);
    console.log(
      `[Trace] [Executor] [callLLM()] responseObect after JSONParse -> ${
        JSON.stringify(responseObect)
      }`,
    );
  } catch (e) {
    console.log(e);
  }
  if (typeof responseObect !== "object") {
    console.warn("Failed to do json parse trying LLMAugmentedJsonParse");
    // responseObect = LLMAugmentedJsonParse(response.text);
    console.warn(`responseObect from LLMAugmented -> ${responseObect}`);
  }
  let responseOutput = await agent.getResponse(responseObect);
  console.log("[Debug] [Executor] [callLLM] responseOutput: ", responseOutput);
  // console.log(
  //   "if (isJson && agent.isTool(responseObect))",
  //   isJson && agent.isTool(responseObect),
  // );
  // console.log("isJson: ", isJson);
  // console.log("agent.isTool(responseObect): ", await agent.isTool(responseObect));
  if (isJson && agent.isTool(responseObect)) {
    if (isToolInvokation) {
      console.log("[Trace] [Executor] [callLLM] Max allowed tool iteration reached");
      return JSON.stringify(responseOutput);
    }
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
    history.push({ content: _tool_output, role: "assistant" });

    return callLLM(history, persona_id, isToolInvokation = true); // recursive call Here we can add max tool recursion request
  }
  return JSON.stringify(responseOutput);
}

function JSONParse(o: string | object): any {
  if (typeof o === "string") {
    console.log("[Trace] [Executor] JSONParse() o is string");
    try {
      return JSON.parse(o);
    } catch (e) {
      console.log(
        "[Error] [Executor] JSONParse() o is string but failed to parse as JSON will try to do LLMAugmentedJsonParse",
      );
    }
    console.log("JSONParse() o is object typeof o: ", typeof o);
    return o;
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
