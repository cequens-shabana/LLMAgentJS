import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
//import { Deno } from "deno";

// create a function that use openai to do the same thing as JSON.parse
/* From mixed mal-formed json and text extract json */
export async function LLMAugmentedJsonParse(
  json: string,
): Promise<string | object> {
  console.log("[Trace] [utils] [LLMAugmentedJsonParse] Starting...");
  let template = `you are a smart assistant who able to fix json 

  and just reply with the proper json without explanation and if not able just reply with FAIED`;

  const chat = new ChatOpenAI({ temperature: 0 });

  const res = await chat.call([
    new SystemChatMessage(template),
    new HumanChatMessage(json),
  ]);

  let result: string = res.text;
  console.dir(res);
  console.log(`LLM Augmented json parse result -> ${res}`);
  if (result == "FAILED") {
    // return { "status": "FAILED" };
    return LLMAugmentedJsonTruncate(json);
  }
  try {
    return JSON.parse(result);
  } catch (e) {
    console.log(
      `[Warn] [utils] [LLMAugmentedJsonParse] Failed to parse data as json  \n """${result} """\n`,
    );
    return result;
  }
}

export function ID(length: number = 6): string {
  let uid = "";
  for (let i = 0; i < length; i++) {
    uid += Math.floor(Math.random() * 10);
  }
  return `id-${uid}`;
}

/* From mixed text and json extract text */
export async function LLMAugmentedJsonTruncate(input: string): Promise<string> {
  console.log("[Trace] [utils] [LLMAugmentedJsonTruncate] Starting...");
  let system_template =
    `Please assist me to remove the json part from a given text and reply ONLY with the text part without any explanation , Donot add any prefix. If you are not able to do reply with original text`;
  let user_template = ` text :
  """
  ${input}
  """`;

  const chat = new ChatOpenAI({ temperature: 0 });

  const res = await chat.call([
    new SystemChatMessage(system_template),
    new HumanChatMessage(user_template),
  ]);

  return res.text;
}

// export async function NewLLMAugmentedJsonTruncate(
//   input: string,
// ): Promise<string> {
//   console.log("[Trace] [utils] [NewLLMAugmentedJsonTruncate] Starting...");
//   let template =
//     `Please assist me to remove the json part from a given "text" and reply ONLY with the "text" part without any explanation , Donot add any prefix. If you are not able to do reply with original "text"
    
//   "text" :
//   """
//   ${input}
//   """`;

//   const model = new OpenAI({ temperature: 0 });

//   const result = await model.call(template);

//   return result;
// }

// export async function LLMAugmentedHumanReply(input: string): Promise<string> {
//   console.log("[Trace] [utils] [LLMAugmentedHumanReply] Starting...");
//   let system_template =
//     `Extract reply for a human for the given "text", response with ONLY and ONLY the reply without any explanation , Donot add any prefix. If "text" looks clear for a 10 years old child just reply with original "text" `;
//   let user_template = ` "text" :
//   """
//   ${input}
//   """`;

//   const chat = new ChatOpenAI({ temperature: 0, modelName: "gpt-4" });

//   const res = await chat.call([
//     new SystemChatMessage(system_template),
//     new HumanChatMessage(user_template),
//   ]);

//   return res.text;
// }

export async function NewLLMAugmentedHumanReply(
  input: string,
): Promise<string> {
  console.log("[Trace] [utils] [NewLLMAugmentedHumanReply] Starting...");
  let template =
    `Extract reply for a human for the given "text", response with ONLY and ONLY the reply without any explanation , Donot add any prefix. If "text" looks clear for a 10 years old child just reply with original "text" 
  
  "text" :
  """
  ${input}
  """`;

  const model = new OpenAI({ temperature: 0 });

  const result = await model.call(template);

  return result;
}

