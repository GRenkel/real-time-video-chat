import {Server, ServerOptions, WebSocket, WebSocketServer} from "ws";
import { IncomingMessage } from "http";
import EventEmitter from "events";

export interface Message {
    type: string;
    target: string;
    data: string;
}

export class WebSocketService extends EventEmitter {
    
    private wsServer: Server;
    private connections : Map < string, WebSocket >;

    constructor( wsConfig : ServerOptions) {
        super()
        this.connections = new Map();
        this.wsServer = new WebSocketServer(wsConfig)
        this.wsServer.on('connection', (connection : WebSocket, request : IncomingMessage) => {
            this.handleConnection(connection, request);
        });
        console.info('Web Socket started on: ', wsConfig.port)
    }

    emitEvent(name: string, data: object){
        this.emit(name, data)
    }

    async handleIncomingMessages(message : string) {
        const parsedMessage: Message = JSON.parse(message);
        console.log('WebSocket received: ', parsedMessage )
        this.emitEvent('message', parsedMessage)
    }

    handleConnection(connection : WebSocket, request : IncomingMessage) {

        const userIP = request.socket.remoteAddress || ''
        this.connections.set(userIP, connection);

        this.sendMessage(userIP, {
            type: 'self-identifier',
            target: userIP,
            data: userIP
        });

        this.emitEvent('connection-open', {connectionIdentifier: userIP})
        connection.on('message', this.handleIncomingMessages.bind(this));
        connection.on('close', () => this.handleClosedConnection(userIP));
        
    }

    handleClosedConnection(connectionIdentifier : string) {
        console.log('Conexão encerrada.');
        this.connections.delete(connectionIdentifier);
        this.emitEvent('connection-closed', {connectionIdentifier})
    }

        
    sendMessage(connectionIdentifier : string, message : Message) {
        const connection = this.getConnection(connectionIdentifier);
        if(connection){
            connection.send(JSON.stringify(message));
        }
    }

    getConnection(connectionIdentifier : string){
        return this.connections.get(connectionIdentifier)
    }

    // broadcast(message : Message) {
    //     this.connections.forEach((connection) => {
    //         this.sendTo(connection, message);
    //     });
    // }

}

