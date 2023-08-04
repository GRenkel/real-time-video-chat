import {
    RawData,
    Server,
    ServerOptions,
    WebSocket,
    WebSocketServer
} from "ws";
import EventEmitter from "events";

export interface SendingMessage {
    type: string;
    data: string;
}

export interface ReceivedMessage {
    type: string;
    data: string;
    identifier: string | '';
    target: string
}

export interface IdentifiedConnection {
    socket: WebSocket,
    id: string
}

export class WebSocketService extends EventEmitter {

    private wsServer : Server;
    private connections : Map < string,
    IdentifiedConnection >;

    constructor(wsConfig : ServerOptions) {
        super()
        this.connections = new Map();
        this.wsServer = new WebSocketServer(wsConfig)
        this.wsServer.on('connection', (connection : WebSocket) => {
            this.handleConnection(connection);
        });
        console.info('Web Socket started on: ', wsConfig.port)
    }

    emitSocketEvent(name : string, data : object) {
        console.log('################ WS EMITING EVENT #################')

        console.log(`EVENT[${name}]: data`)
        this.emit(name, data)
    }

    async handleIncomingMessages(message : RawData, connection : IdentifiedConnection) {
        console.log('################ WS INCOMING MESSAGE #################')
        const parsedMessage: ReceivedMessage = JSON.parse(message.toString());
        parsedMessage.identifier = connection.id
        // console.log('WebSocket received: ', parsedMessage)
        this.emitSocketEvent('message-received', parsedMessage)
    }

    getUniqueIdentifier(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    }

    handleConnection(connection : WebSocket) {
        const connectionIdentifier = this.getUniqueIdentifier()

        let identifiedConnection: IdentifiedConnection = {
            socket: connection,
            id: connectionIdentifier
        }

        this.connections.set(connectionIdentifier, identifiedConnection);
        this.emitSocketEvent('connection-open', {connectionIdentifier})
        connection.on('message', (message : RawData) => this.handleIncomingMessages(message, identifiedConnection));
        connection.on('close', () => this.handleClosedConnection(connectionIdentifier));

    }

    handleClosedConnection(connectionIdentifier : string) {
        console.log('Conexão encerrada.');
        this.connections.delete(connectionIdentifier);
        this.emitSocketEvent('connection-closed', {connectionIdentifier})
    }


    sendMessages(connectionIdentifiers : Set < string >, message : SendingMessage) {
        const targetConnections = this.getConnections(connectionIdentifiers);
        targetConnections.forEach(connection => {
            connection.socket.send(JSON.stringify(message))
        })
    }

    getConnections(connectionIdentifiers : Set < string >): IdentifiedConnection[]{
        let targetConnections: IdentifiedConnection[] = [];
        connectionIdentifiers.forEach(id => {
            const targetConnection: IdentifiedConnection |undefined = this.connections.get(id)
            if (targetConnection !== undefined) {
                targetConnections.push(targetConnection)
            }
        });
        return targetConnections
    }
}
