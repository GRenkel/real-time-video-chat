import {RekognitionService, RekognitionServiceType} from "../apis/awsRekognition";
import { FrameInspector } from "./frameInspector";
import { Message, WebSocketService } from "./webSocketService";


export class DataStreamServer {

    private connections : Set < string >;
    private moderator: FrameInspector;

    constructor(private wsService : WebSocketService) {

        this.connections = new Set()
        this.moderator = new FrameInspector( RekognitionService )

        wsService.on('connection-open', (data : any) => {
            this.handleConnection(data.connectionIdentifier);
        });
    }

    sendWSMessage(userIdentifier : string, message : Message) { // connection.send(JSON.stringify(message));
        this.wsService.sendMessage(userIdentifier, message)
    }


    handleClosedConnection(userIdentifier : string) {
        console.log('Conexão encerrada.');
        this.connections.delete(userIdentifier);
    }

    handleConnection(userIdentifier : string) {
        console.log('Connection established on signaling server: ', userIdentifier);
        this.connections.add(userIdentifier);

        this.sendWSMessage(userIdentifier, {
            type: 'self-identifier',
            target: userIdentifier,
            data: userIdentifier
        });

        this.wsService.on('message', this.processDataStream.bind(this));
        this.wsService.on('connection-closed', () => this.handleClosedConnection(userIdentifier));
    }

    async processDataStream(message : Message) {
        try {
            const frameString : string = message.data
            console.log('Frame: ', frameString)
            // let moderationLabels = await this.moderator.inspectFrame(frameString);
        } catch (error) {
            console.error('Error inspecting frame', error)
        }
    }
}
