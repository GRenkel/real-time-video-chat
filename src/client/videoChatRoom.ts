/* eslint-disable */

import { PeerClient } from "./peerClient.js";
import { SignalingClient } from "./signalingClient.js";

export class VideoChatRoom {
  private connection: PeerClient | undefined;
  private remoteMembers: PeerClient[] = [];

  constructor(private signalingClient: SignalingClient) {}

  joinRoom() {
    this.connection = new PeerClient(this.signalingClient);
  }

  exitRoom() {}
}
