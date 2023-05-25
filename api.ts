import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Execute }  from "./lib/CAgentExecutor.ts";

const app = new Application();
const router = new Router();

router.post("/api", async (ctx) => {
  const { persona_id, history } = await ctx.request.body().value;
  console.log("New request for persona id -> ", persona_id);
  console.log("New request for history -> ", history);
  // do something with persona_id and history

  ctx.response.body = await Execute(history, persona_id, 0);
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on port 3325");

await app.listen({ port: 3325 });
