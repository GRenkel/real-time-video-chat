import http, {IncomingMessage, ServerResponse} from 'http';
const SERVER_PORT: number = 3000;

function requestHandler(resquest : IncomingMessage, response : ServerResponse): void {
    response.end('Hello from Typescript');
}

http.createServer(requestHandler).listen(SERVER_PORT,  () => console.log(`server listening o port ${SERVER_PORT}`))
