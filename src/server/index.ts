import path from "path";
import "dotenv/config";
import { readFile } from "fs/promises";
import SignalingServer from "./signalingServer";
import { ServerOptions } from "ws";
import http, { IncomingMessage, ServerResponse } from "http";
import { WebSocketService } from "./webSocketService";

const HTTP_SERVER_PORT: number = 3000;
const WS_SIGNALING_SERVER_PORT: number = 80;
// const WS_STREAM_SERVER_PORT: number = 6001;

async function requestHandler(
  request: IncomingMessage,
  response: ServerResponse
) {
  try {
    let baseFile: string = path.basename(request.url || "") || "index.html";
    const isScript =
      path.extname(baseFile) === ".js" || path.extname(baseFile) === ".map";
    baseFile = isScript ? `js/${baseFile}` : baseFile;
    const pagePath: string = path.join(
      process.cwd(),
      "src",
      "dist",
      "public",
      baseFile
    );
    const file: Buffer = await readFile(pagePath);
    response.end(file);
  } catch (error) {
    console.log(error);
  }
}

http
  .createServer(requestHandler)
  .listen(HTTP_SERVER_PORT, () =>
    console.log(`server listening o port ${HTTP_SERVER_PORT}`)
  );

const signalingWSConfiguration: ServerOptions = {
  port: WS_SIGNALING_SERVER_PORT,
};

// const dataStreamWSConfiguration: ServerOptions = {
//   port: WS_STREAM_SERVER_PORT,
// };

const signalingWSServer = new WebSocketService(signalingWSConfiguration);
// const dataStreamWSServer = new WebSocketService(dataStreamWSConfiguration)
const rtcServer = new SignalingServer(signalingWSServer);
// const dataStreamServer = new DataStreamServer(dataStreamWSServer)
