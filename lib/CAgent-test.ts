import { CAgent } from "./CAgent.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

const config = {
  "redis": {
    "hostname": "127.0.0.1",
    "port": 6379,
  },
};

const agent = new CAgent(config, 1);
// sleep 2 second
await sleep(4);
// const o = await agent.getResponse({
//   Tool_Name: "api_flightSearch",
//   provided_info: {
//     from_city: "CAI",
//     to_city: "JED",
//     departure_date: "Sun May 14 2023",
//   },
//   Conditions_met: true,
//   Tool_probability: 90,
//   your_response_message:
//     "Please hold on while I check our information system for available flights from CAI to JED today.",
//   how_you_made_your_decisions:
//     "I chose the api_flightSearch tool because the customer provided the necessary information (from city...",
// });

// console.log(o);

const x = await agent.getTools();
// console.log(x);
try {
  const result = await agent.callTool(
    {
      Tool_Name: "get_movie_rate",
      provided_info:
        "Suggest 3 of the highest rated movie for me to watch today",
    },
  );
  console.log(result);
} catch (e) {
  console.log("------------------- Error -------------------");
  console.log(e);
}

console.log("Testing a cinema search tool");
try {
  const result = await agent.callTool(
    {
      Tool_Name: "cinema_movies_search",
      provided_info:
        "list today available movies",
    },
  );
  console.log(result);
} catch (e) {
  console.log("------------------- Error -------------------");
  console.log(e);
}



