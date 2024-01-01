/* eslint-disable */
import { Message, SignalingClient } from "./signalingClient.js";

export class PeerClient {
  identifier: string | null = null;
  private peerConnection: RTCPeerConnection;

  constructor(private signalingClient: SignalingClient) {
    const rtcConfiguration = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };
    this.identifier = Math.random().toString();
    this.peerConnection = new RTCPeerConnection(rtcConfiguration);
    this.callPeers();
  }

  callPeers() {
    console.log("calling peers");
    this.signalingClient.establishConnection();
  }

  setLocalDescription() {}

  setRemoteDescription() {}

  configDataChannel() {}
}