export function JSONResposne(input: string, key: string): object {
  interface MyObject {
    [key: string]: any;
  }
  let output: MyObject = {};
  input = input.replace(/\n/g, "")
  const jsonStart = input.indexOf("{");
  if (jsonStart == -1) {
    console.log(
      "[Warn] [utils] [JSONResposne] Failed to find json in the input",
    );
    output[key] = input;
    return output;
  }
  const jsonEnd = input.lastIndexOf("}") + 1;
  if (jsonEnd <= 0) {
    // This mean broken json
    console.log("[Warn] [utils] [JSONResposne] Malformed json in the input!!!");
    console.log("[Trace] [utils] [JSONResposne] Try to extract using regex");
    // Try use the key using regex extract
    const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`);
    const match = JSON.stringify(input).match(regex);
    if (match) {
      console.log("[Trace] [utils] [JSONResposne] Regex extract success");
      output[key] = match[1];
      return output;
    }
    // This mean broken json end
    console.log("[WARN] [utils] [JSONResposne] Regex extract failed !!!");
    output[key] = input;
    return output
  }
  try {
    return JSON.parse(input.slice(jsonStart, jsonEnd));
  } catch (e) {
    console.log("[WARN] [utils] [JSONResposne] JSON obj detected but failed to parse !! ");
    return {};
  }
}

export function isInvalidJSONResposne(obj: any): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/* From mixed text and json extract text */
// Deno.test("LLMAugmentedJsonTruncate", async () => {
//   let start = new Date();
//   console.log("Start At -> ", new Date().toLocaleString());
//   const input =
//     `Great! I found a flight for you. The flight number is AA1234, and the price is $300. You can book the flight using this [booking link](http://farnarflight.com/12334564356456/booking). Let me know if you need any further assistance.

//   {"Tool_Name": "api_flightSearch", "provided_info": {"departure_date": "2023-05-20", "from_city": "New York", "to_city": "Los Angeles"}, "Conditions_met": true, "Tool_probability": 90, "how_you_made_your_decisions": "I used the api_flightSearch tool to find the flight information for the customer after gathering the necessary prerequisites (departure date, from city, and to city). The tool's probability was above 50%, so I was able to use it confidently."}`;

//   const output = await LLMAugmentedJsonTruncate(input);
//   let end = new Date();
//   console.log("End At -> ", new Date().toLocaleString());

//   console.log("*************************");
//   console.log("input: ", input);
//   console.log("*************************");
//   console.log("output: ", output);
//   console.log("*************************\n\n\n\n");
// });

// Deno.test("NewLLMAugmentedJsonTruncate", async () => {
//   console.log("Start At -> ", new Date().toLocaleString());
//   const input =
//     `Great! I found a flight for you. The flight number is AA1234, and the price is $300. You can book the flight using this [booking link](http://farnarflight.com/12334564356456/booking). Let me know if you need any further assistance.

//   {"Tool_Name": "api_flightSearch", "provided_info": {"departure_date": "2023-05-20", "from_city": "New York", "to_city": "Los Angeles"}, "Conditions_met": true, "Tool_probability": 90, "how_you_made_your_decisions": "I used the api_flightSearch tool to find the flight information for the customer after gathering the necessary prerequisites (departure date, from city, and to city). The tool's probability was above 50%, so I was able to use it confidently."}`;

//   const output = await NewLLMAugmentedJsonTruncate(input);
//   console.log("End At -> ", new Date().toLocaleString());

//   console.log("*************************");
//   console.log("input: ", input);
//   console.log("*************************");
//   console.log("output: ", output);
//   console.log("*************************\n\n\n\n");
// });

/* From mixed mal-formed json and text extract json */
// Deno.test("LLMAugmentedJsonParse", async () => {
//   const input =
//     `{\n  \"Tool_Name\": \"api_flightSearch\",\n  \"provided_info\": {\n    \"departure_date\": \"tomorrow\",\n    \"from_city\": \"CAI\",\n    \"to_city\": \"JED\"\n  },\n  \"Conditions_met\": true,\n  \"Tool_probability\": 100\n}\n\nThank you for providing the information. Please hold on while I check our information system for available flights from CAI to JED tomorrow."}`;

//   const output = await LLMAugmentedJsonParse(input);

//   console.log("*************************");
//   console.log("input: ", input);
//   console.log("*************************");
//   console.log("output: ", output);
//   console.log("*************************\n\n\n\n");
// });

// Deno.test("LLMAugmentedHumanReply", async () => {
//   console.log("Start At -> ", new Date().toLocaleString());
//   const input =
//     `:"Hello! How can I help you today with XYZCinema?","how_you_made_your_decisions":"Greeted the customer and asked how I can assist them."`;
//   const output = await LLMAugmentedHumanReply(input);
//   console.log("Start At -> ", new Date().toLocaleString());

//   console.log("*************************");
//   console.log("input: ", input);
//   console.log("*************************");
//   console.log("output: ", output);
//   console.log("*************************");
// });

// Deno.test("NewLLMAugmentedHumanReply", async () => {
//   console.log("Start At -> ", new Date().toLocaleString());
//   const input =
//     `:"Hello! How can I help you today with XYZCinema?","how_you_made_your_decisions":"Greeted the customer and asked how I can assist them."`;
//   const output = await NewLLMAugmentedHumanReply(input);
//   console.log("Start At -> ", new Date().toLocaleString());

//   console.log("*************************");
//   console.log("input: ", input);
//   console.log("*************************");
//   console.log("output: ", output);
//   console.log("*************************");
// });

// Test JSONResposne to JSON

Deno.test("JSONResposne request with no json", () => {
  console.log("Start At -> ", new Date().toLocaleString());
  const input =
    `Hello! I'm Ahmed from Cequens. I will use the "cequens_new_featu    res" tool to provide you with the latest features and services. Please wait     a moment.`;

  const output = JSONResposne(input,"your_response_message");
  console.log("Start At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************");
});

Deno.test("JSONResposne request with  json", () => {
  console.log("Start At -> ", new Date().toLocaleString());
  const input = ` 
  {"Tool_Name": "cequens_new_features", "provided_info": "new features"}`;
  const output = JSONResposne(input,"your_response_message");
  console.log("Start At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************");
});

Deno.test("JSONResposne request with data and json", () => {
  console.log("Start At -> ", new Date().toLocaleString());
  const input =
    `Hello! I'm Ahmed from Cequens. I will use the "cequens_new_featu    res" tool to provide you with the latest features and services. Please wait     a moment.
  3
  2 {"Tool_Name": "cequens_new_features", "provided_info": "new features"}`;
  const output = JSONResposne(input,"your_response_message");
  console.log("Start At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************");
});
