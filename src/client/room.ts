import { PeerClient } from "./peerClient";
import { SignalingClient } from "./signalingClient";

export class Room {
    private localMember : PeerClient | undefined; 
    private remoteMembers : PeerClient[] = [];

    constructor(private signalingClient: SignalingClient){

    }

    joinRoom(){
        this.localMember = new PeerClient(this.signalingClient)
    }

    exitRoom(){

    }
}