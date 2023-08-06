// Variáveis globais para armazenar a conexão Peer e streams de vídeo
// const SIGNALING_WS_URL = 'ws://192.168.0.37:5000'
let peerConnection1;

type Message = {
    type: string;
    data: string;
}

class SignalingService {
    private signalingSocket : WebSocket;
    private peerConnections : RTCPeerConnection[] = []

    constructor(serverURL: string, private roomIdentifier = 'chat-test') {
        this.signalingSocket = new WebSocket(serverURL)
        this.roomIdentifier = roomIdentifier
        this.configConnection()
    }

    configConnection() {
        this.signalingSocket.onopen = this.onOpenConnection.bind(this)
        this.signalingSocket.onclose = this.onEndConnection.bind(this)
        this.signalingSocket.onmessage = this.onMessage.bind(this)

    }

    joinChat() { // new class
        const rtcConfiguration = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        }
        let peer = new RTCPeerConnection(rtcConfiguration)
        this.peerConnections.push(peer)
        this.sendMessage({data: 'sending a join', type: 'join'})
    }

    onReceiveCall(message : Message) {
        console.log('call received: ', message)
        this.createOffer(message)
    }

    createOffer(message : Message) {
        this.sendMessage({data: 'offer', type: 'offer'})
    }

    answerOffer(message: Message) {
        console.log('offer received: ', message)
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
                this.answerOffer(message)
                break
            case 'answer':
                console.log('answer')
                break
            case 'ice_candidate':
                console.log('ice_candidate')
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
