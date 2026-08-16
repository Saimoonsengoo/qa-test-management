import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`QA Test Management API listening on http://localhost:${env.port}`);
});
