///Users/shabana/.deno/bin/deno run --allow-read --allow-write --allow-net --allow-env --unstable cli.ts --persona_id 1 --history_json_file ./history.json
// Receive input from cli as ./cli.ts --persona_id 1 --history_json_file ./history.json
// --persona_id is the persona id
// --history_json_file is the history json file
// --persona_id must be a number
// --history_json_file must be a valid json file

import { Command } from "https://deno.land/x/cliffy/command/mod.ts";
import { existsSync } from "https://deno.land/std@0.170.0/fs/exists.ts";


import { doLLM } from "./lib/llm.ts";


console.log("Starting......");
const cli = new Command()
    .version("0.1.0")
    .description("Get history from a persona")
    .option("-p, --persona_id <number>", "Persona id")
    .option("-f, --history_json_file <string>", "History json file")
    .action(async (options) => {
        if (!options.persona_id || !options.history_json_file) {
            console.log("Please provide persona_id and history_json_file");
            return;
        }

        if (!existsSync(options.history_json_file)) {
            console.log("History json file does not exist");
            return;
        }

        const history = JSON.parse(await Deno.readTextFile(options.history_json_file));
        // take all the history except the last one
        history.pop();
        console.log(history);
        // The main cli loop 
        while (true) {
            // take input from user cli stop when user press enter
            console.log("Please enter your input and press ctrl+d to submit: ");
            const input = await Deno.readTextFile("/dev/stdin");
            console.log("input: ", input);
            // add the input to history
            history.push({ role: "human", content: input });
            const response = await doLLM(history, options.persona_id);
            console.log("response: ", response);
        }
    }
);

await cli.parse(Deno.args);
        
