import {ReceivedMessage, Message, WebSocketService} from './webSocketService';

type Rooms = Map<string, Set<string>>
class SignalingServer {
    
    private activeRooms : Rooms
    
    constructor(private wsService : WebSocketService) {
        this.activeRooms = new Map()
        wsService.on('connection-open', (data : any) => {
            console.log('Connection established on signaling server: ', data.connectionIdentifier);
        });
        this.handleConnection();
    }

    sendSignal(memberIdentifiers : Set<string>, message : Message) {
        console.log('Sending message on signaling server...', message);
        this.wsService.sendMessages(memberIdentifiers, message)
    }


    async processSignalization(message : ReceivedMessage) {
        console.log('Incoming message on signaling server...', message);
        switch (message.type) {
            case 'join':
                await this.joinChatRoom(message)
                break
            case 'offer':
                await this.handleOffer(message);
                break;
            case 'answer':
                await this.handleAnswer(message);
                break;
            case 'ice_candidate':
                await this.handleCandidate();
                break;
            default:
                break;
        }
    }

    handleClosedConnection(memberIdentifier : string) {
        console.log('Conexão encerrada.');
        // this.activeRooms.delete(memberIdentifier);
    }

    getTargetMembers(memberIdentifier:string, targetRoom: string) : Set<string>{
        let targetMembers : Set<string> = new Set()
        const roomMembers : Set<string> = this.activeRooms.get(targetRoom) || new Set();
        roomMembers.forEach(member => memberIdentifier !== member && targetMembers.add(member))
        return targetMembers
    }

    async callRoomMembers(message : ReceivedMessage){
        const memberIdentifier = message.identifier
        const targetRoom = message.target

        const targetMembers = this.getTargetMembers(memberIdentifier, targetRoom)
        
        const callMessage : Message = {
            data: 'hi there',
            type: 'call'
        }
        console.log(`member ${memberIdentifier} calling: `, targetMembers)
        this.sendSignal(targetMembers, callMessage)

    }

    async joinChatRoom(message: ReceivedMessage){
        const memberIdentifier = message.identifier
        const targetRoom = message.target

        let roomMembers : Set<string> = this.activeRooms.get(targetRoom) || new Set();
        roomMembers.add(memberIdentifier)
        this.activeRooms.set(targetRoom, roomMembers)

        console.log(`member ${memberIdentifier} joining rom ${targetRoom} with current members: `, roomMembers)
        console.log('current active roms: ', this.activeRooms)
        await this.callRoomMembers(message)
    }
    
    broadcastOffers(memberIdentifiers: Set<string>){
        const offerBroadcastMessage : Message = {
            data: 'do you accept?',
            type: 'offer'
        }
        this.sendSignal(memberIdentifiers, offerBroadcastMessage)
    }

    async handleOffer(message : ReceivedMessage) {
        console.log('Offer received', message)
        const memberIdentifier = message.identifier
        const targetRoom = message.target
        const targetMembers = this.getTargetMembers(memberIdentifier, targetRoom);
        this.broadcastOffers(targetMembers)
    }

    async handleAnswer(answer: ReceivedMessage) {}

    async handleCandidate() {}

    handleConnection() {
        this.wsService.on('message-received', (message: ReceivedMessage) => this.processSignalization(message));
        this.wsService.on('connection-closed', (memberIdentifier) => this.handleClosedConnection(memberIdentifier));
    }
}

export default SignalingServer;
