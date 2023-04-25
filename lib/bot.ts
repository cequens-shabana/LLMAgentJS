import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { cequens_types } from "./types.ts";
import { connect } from "https://deno.land/x/redis/mod.ts";
import Ajv from "https://cdn.skypack.dev/ajv";

const ajv = new Ajv();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class Bot {
  public chat: ChatOpenAI;
  public redis: any;
  public persona_id: number;
  public tools_keys: string[];
  public master_prompt_id: number;
  public tool_schema: {};

  constructor(config: any, persona_id: number) {
    this.chat = new ChatOpenAI({ temperature: 1, modelName: "gpt-4" });
    this.InitRedis(config);
    this.persona_id = persona_id;
  }

  async InitRedis(config) {
    this.redis = await connect({
      hostname: config.redis.hostname,
      port: config.redis.port,
    });
  }

  async convert_history_to_chat_messages(
    history: any,
  ): BaseChatMessage[] {
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
      // We have to insert the system prompt at the start of the chat
      let msg = await this.buildSystemTemplate();
      chat_messages.unshift(new SystemChatMessage(msg));
    }
    return chat_messages;
  }

  async getPersona(): Promise<cequens_types.IPersona> {
    const persona: cequens_types.IPersona = JSON.parse(
      await this.redis.get(
        `persona:${this.persona_id}`,
      ),
    );
    return persona;
  }

  async getPersonaTemplate(
    template_id: number,
  ): Promise<cequens_types.IPersonaTemplate> {
    const template: cequens_types.IPersonaTemplate = JSON.parse(
      await this.redis.get(
        `persona_template:${template_id}`,
      ),
    );
    return template;
  }

  async getMasterPrompt(
    template_id: number,
  ): Promise<cequens_types.IMasterPrompt> {
    const master_prompt: cequens_types.IMasterPrompt = JSON.parse(
      await this.redis.get(
        `master_prompt:${template_id}`,
      ),
    );
    this.master_prompt_id = master_prompt.id;
    this.tool_schema = master_prompt.tool_schema;

    return master_prompt;
  }
  // has to be getTools and has to get keys then itrate over them and get all tools
  async getTools(persona_id: number): Promise<cequens_types.ITool[]> {
    let tools: cequens_types.ITool[] = [];
    const tools_keys: string[] = await this.redis.keys(
      `tool:${persona_id}:*`,
    );
    this.tools_keys = tools_keys;
    //console.log("******tools keys: ", `tool:${tools_keys}`);
    for (const key of tools_keys) {
      const tool: cequens_types.ITool = JSON.parse(await this.redis.get(key));
      tools.push(tool);
    }
    //console.log("******tools: ", tools)
    return tools;
  }

  appendDateAndTime(context: string): string {
    const date = new Date();
    const date_string = date.toDateString();
    const time_string = date.toLocaleTimeString();
    return `${context}\nToday's date is : ${date_string}\nCurrent time is : ${time_string}`;
  }

  constructTemplate(
    master_prompt: string,
    context: string,
    tools: string,
  ): string {
    context = this.appendDateAndTime(context);
    let mastertemplate = master_prompt.replace("{context}", context).replace(
      "{tools}",
      tools,
    );
    return `${mastertemplate}`;
  }

  async buildSystemTemplate(): Promise<string> {
    const persona = await this.getPersona();
    const persona_template = await this.getPersonaTemplate(persona.pers_templ);
    // add debug line for persona_template
    const master = await this.getMasterPrompt(
      persona_template.master_prompt,
    );
    const master_prompt = master.prompt;
    //console.log("master: ", master);
    const tools = await this.getTools(persona.id);
    const toolString = tools.map((tool) =>
      `${tool.name_for_model} | ${tool.description_for_model} | ${tool.prerequisites}`
    ).join("\n");
    const _template = this.constructTemplate(
      master_prompt,
      persona_template.ctx,
      toolString,
    );
    // console.debug("👇👇👇👇👇👇👇👇👇👇👇");
    // console.debug("template: ", _template);
    // console.debug("☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝☝:");
    return _template;
  }

  async getUser(): Promise<object> {
    await sleep(200);
    const persona: cequens_types.IPersona = JSON.parse(
      await this.redis.get(
        `persona:${this.persona_id}`,
      ),
    );
    //console.log("persona.user: ", persona.user);
    return persona;
  }

  isTool(obj: {}): boolean {
    const ajv = new Ajv();
    console.log("inside isTool obj: ", obj);
    console.log("inside isTool this.tool_schema: ", this.tool_schema);
    return ajv.validate(this.tool_schema, obj);
  }

  async getTool(tool_name: string): Promise<cequens_types.ITool | undefined> {
    for (const key of this.tools_keys) {
      // console.log("inside getTool key: ", key);
      const _tool: cequens_types.ITool = JSON.parse(await this.redis.get(key));
      // console.log("inside getTool _tool: ", _tool);
      if (_tool.name_for_model === tool_name) {
        return _tool;
      }
    }
  }

  async callTool(query: any): Promise<{}> {
    let tool_name = query["Tool_Name"];
    const tool = await this.getTool(tool_name);
    if (!tool) {
      return { "error": "Tool not found" };
    }
    // console.log("inside callTool tool: ", tool);
    let jscode = tool?.func;
    console.log("inside callTool jscode: ", jscode);
    const dynamicFunction = eval(`(${jscode})`);
    const result = dynamicFunction(query.provided_info);
    // // define a vaiable called code as a callback
    // let code = new Function(jscode)();
    // console.log(  "----- let code = new Function(jscode)();");
    // // call the callback
    // let result = code(query.provided_info);
    return result;
  }
}
