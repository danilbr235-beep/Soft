import { createApiServer } from "./server";

const app = createApiServer();
const port = Number(process.env.PORT ?? 3001);

app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`PMHC mock API listening on http://localhost:${port}`);
});
