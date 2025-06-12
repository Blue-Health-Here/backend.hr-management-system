import "reflect-metadata";
import { config } from "dotenv";
config();
import "./dal/db/db-source";
import { initializeSocket } from "./socket/socket-io";
import { fastify } from "fastify";
import { fastifyRegisters } from "./utility";
import { ExtendedRequest } from "./models/inerfaces/extended-Request";
import { log, error } from "console";
import fastifymultipart from "@fastify/multipart";
import { errorHandler } from "./middlewares";
import cookie from '@fastify/cookie';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8060;

log("Starting..."); 

const app = fastify({ logger: true });
app.register(cookie, {
  hook: 'onRequest', // parse cookies in all requests
})
app.register(fastifymultipart);
app.setErrorHandler(errorHandler);
initializeSocket(app.server);
fastifyRegisters(app);


app.post("/throw", async (req, res) => {
  let request = req as ExtendedRequest;
  let data = await req.file()
  let file = data ? data.file : undefined;
  log(request.user);
  throw new Error("test error");
});

app.get("/", (req, res) => {
  res.send({ message: "Hello, Fastify!" });
});

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    error(err);
    process.exit(1);
  }

  log(`🚀 Fastify server running at ${address}`);
});

process.on('unhandledRejection', (reason, promise) => {
  error('Unhandled Rejection at:', promise, 'reason:', reason);
});