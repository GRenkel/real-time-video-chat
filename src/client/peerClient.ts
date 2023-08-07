import { Message, SignalingClient } from "./signalingClient";

export class PeerClient {
    identifier : string | null = null;
    private peerConnection : RTCPeerConnection;

    constructor(private signalingClient : SignalingClient) {
        const rtcConfiguration = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        }
        this.peerConnection = new RTCPeerConnection(rtcConfiguration);
        this.callPeers()
    }

    callPeers() {
        this.signalingClient.startConnection()
        this.signalingClient.on('call', (message : Message) => this.createOffer(message))
        this.signalingClient.on('offer', (message : Message) => this.answerOffer(message))
        this.signalingClient.on('answer', (message : Message) => this.handleAnswer(message))
        this.signalingClient.on('ice_candidate', (message : Message) => console.log('ice'))

    }

    createOffer(message : Message) {
        console.log('Create Offer: ', message)
    }

    answerOffer(message : Message) {
        console.log('Answer Offer: ', message)
    }

    handleAnswer(message : Message){
        console.log('Handle answer: ', message)
    }
    

    setLocalDescription() {}

    setRemoteDescription() {}

    configDataChannel() {}
}
