// Variáveis globais para armazenar a conexão Peer e streams de vídeo
// const SIGNALING_WS_URL = 'ws://192.168.0.37:5000'
let peerConnection1;

class SignalingService {
    signalingSocket = null;

    constructor(serverURL, roomIdentifier='chat-test') {
        this.signalingSocket = new WebSocket(serverURL)
        this.roomIdentifier = roomIdentifier
        this.configConnection()
    }

    configConnection() {
        this.signalingSocket.onopen = this.onOpenConnection.bind(this)
        this.signalingSocket.onclose = this.onEndConnection.bind(this)
        this.signalingSocket.onmessage = this.onMessage.bind(this)

    }

    joinChat(){ //new class
        this.sendMessage({data: 'sending a join', type: 'join'})
    }

    onReceiveCall(message){
        console.log('call received: ', message)
        this.createOffer(message)
    }
    
    createOffer(){
        this.sendMessage({data: 'offer', type: 'offer'})
    }

    onReceiveOffer(message){
        console.log('Call received: ', message)
    }

    onOpenConnection(event) {
        console.log('Connection is open:', event)
    };

    onEndConnection(event) {
        console.log('Connection is closed:', event)
    };

    messageHandler(message) {
        switch (message.type) {
            case 'call':
                this.onReceiveCall(message)
                break
            case 'offer':
                console.log('offer')
                break
            case 'answer':
                console.log('answer')
                break
            case 'ice_candidate':
                console.log('ice_candidate')
                break;
        }
    }

    onMessage(event) {
        const message = JSON.parse(event.data)
        console.log('Message received:', message)
        this.messageHandler(message)
    }

    sendMessage(data){
        const message = {...data, target: this.roomIdentifier}
        console.log('SENDING MESSAGE FROM UI: ', message)
        this.signalingSocket.send(JSON.stringify(message));
    }
}
