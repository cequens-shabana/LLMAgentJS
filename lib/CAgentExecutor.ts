import { ChatOpenAI } from "langchain/chat_models/openai";

import {
  ID,
  isInvalidJSONResposne,
  JSONResposne,
  LLMAugmentedJsonParse,
} from "./utils.ts";
import { CAgent } from "./CAgent.ts";


const config = {
  "redis": {
    "hostname": "127.0.0.1",
    "port": 6379,
  },
};

export async function Execute(
  history: object[],
  persona_id: string,
  iter: number = 0,
): Promise<string> {
  const id = ID();
  console.log(`\n\nid -> ${id} | iter -> ${iter}`);
  let log_prefix = `\n\n\n[${id}] [${new Date().toLocaleString()}] `;
  let entry_log = `${log_prefix} [INFO] [AgentExecutor] `;
  if (iter > 0) {
    entry_log =
      `${entry_log} Agent Recurse call to make LLM parse tool response`;
  } else {
    entry_log = `${entry_log} New Request `;
  }
  let agent = new CAgent(config, persona_id);
  const user = await agent.getUser();
  console.log(`${entry_log} for user ${user.id} using persona ${persona_id}`);
  /* Convert History to chat messages */
  const chat_messages = await agent.convert_history_to_chat_messages(
    history,
  );
  console.log(
    `[${id}] [Debug] [AgentExecutor] chat_messages to be submitted to LLM:\n ${
      JSON.stringify(chat_messages)
    } \n`,
  );

  const chat = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4", /*, modelName: "gpt-3.5-turbo" | maxTokens: 8000*/
  });

  /* Real call to LLM */
  console.log(
    `[${id}] [${
      new Date().toLocaleString()
    }] [Trace] [AgentExecutor] Calling LLM `,
  );
  let response = await chat.call(chat_messages);
  // TODO:  We have to check if the chat.call happedned successfully
  console.log(
    `[${id}] [${
      new Date().toLocaleString()
    }] [Trace] [Executor] Got LLM Responsd :\n --- \n${response.text}\n--- `,
  );

  let responseObject = JSONResposne(response.text, agent.response_key);
  let reply_to_user = agent.getResponse(responseObject);
  // if the output variable is invalid this mean that :
  // a. Tool response that LLM shaped without follow schema
  //   -> Action return it to the user as it is
  // b.

  // Tool Invoked and LLM updated with its result
  // TODO: If required in the future to handle recursive calls for tools it should be inside below if statement
  if (iter >= agent.max_iterations) {
    console.log(
      `[${id}] [${
        new Date().toLocaleString()
      }] [TRACE] [AgentExecutor] Max Retries Reached`,
    );
    if (isInvalidJSONResposne(reply_to_user)) {
      // LLM parse Tool output but did not follow schema so return it directly to the user
      console.log(
        `[${id}] [${
          new Date().toLocaleString()
        }] [ERR] [AgentExecutor] Invalid Response`,
      );
      return response.text;
    }
    // LLM parse Tool output but did  follow schema
    return reply_to_user;
  }

  // Check if the new response is a Tool invocation
  if (agent.isTool(responseObject)) {
    console.log(
      "[Debug] [Executor] [callLLM] Seem this response isTool request ",
    );
    /******* Try to parse Tool output *********/
    let tool_response = await agent.callTool(responseObject);
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
      content: JSON.stringify(responseObject),
      role: "assistant",
    });
    history.push({
      content: `Tool Response is : """\n ${tool_response} \n"""`,
      role: "assistant",
    });

    return Execute(history, persona_id, ++iter); // recursive call Here we can add max tool recursion request
  }

  // Chekc if not tool and it is a reply for the user
  if (isInvalidJSONResposne(reply_to_user)) {
    console.log(
      `[${id}] [${
        new Date().toLocaleString()
      }] [ERR] [AgentExecutor] Invalid Response with JSON Try to do LLMAugmented Json parse`,
    );
    reply_to_user = LLMAugmentedJsonParse(response.text);
    if (isInvalidJSONResposne(reply_to_user)) {
      // This mean no way this could be parsed as json
      console.log(
        `[${id}] [${
          new Date().toLocaleString()
        }] [WARN] [AgentExecutor] Even LLM Augmented Json parse failed so return it directly to the user`,
      );
      return `* ${response.text}`;
    }
    console.log(
      `[${id}] [${
        new Date().toLocaleString()
      }] [TRACE] [AgentExecutor] LLMAugmented Json parse success`,
    );
  }
  return reply_to_user;
}
