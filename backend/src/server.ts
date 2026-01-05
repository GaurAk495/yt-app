import { Server as Engine } from "@socket.io/bun-engine";
import { initSocket } from "./socket";

const engine = new Engine({
  path: "/socket.io/",
});

initSocket(engine);

export default {
  port: process.env.PORT || 3000,
  ...engine.handler(),
};
