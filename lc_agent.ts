// // Below code is for trying the idea using langchain agent concept
// // Did not run properly with me

// import {
//   AgentActionOutputParser,
//   AgentExecutor,
//   LLMSingleActionAgent,
// } from "langchain/agents";
// import { LLMChain } from "langchain/chains";
// import { ChatOpenAI } from "langchain/chat_models/openai";
// import {
//   BaseChatPromptTemplate,
//   BasePromptTemplate,
//   renderTemplate,
//   SerializedBasePromptTemplate,
// } from "langchain/prompts";
// import {
//   AgentAction,
//   AgentFinish,
//   AgentStep,
//   BaseChatMessage,
//   HumanChatMessage,
//   InputValues,
//   PartialValues,
// } from "langchain/schema";

// import { SerpAPI, Tool } from "langchain/tools";
// import { DynamicTool } from "langchain/tools";
// import { BaseChatMemory, BufferMemory } from "langchain/memory";
// import { Calculator } from "langchain/tools/calculator";
// import { CAgent } from "./lib/ceqAgent.js";
// //import time sleep
// import { sleep } from "https://deno.land/x/sleep/mod.ts";
// // Lib

// const config = {
//   "redis": {
//     "hostname": "127.0.0.1",
//     "port": 6379,
//   },
// };

// // async function convert_history_to_chat_messages(
// //   history: any,
// //   memory: BufferMemory,
// //   bot: Bot,
// // ): Promise<BufferMemory> {
// //   const chat_messages = [];
// //   let newMem = new BufferMemory();
// //   var has_system_prompt = false;
// //   for (const message of history) {
// //     switch (message.role) {
// //       case "human":
// //         newMem.chatHistory.addUserMessage(
// //           new HumanChatMessage(message.content),
// //         );
// //         break;
// //       case "assistant":
// //         newMem.chatHistory.addAIChatMessage(new AIChatMessage(message.content));
// //         break;
// //       case "system":
// //         newMem.chatHistory.addAIChatMessage(
// //           new SystemChatMessage(message.content),
// //         );
// //         has_system_prompt = true;
// //         break;
// //     }
// //   }
// //   if (!has_system_prompt) {
// //     // We have to insert the system prompt at the start of the chat
// //     let system_prompt = await bot.buildSystemTemplate();
// //     newMem = new BufferMemory();
// //     newMem.chatHistory.addAIChatMessage(system_prompt);
// //     let memory_messages = await memory.chatHistory.getMessages();
// //     memory_messages.forEach((m) => {
// //       // "human" | "ai" | "generic" | "system"
// //       if (m._getType() === "human") {
// //         newMem.chatHistory.addUserMessage(m.text);
// //       } else {
// //         newMem.chatHistory.addAIChatMessage(m.text);
// //       }
// //     });
// //   }
// //   return newMem;
// // }
// // End of lib

// const PREFIX =
//   `Answer the following questions as best you can. You have access to the following tools:`;
// const formatInstructions = (toolNames: string) =>
//   `Use the following format:

//   Question: the input question you must answer
//   Thought: you should always think about what to do
//   Action: the action to take, should be one of [${toolNames}]
//   Action Input: the input to the action
//   Observation: the result of the action
//   ... (this Thought/Action/Action Input/Observation can repeat N times)
//   Thought: I now know the final answer
//   Final Answer: the final answer to the original input question`;
// const SUFFIX = `Begin!

//   Question: {input}
//   Thought:{agent_scratchpad}`;

// class CustomPromptTemplate extends BaseChatPromptTemplate {
//   tools: Tool[];

//   constructor(args: { tools: Tool[]; inputVariables: string[] }) {
//     super({ inputVariables: args.inputVariables });
//     this.tools = args.tools;
//   }

//   _getPromptType(): string {
//     throw new Error("Not implemented");
//   }

