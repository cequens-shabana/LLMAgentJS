import redis
import json
import sys


# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

# Define master_prompt:1 JSON data to store
master_prompt_data = {
   "ID":1,
   "output_response_key":"your_response_message",
   "is_debug":True,
   "Name":"My tool",
   "Description":"A tool for doing something useful",
   "Version":"1.0.0",
   "prompt":"you are a customer service Agent, you are in a conversation with a customer, you respond only using a Json blob includes the variables below, you can decode and encode Json properly.read all the following instructions first, then start handling customer message: \n- you must search Tools below to find a Tool to use. (variable: Tool_Name)\n- you need to extract all customer provided info. (object: provided_info)\n- you must consider using Tools to retrieve real-time information, accurate information, company's information.\n- you cannot use a Tool until all the following conditions met (Boolean variable: Conditions_met)\ncondition 1: if tool probability above 50% (variable: Tool_probability).\ncondition 2: if you gathered Tool's prerequisites successfully from customer, or if Tool has no prerequisites specified\n\nif conditions not met respond asking customer to provide Tool's prerequisites,\nif conditions met to use a tool : respond asking the customer to hold on while checking our information system, and wait for the tool to respond.\n\n(your_response_message)\n(variable: how_you_made_your_decisions)\n\nContext:\n\n{context}\n\n\nTools:\n\nName | Description | prerequisites\n\n{tools}\n",
   "input_schema":{
      "type":"object",
      "properties":{
         "input1":{
            "type":"string",
            "description":"Input parameter 1"
         },
         "input2":{
            "type":"integer",
            "description":"Input parameter 2"
         }
      }
   },
   "output_schema":{
      "type":"object",
      "properties":{
         "output1":{
            "type":"string",
            "description":"Output parameter 1"
         },
         "output2":{
            "type":"integer",
            "description":"Output parameter 2"
         }
      }
   },
   "tool_schema":{
      "type":"object",
      "properties":{
         "Tool_Name":{
            "type":"string"
         },
         "provided_info":{
            "type":["object", "string"]
         }
      },
      "required":[
         "Tool_Name",
         "provided_info"
      ],
      "additionalProperties":True
   },
   "Created_at":"2022-01-01T00:00:00Z",
   "Updated_at":"2022-01-02T00:00:00Z"
}


# Insert master_prompt:1 JSON data into Redis
r.set(f"master_prompt:1", json.dumps(master_prompt_data))

# Define persona_template:id JSON data to store
persona_template_data = {"id": 1, "name": "My Project", "description": "A Cinema Agent persona", "Version": "1.0", "ctx": "Act as a cinema agent for company name XYZCinema", "master_prompt": 1, "created_at": "2022-01-01T12:00:00Z", "updated_at": "2022-01-02T12:00:00Z"}

# Insert persona_template:id JSON data into Redis
r.set(f"persona_template:1", json.dumps(persona_template_data))

# This will be useless soon
# Define persona:id JSON data to store
persona_binding = {"id": 1, "user": 123, "pers_templ": 1}

# Insert persona:id JSON data into Redis
r.set(f"persona:1", json.dumps(persona_binding))

# Define tool:id JSON data to store
tool_data = {
   "id":1,
   "name_for_model":"cinema_movies_search",
   "name_for_human":"Search for movie",
   "schema_version":"1.0",
   "description_for_model":"Use this tool for any movies related requests",
   "prerequisites":"set provided_info to the user question as string not object",
   "url":"http://127.0.0.1:5000/",
   "persona":"1",
   "Created_at":"2022-01-01T12:00:00Z",
   "Updated_at":"2022-01-02T12:00:00Z",
   "func":"""async (question)=>{const q = question;const response = await fetch("http://35.180.75.94:3000/api/v1/prediction/75bc8358-0ceb-4367-a343-f39273e1f411", {method: "POST",headers: {"Content-Type": "application/json",Authorization: "Bearer 6KtEpcVO2A4IQBuC4JjimP9kLbduAPypAtbzxTtB8Qw="},body: JSON.stringify({"question": encodeURI(q)})});const result = await response.json();return result;}"""
}

# Insert tool:persona_template_id:id JSON data into Redis
r.set(f"tool:1:1", json.dumps(tool_data))




   #"func":"""async (question)=>{const q = "get rate for" +  question ;const response = await fetch("http://35.180.75.94:3000/api/v1/prediction/75bc8358-0ceb-4367-a343-f39273e1f411", {method: "POST",headers: {"Content-Type": "application/json",Authorization: "Bearer 6KtEpcVO2A4IQBuC4JjimP9kLbduAPypAtbzxTtB8Qw="},body: JSON.stringify({"question": q})});const result = await response.json();return result;}"""

# tool_data = {
#    "id":2,
#    "name_for_model":"get_movie_rate",
#    "name_for_human":"Get a rate for any movie",
#    "schema_version":"1.0",
#    "description_for_model":"Do not use this tool",
#    "prerequisites":"set provided_info to the user question as string not object",
#    "url":"http://127.0.0.1:5000/",
#    "persona":"1",
#    "Created_at":"2022-01-01T12:00:00Z",
#    "Updated_at":"2022-01-02T12:00:00Z",
#    #"func":"""async (question)=>{const q = "get rate for" +  question ;const response = await fetch("http://35.180.75.94:3000/api/v1/prediction/75bc8358-0ceb-4367-a343-f39273e1f411", {method: "POST",headers: {"Content-Type": "application/json",Authorization: "Bearer 6KtEpcVO2A4IQBuC4JjimP9kLbduAPypAtbzxTtB8Qw="},body: JSON.stringify({"question": q})});const result = await response.json();return result;}"""
#    "func":"""async (question)=>{const q = question;const response = await fetch("http://35.180.75.94:3000/api/v1/prediction/75bc8358-0ceb-4367-a343-f39273e1f411", {method: "POST",headers: {"Content-Type": "application/json",Authorization: "Bearer 6KtEpcVO2A4IQBuC4JjimP9kLbduAPypAtbzxTtB8Qw="},body: JSON.stringify({"question": q})});const result = await response.json();return result;}"""
# }

# # Insert tool:persona_template_id:id JSON data into Redis
# r.set(f"tool:1:2", json.dumps(tool_data))

