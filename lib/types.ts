export namespace cequens_types {
  /* Generate a ts type from below json
{"ID": 1, "Name": "My Project", "Description": "A Flight Agent persona", "Version": "1.0", "CTX": "Act as a flight agent for company name XXFlight", "master_prompt": 1, "Created_at": "2022-01-01T12:00:00Z", "Updated_at": "2022-01-02T12:00:00Z"}
  */

  export interface IPersonaTemplate {
    id: number;
    name: string;
    description: string;
    version: string;
    ctx: string;
    master_prompt: number;
    created_at: string;
    updated_at: string;
  }

  /* Generate a ts type from below json
{"id": 1, "user": 123, "pers_templ": 1}
  */

  export interface IPersona {
    id: number;
    user: number;
    pers_templ: number;
  }

  /* Generate a ts type from below json
{"ID": 1, "is_debug": true, "Name": "My tool", "Description": "A tool for doing something useful", "Version": "1.0.0", "Prompt": "you are a customer service Agent, you are in a conversation with a customer, you respond only using a Json blob includes the variables below, you can decode and encode Json properly.read all the following instructions first, then start handling customer message: \n- you must search Tools below to find a Tool to use. (variable: Tool_Name)\n- you need to extract all customer provided info. (object: provided_info)\n- you must consider using Tools to retrieve real-time information, accurate information, company's information.\n- you cannot use a Tool until all the following conditions met (Boolean variable: Conditions_met)\ncondition 1: if tool probability above 50% (variable: Tool_probability).\ncondition 2: if you gathered Tool's prerequisites successfully from customer, or if Tool has no prerequisites specified\n\nif conditions not met respond asking customer to provide Tool's prerequisites,\nif conditions met to use a tool : respond asking the customer to hold on while checking our information system, and wait for the tool to respond.\n\n(your_response_message)\n(variable: how_you_made_your_decisions)\n\nContext:\n\n{context}\n\n\nTools:\n\nName | Description | prerequisites\n\n{tools}\n", "input_schema": {"type": "object", "properties": {"input1": {"type": "string", "description": "Input parameter 1"}, "input2": {"type": "integer", "description": "Input parameter 2"}}}, "output_schema": {"type": "object", "properties": {"output1": {"type": "string", "description": "Output parameter 1"}, "output2": {"type": "integer", "description": "Output parameter 2"}}}, "tool_schema": {"type": "object", "properties": {"tool_param1": {"type": "string", "description": "Tool parameter 1"}, "tool_param2": {"type": "integer", "description": "Tool parameter 2"}}}, "Created_at": "2022-01-01T00:00:00Z", "Updated_at": "2022-01-02T00:00:00Z"}
  */

  export interface IMasterPrompt {
    id: number;
    is_debug: boolean;
    name: string;
    description: string;
    version: string;
    prompt: string;
    input_schema: any;
    output_schema: any;
    tool_schema: any;
    created_at: string;
    updated_at: string;
  }

  /* Generate a ts type from below json
{"id": 2, "name_for_model": "api_flightSearch", "name_for_human": "Search for flights", "schema_version": "1.0", "description_for_model": "use specifically to search and retrieve and list flights options when customer want to book a ticket.", "prerequisites": "departure date, from city, to city", "url": "http://127.0.0.1:5000/", "persona": "1", "Created_at": "2022-01-01T12:00:00Z", "Updated_at": "2022-01-02T12:00:00Z","func":"def funcX(s): print(\"done..\"); return input('Enter Input As if you are a tool : ')"}
  */

  export interface ITool {
    id: number;
    name_for_model: string;
    name_for_human: string;
    schema_version: string;
    description_for_model: string;
    prerequisites: string;
    url: string;
    persona: number;
    created_at: string;
    updated_at: string;
    func: string;
  }

  /*
Generate a ts type from below json
export test_sample_tool_response = {"Tool_Name": "tool3", "provided_info": {"from_city": "Egypt", "to_city": "KSA", "departure_date": "30/3/2023"}, "Tool_probability": 100,"Conditions_met": true,"your_response_message": "Thank you for providing the information. Please hold on while I check our information system for available flights.","how_you_made_your_decisions": "The customer provided the necessary information for tool3, so I informed them that I will check the available flights using tool3.}
  */

  export let test_sample_tool_response = {
    "Tool_Name": "api_flightSearch",
    "provided_info": {
      "from_city": "Egypt",
      "to_city": "KSA",
      "departure_date": "30/3/2023",
    },
    "Tool_probability": 100,
    "Conditions_met": true,
    "your_response_message":
      "Thank you for providing the information. Please hold on while I check our information system for available flights.",
    "how_you_made_your_decisions":
      "The customer provided the necessary information for tool3, so I informed them that I will check the available flights using tool3.",
  };

  export interface IToolResponse {
    Tool_Name: string;
    provided_info: any;
    // tool_probability: number;
    // conditions_met: boolean;
    // your_response_message: string;
    // how_you_made_your_decisions: string;
  }
}
/*
Master prompt is something like this

"you are a customer service Agent, you are in a conversation with a customer, you respond only using a Json blob includes the variables below, you can decode and encode Json properly.read all the following instructions first, then start handling customer message:

- you must search Tools below to find a Tool to use. (variable: Tool_Name)
- you need to extract all customer provided info. (object: provided_info)
- you must consider using Tools to retrieve real-time information, accurate information, company's information.
- you cannot use a Tool until all the following conditions met (Boolean variable: Conditions_met)
condition 1: if tool probability above 50% (variable: Tool_probability).
condition 2: if you gathered Tool's prerequisites successfully from customer, or if Tool has no prerequisites specified

if conditions not met respond asking customer to provide Tool's prerequisites,
if conditions met to use a tool : respond asking the customer to hold on while checking our information system, and wait for the tool to respond.

(your_response_message)
(variable: how_you_made_your_decisions)
Context:

{context}


Tools:

Name | Description | prerequisites

{tools}
"
*/
