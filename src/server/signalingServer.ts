import {Message, WebSocketService} from './webSocketService';

class SignalingServer {

    constructor(private wsService : WebSocketService) {

        wsService.on('connection-open', (data : any) => {
            this.handleConnection(data.connectionIdentifier);
        });
    }

    sendSignalization(userIdentifier : string, message : Message) { // connection.send(JSON.stringify(message));
        this.wsService.sendMessage(userIdentifier, message)
    }


    async processHandShake(message : Message) {
        console.log('Incoming message on signaling server...', message);
        switch (message.type) {
            case 'offer':
                await this.handleOffer();
                break;
            case 'answer':
                await this.handleAnswer();
                break;
            case 'ice_candidate':
                await this.handleCandidate();
                break;
            default:
                break;
        }
    }

    handleClosedConnection(userIdentifier : string) {
        console.log('Conexão encerrada.');
        // this.connections.delete(userIdentifier);
    }

    async handleOffer() {}

    async handleAnswer() {}

    async handleCandidate() {}

    handleConnection(userIdentifier : string) {
        console.log('Connection established on signaling server: ', userIdentifier);
        // this.connections.add(userIdentifier);

        this.sendSignalization(userIdentifier, {
            type: 'self-identifier',
            target: userIdentifier,
            data: userIdentifier
        });

        this.wsService.on('message', this.processHandShake.bind(this));
        this.wsService.on('connection-closed', () => this.handleClosedConnection(userIdentifier));
    }
}

export default SignalingServer;
