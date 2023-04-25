import Ajv from "https://cdn.skypack.dev/ajv";

const ajv = new Ajv();

const schema = {
  "type": "object",
  "properties": {
    "Tool_Name": { "type": "string" },
    "provided_info": { "type": "object" },
  },
  "required": ["Tool_Name", "provided_info"],
  "additionalProperties": true,
};

const data = {
  "response": {
    "provided_info": {
      "from_city": "CAI",
      "to_city": "RUH",
      "departure_date": "Mon Apr 24 2023",
    },
    "Tool_Name": "api_flightSearch",
    "Tool_probability": 80,
    "Conditions_met": false,
    "your_response_message":
      "Thanks for providing the departure date. Hold on while I search for available flights from CAI to RUH on Mon Apr 24 2023.",
    "how_you_made_your_decisions":
      "I gathered the necessary information and satisfied the conditions to use the api_flightSearch tool.",
  },
};

const valid = ajv.validate(schema, data.response);
if (!valid) console.log(ajv.errors);
else console.log("valid");
