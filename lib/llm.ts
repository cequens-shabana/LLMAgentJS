
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage,SystemChatMessage } from "langchain/schema";

const chat = new ChatOpenAI({ temperature: 1, modelName: "gpt-4" });


function convert_history_to_chat_messages(history: object[]) {
  const chat_messages = [];
  var has_system_prompt = false;
  for (const message of history) {
    switch (message.role) {
        case "human":
            chat_messages.push(new HumanChatMessage(message.content));
            break;
        case "assistant":
            chat_messages.push(new AIChatMessage(message.content));
            break;
        case "system":
            chat_messages.push(new SystemChatMessage(message.content));
            has_system_prompt = true;
            break;    
    }
  }
  if (!has_system_prompt) {
    // We have to append the system prompt here
    // chat_messages.push(new SystemChatMessage("Hi!"));
  }
  return chat_messages;
}

// create a function that takes persona_id and lookup for redis key persona:id and get persona_template_id
async function get_persona_template_id(persona_id: number): Promise<number> {
    import { createClient } from "https://deno.land/x/redis/mod.ts";
    const persona_template_id = await redis.get(`persona:${persona_id}`);    
    return 1;
}



async function doLLM(history: object[], persona_id: number): string {
    console.log("persona_id: ", persona_id);

    const chat_messages = convert_history_to_chat_messages(history); 
    // console.log("chat_messages: ", chat_messages);
    const response = await chat.call(chat_messages);
    return response.text;
}
 






export { doLLM };