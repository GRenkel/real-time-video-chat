import { EventEmitter } from "events";


export type Message = {
    type: string;
    data: string;
}

export class SignalingClient extends EventEmitter {
    private signalingSocket : WebSocket;

    constructor(serverURL: string, private roomIdentifier = 'chat-test') {
        super()
        this.signalingSocket = new WebSocket(serverURL)
        this.roomIdentifier = roomIdentifier
        this.configConnection()
    }

    configConnection() {
        this.signalingSocket.onopen = this.onOpenConnection.bind(this)
        this.signalingSocket.onclose = this.onEndConnection.bind(this)
        this.signalingSocket.onmessage = this.onMessage.bind(this)
    }

    startConnection() { // new class
        this.sendMessage({data: 'sending a join', type: 'join'})
    }

    emitEvent(name : string, data : object) {
        console.log('################ Signaling Client Event ################')
        console.log(`EVENT[${name}]: data`)
        this.emit(name, data)
    }

    onReceiveCall(message : Message) {
        //many calls
        console.log('call received: ', message)
        this.emitEvent('call', message)
    }

    sendOffer(message : Message) {
        //one peer
        //create a local description
        this.sendMessage({data: 'offer', type: 'offer'})
    }

    sendAnswer(message: Message) {
        //many offers
        //create a remote description
        //create a local description
        //emit answer
        console.log('offer received: ', message)
    }
    
    onHandleAnswer(message: Message){
        //create a remote description
        console.log('Answer received: ', message)
    }

    onHandleIceCandidate(message: Message){
        console.log('Ice candidate received', message)
    }

    onOpenConnection(event : Event) {
        console.log('Connection is open:', event)
    };

    onEndConnection(event : Event) {
        console.log('Connection is closed:', event)
    };

    messageHandler(message: Message) {
        switch (message.type) {
            case 'call':
                this.onReceiveCall(message)
                break
            case 'offer':
                this.sendAnswer(message)
                break
            case 'answer':
                this.onHandleAnswer(message)
                break
            case 'ice_candidate':
                this.onHandleIceCandidate(message)
                break;
        }
    }

    onMessage(event : MessageEvent) {
        const message : Message = JSON.parse(event.data)
        console.log('Message received:', message)
        this.messageHandler(message)
    }

    sendMessage(data: Message) {
        const message = {
            ...data,
            target: this.roomIdentifier
        }
        console.log('SENDING MESSAGE FROM UI: ', message)
        this.signalingSocket.send(JSON.stringify(message));
    }
}
