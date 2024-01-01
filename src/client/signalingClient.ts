/* eslint-disable */
export type Message = {
  type: string;
  data: string;
  identifier: string;
};

const SIGNALING_WS_URL = "ws://localhost";

export class SignalingClient {
  private signalingSocket: WebSocket;
  private selfIdentifier: string;
  private peersIdentifier: Set<string>;

  constructor(serverURL: string, private roomIdentifier = "chat-test") {
    this.signalingSocket = new WebSocket(serverURL);
    this.roomIdentifier = roomIdentifier;
    this.selfIdentifier = Math.random().toString();
    this.peersIdentifier = new Set<string>();
    this.configConnection();
  }

  configConnection() {
    this.signalingSocket.onopen = this.onOpenConnection.bind(this);
    this.signalingSocket.onclose = this.onEndConnection.bind(this);
    this.signalingSocket.onmessage = this.onMessage.bind(this);
  }

  establishConnection() {
    // new class
    this.sendMessage({
      data: "sending a join",
      type: "join",
      identifier: this.selfIdentifier,
    });
  }

  emitEvent(name: string, data: object) {
    console.log("################ Signaling Client Event ################");
    console.log(`EVENT[${name}]: `, data);
  }

  sendOffer() {
    //one peer
    //create a local description
    this.sendMessage({
      data: "offer",
      type: "offer",
      identifier: this.selfIdentifier,
    });
  }

  sendAnswer() {
    //many offers
    //create a remote description
    //create a local description
    //emit answer
    this.sendMessage({
      data: "answer",
      type: "answer",
      identifier: this.selfIdentifier,
    });
  }

  sendIceCandidate() {
    //many offers
    //create a remote description
    //create a local description
    //emit answer
    this.sendMessage({
      data: "ice_candidate",
      type: "ice_candidate",
      identifier: this.selfIdentifier,
    });
  }

  handleReceivedCall(message: Message) {
    //many calls
    console.log("call received: ", message);
    this.emitEvent("call", message);
    this.sendOffer();
  }

  handleOffer(message: Message) {
    //create a remote description
    console.log("offer received: ", message);
    this.emitEvent("offer", message);
    this.sendAnswer();
  }

  handleAnswer(message: Message) {
    //create a remote description
    console.log("Answer received: ", message);
    console.log("answer", message);
    this.sendIceCandidate();
  }

  handleIceCandidate(message: Message) {
    console.log("Ice candidate received", message);
    console.log("ice_candidate", message);
    if (!this.peersIdentifier.has(message.identifier)) {
      this.peersIdentifier.add(message.identifier);
      this.sendIceCandidate();
    }
  }

  onOpenConnection(event: Event) {
    console.log("Connection is open:", event);
  }

  onEndConnection(event: Event) {
    console.log("Connection is closed:", event);
  }

  messageHandler(message: Message) {
    switch (message.type) {
      case "join":
        this.handleReceivedCall(message);
        break;
      case "offer":
        this.handleOffer(message);
        break;
      case "answer":
        this.handleAnswer(message);
        break;
      case "ice_candidate":
        this.handleIceCandidate(message);
        break;
    }
  }

  onMessage(event: MessageEvent) {
    const message: Message = JSON.parse(event.data);
    console.log("Message received:", message);
    this.messageHandler(message);
  }

  sendMessage(data: Message) {
    const message = {
      ...data,
      target: this.roomIdentifier,
    };
    console.log("SENDING MESSAGE FROM UI: ", message);
    this.signalingSocket.send(JSON.stringify(message));
  }
}

const SignalingClientInstance = new SignalingClient(SIGNALING_WS_URL);
export default SignalingClientInstance;
