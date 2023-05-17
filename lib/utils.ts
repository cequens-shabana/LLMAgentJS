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

export async function NewLLMAugmentedJsonTruncate(input: string): Promise<string> {
  console.log("[Trace] [utils] [NewLLMAugmentedJsonTruncate] Starting...");
  let template =
    `Please assist me to remove the json part from a given "text" and reply ONLY with the "text" part without any explanation , Donot add any prefix. If you are not able to do reply with original "text"
    
  "text" :
  """
  ${input}
  """`;

  const model = new OpenAI({ temperature: 0 });

  const result = await model.call(template);

  return result;
}



export async function LLMAugmentedHumanReply(input: string): Promise<string> {
  console.log("[Trace] [utils] [LLMAugmentedHumanReply] Starting...");
  let system_template = `Extract reply for a human for the given "text", response with ONLY and ONLY the reply without any explanation , Donot add any prefix. If "text" looks clear for a 10 years old child just reply with original "text" `;
  let user_template = ` "text" :
  """
  ${input}
  """`;

  const chat = new ChatOpenAI({ temperature: 0 , modelName: "gpt-4"});

  const res = await chat.call([
    new SystemChatMessage(system_template),
    new HumanChatMessage(user_template),
  ]);

  return res.text;
}


export async function NewLLMAugmentedHumanReply(input: string): Promise<string> {
  console.log("[Trace] [utils] [NewLLMAugmentedHumanReply] Starting...");
  let template = `Extract reply for a human for the given "text", response with ONLY and ONLY the reply without any explanation , Donot add any prefix. If "text" looks clear for a 10 years old child just reply with original "text" 
  
  "text" :
  """
  ${input}
  """`;

  const model = new OpenAI({ temperature: 0 });

  const result = await model.call(template);

  return result;

}


/* From mixed text and json extract text */
Deno.test("LLMAugmentedJsonTruncate", async () => {
  let start = new Date();
  console.log("Start At -> ", new Date().toLocaleString());
  const input =
    `Great! I found a flight for you. The flight number is AA1234, and the price is $300. You can book the flight using this [booking link](http://farnarflight.com/12334564356456/booking). Let me know if you need any further assistance.

  {"Tool_Name": "api_flightSearch", "provided_info": {"departure_date": "2023-05-20", "from_city": "New York", "to_city": "Los Angeles"}, "Conditions_met": true, "Tool_probability": 90, "how_you_made_your_decisions": "I used the api_flightSearch tool to find the flight information for the customer after gathering the necessary prerequisites (departure date, from city, and to city). The tool's probability was above 50%, so I was able to use it confidently."}`;

  const output = await LLMAugmentedJsonTruncate(input);
  let end = new Date()
  console.log("End At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************\n\n\n\n");
});

Deno.test("NewLLMAugmentedJsonTruncate", async () => {
  console.log("Start At -> ", new Date().toLocaleString());
  const input =
    `Great! I found a flight for you. The flight number is AA1234, and the price is $300. You can book the flight using this [booking link](http://farnarflight.com/12334564356456/booking). Let me know if you need any further assistance.

  {"Tool_Name": "api_flightSearch", "provided_info": {"departure_date": "2023-05-20", "from_city": "New York", "to_city": "Los Angeles"}, "Conditions_met": true, "Tool_probability": 90, "how_you_made_your_decisions": "I used the api_flightSearch tool to find the flight information for the customer after gathering the necessary prerequisites (departure date, from city, and to city). The tool's probability was above 50%, so I was able to use it confidently."}`;

  const output = await NewLLMAugmentedJsonTruncate(input);
  console.log("End At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************\n\n\n\n");
});

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





Deno.test("LLMAugmentedHumanReply", async () => {
  console.log("Start At -> ", new Date().toLocaleString());
  const input = `:"Hello! How can I help you today with XYZCinema?","how_you_made_your_decisions":"Greeted the customer and asked how I can assist them."`;
  const output = await LLMAugmentedHumanReply(input);
  console.log("Start At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************");
});




Deno.test("NewLLMAugmentedHumanReply", async () => {
  console.log("Start At -> ", new Date().toLocaleString());
  const input = `:"Hello! How can I help you today with XYZCinema?","how_you_made_your_decisions":"Greeted the customer and asked how I can assist them."`;
  const output = await NewLLMAugmentedHumanReply(input);
  console.log("Start At -> ", new Date().toLocaleString());

  console.log("*************************");
  console.log("input: ", input);
  console.log("*************************");
  console.log("output: ", output);
  console.log("*************************");
});
