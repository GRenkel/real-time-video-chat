import { ReceivedMessage, Message, WebSocketService } from "./webSocketService";
/* eslint-disable */

type Rooms = Map<string, Set<string>>;

class SignalingServer {
  private activeRooms: Rooms;

  constructor(private wsService: WebSocketService) {
    this.activeRooms = new Map();
    wsService.on("connection-open", (data: any) => {
      console.log(
        "Connection established on signaling server: ",
        data.connectionIdentifier
      );
    });
    this.handleConnection();
  }

  sendMessage(memberIdentifiers: Set<string>, message: Message) {
    console.log("Sending message on signaling server...", message);
    this.wsService.sendMessages(memberIdentifiers, message);
  }

  async processSignalization(message: ReceivedMessage) {
    console.log("Incoming message on signaling server...", message);
    switch (message.type) {
      case "join":
        await this.joinChatRoom(message);
        break;
      case "offer":
        await this.handleOffer(message);
        break;
      case "answer":
        await this.handleAnswer(message);
        break;
      case "ice_candidate":
        await this.handleIceCandidate(message);
        break;
      default:
        break;
    }
  }

  handleClosedConnection(memberIdentifier: string) {
    console.log("Conexão encerrada.");
    // this.activeRooms.delete(memberIdentifier);
  }

  getTargetMembers(memberIdentifier: string, targetRoom: string): Set<string> {
    let targetMembers: Set<string> = new Set();
    const roomMembers: Set<string> =
      this.activeRooms.get(targetRoom) || new Set();
    roomMembers.forEach(
      (member) => memberIdentifier !== member && targetMembers.add(member)
    );
    return targetMembers;
  }

  async callRoomMembers(message: ReceivedMessage) {
    const memberIdentifier = message.identifier;
    const targetRoom = message.target;

    const targetMembers = this.getTargetMembers(memberIdentifier, targetRoom);

    const callMessage: Message = {
      data: "hi there",
      type: "join",
    };
    console.log(`member ${memberIdentifier} calling: `, targetMembers);
    this.sendMessage(targetMembers, callMessage);
  }

  async joinChatRoom(message: ReceivedMessage) {
    const memberIdentifier = message.identifier;
    const targetRoom = message.target;

    let roomMembers: Set<string> =
      this.activeRooms.get(targetRoom) || new Set();
    roomMembers.add(memberIdentifier);
    this.activeRooms.set(targetRoom, roomMembers);

    console.log(
      `member ${memberIdentifier} joining rom ${targetRoom} with current members: `,
      roomMembers
    );
    console.log("current active roms: ", this.activeRooms);
    await this.callRoomMembers(message);
  }

  broadcastOffers(memberIdentifiers: Set<string>) {
    const offerBroadcastMessage: Message = {
      data: "do you accept?",
      type: "offer",
    };
    this.sendMessage(memberIdentifiers, offerBroadcastMessage);
  }

  broadcastAnswers(memberIdentifiers: Set<string>) {
    const answerBroadcastMessage: Message = {
      data: "I accept",
      type: "answer",
    };
    this.sendMessage(memberIdentifiers, answerBroadcastMessage);
  }

  broadcastIceCandidate(memberIdentifiers: Set<string>) {
    const answerBroadcastMessage: Message = {
      data: "iceee",
      type: "ice_candidate",
    };
    this.sendMessage(memberIdentifiers, answerBroadcastMessage);
  }

  async handleOffer(offerMessage: ReceivedMessage) {
    console.log("Offer received", offerMessage);
    const memberIdentifier = offerMessage.identifier;
    const targetRoom = offerMessage.target;
    const targetMembers = this.getTargetMembers(memberIdentifier, targetRoom);
    this.broadcastOffers(targetMembers);
  }

  async handleAnswer(answerMessage: ReceivedMessage) {
    console.log("answer received", answerMessage);

    const memberIdentifier = answerMessage.identifier;
    const targetRoom = answerMessage.target;
    const targetMembers = this.getTargetMembers(memberIdentifier, targetRoom);
    this.broadcastAnswers(targetMembers);
  }

  async handleIceCandidate(iceCandidateMessage: ReceivedMessage) {
    console.log("ice candidate received", iceCandidateMessage);
    const memberIdentifier = iceCandidateMessage.identifier;
    const targetRoom = iceCandidateMessage.target;
    const targetMembers = this.getTargetMembers(memberIdentifier, targetRoom);
    this.broadcastIceCandidate(targetMembers);
  }

  handleConnection() {
    this.wsService.on("message-received", (message: ReceivedMessage) =>
      this.processSignalization(message)
    );
    this.wsService.on("connection-closed", (memberIdentifier) =>
      this.handleClosedConnection(memberIdentifier)
    );
  }
}

export default SignalingServer;