//   async formatMessages(values: InputValues): Promise<BaseChatMessage[]> {
//     /** Construct the final template */
//     const toolStrings = this.tools
//       .map((tool) => `${tool.name}: ${tool.description}`)
//       .join("\n");
//     const toolNames = this.tools.map((tool) => tool.name).join("\n");
//     const instructions = formatInstructions(toolNames);
//     const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
//     /** Construct the agent_scratchpad */
//     const intermediateSteps = values.intermediate_steps as AgentStep[];
//     const agentScratchpad = intermediateSteps.reduce(
//       (thoughts, { action, observation }) =>
//         thoughts +
//         [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
//       "",
//     );
//     const newInput = { agent_scratchpad: agentScratchpad, ...values };
//     /** Format the template. */
//     const formatted = renderTemplate(template, "f-string", newInput);
//     return [new HumanChatMessage(formatted)];
//   }

//   partial(_values: PartialValues): Promise<BasePromptTemplate> {
//     throw new Error("Not implemented");
//   }

//   serialize(): SerializedBasePromptTemplate {
//     throw new Error("Not implemented");
//   }
// }

// class CustomOutputParser extends AgentActionOutputParser {
//   async parse(text: string): Promise<AgentAction | AgentFinish> {
//     if (text.includes("Final Answer:")) {
//       const parts = text.split("Final Answer:");
//       const input = parts[parts.length - 1].trim();
//       const finalAnswers = { output: input };
//       return { log: text, returnValues: finalAnswers };
//     }

//     const match = /Action: (.*)\nAction Input: (.*)/s.exec(text);
//     if (!match) {
//       throw new Error(`Could not parse LLM output: ${text}`);
//     }

//     return {
//       tool: match[1].trim(),
//       toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
//       log: text,
//     };
//   }

//   getFormatInstructions(): string {
//     throw new Error("Not implemented");
//   }
// }

// async function lc_run(history: object[], persona_id: number) {
//   console.trace("lc_run called with history: ", history);
//   let bot = new Bot(config, persona_id);
//   // await sleep second
//   await sleep(5);
//   const model = new ChatOpenAI({ temperature: 0 });
//   const tools = [
//     // new SerpAPI(Deno.env["SERPAPI_API_KEY"], {
//     //   location: "Austin,Texas,United States",
//     //   hl: "en",
//     //   gl: "us",
//     // }),
//     new DynamicTool({
//       name: "FOO",
//       description:
//         "call this to search for a flight. input has to be departure airport ,arrival airport and departure date .",
//       func: async (input) => {
//         console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
//         console.log(input);
//         return "flight MS1234 , next Monday";
//       },
//     }),
//     new Calculator(),
//   ];

//   const llmChain = new LLMChain({
//     prompt: new CustomPromptTemplate({
//       tools,
//       inputVariables: ["input", "agent_scratchpad"],
//     }),
//     llm: model,
//   });

//   const agent = new LLMSingleActionAgent({
//     llmChain,
//     outputParser: new CustomOutputParser(),
//     stop: ["\nObservation"],
//   });

//   let memory = new BufferMemory();
//   //   memory.chatHistory.addAIChatMessage

//   memory = await bot.lc_convert_history_to_chat_messages(history);
//   console.log("memory: **************");
//   console.warn(memory.returnMessages);
//   console.trace(await memory.chatHistory.getMessages());
//   console.log("memory: **************");

//   const executor = new AgentExecutor({
//     agent,
//     tools,
//     verbose: true,
//     maxIterations: 4,
//     memory: memory,
//     returnIntermediateSteps: true,
//   });
//   console.log("Loaded agent.");

//   //   const input = `${q}`;

//   //   console.log(`Executing with input "${input}"...`);
//   console.log("lc_run is asking for the user input: ");
//   const input = await Deno.readTextFile("/dev/stdin");
//   const result = await executor.call({ input: input  });

//   console.log(`Got output ${result.output}`);
// }

// // while (true) {
// //   // console.log("history: ", history);
// //   // take input from user cli stop when user press enter
// //   console.log("Please enter your input and press ctrl+d to submit: ");
// //   const input = await Deno.readTextFile("/dev/stdin");
// //   console.log("input: ", input);
// //   // add the input to history
// //   let response = await run(input /*, id*/);
// //   // let response = await dummyLLM(history, options.persona_id);
// //   // check if console log level is debug
// //   response = JSON.stringify(response);
// //   console.debug("CLI response: ", response);
// //   // add the response to history
// // }

// export { lc_run };
