import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { callLLM } from "./lib/agentExecutor.ts";

const app = new Application();
const router = new Router();

router.post("/api", async (ctx) => {
  const { persona_id, history } = await ctx.request.body().value;
  console.log("New request for persona id -> ", persona_id);
  console.log("New request for history -> ", history);
  // do something with persona_id and history

  ctx.response.body = await callLLM(history, persona_id);
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on port 3000");

await app.listen({ port: 3000 });
