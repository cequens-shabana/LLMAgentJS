const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("./mocks/history.json");
const history = JSON.parse(decoder.decode(data));

console.log(history);

const response = await fetch("http://localhost:3000/api", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    persona_id: 1,
    history,
  }),
});

const r = await response.text();
console.log(r); // should log 'Success!'

// deno run --allow-net --allow-read test.js
