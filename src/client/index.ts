const DATA_STREAM_WS_URL = 'ws://192.168.0.37:5001'
const SIGNALING_WS_URL = 'ws://192.168.0.37:5000'

let localStream: MediaStream;
let remoteStream: MediaStream;
let peerConnection: RTCPeerConnection;
let signalingService = new SignalingService(SIGNALING_WS_URL)
let dataStreamSocket = new WebSocket(DATA_STREAM_WS_URL);

const localVideo: HTMLVideoElement = document.getElementById('localVideo') as HTMLVideoElement;
const remoteVideo : HTMLVideoElement = document.getElementById('remoteVideo') as HTMLVideoElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const hangupButton = document.getElementById('hangupButton') as HTMLButtonElement;

const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
];

const constraints = {
  video: true,
  audio: false
};

async function startCall() {
  try {
    signalingService.joinChat()
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localStream;

    setInterval(() => {
      const canvas = document.createElement('canvas');
      canvas.height = 720
      canvas.width = 1280
      const context = canvas.getContext('2d');
      context?.drawImage(localVideo, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
      // sendFrameForModeration(imageData);
    }, 3000);

    // Configurar a conexão Peer
    peerConnection = new RTCPeerConnection({ iceServers });

    // Adicionar o fluxo local à conexão Peer
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Receber fluxo de vídeo remoto e exibir no elemento de vídeo remoto
    peerConnection.ontrack = event => {
      remoteStream = event.streams[0];
      remoteVideo.srcObject = remoteStream;
    };

    // Escuta do sinal de "ice candidates" do Peer
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        sendIceCandidate(event.candidate);
      }
    };

    // Habilitar botão "Hang Up" e desabilitar "Start Call"
    hangupButton.disabled = false;
    startButton.disabled = true;

  } catch (error) {
    console.error('Error accessing media devices: ', error);
    alert(error)
  }
}

// Função para enviar os "ice candidates" para o outro Peer
function sendIceCandidate(candidate: RTCIceCandidate) {
  // Implemente aqui a lógica para enviar o "ice candidate" para o outro Peer (por exemplo, através de um servidor de sinalização)
}


// Function to send frames to the server for moderation analysis
  function sendFrameForModeration(frameData: any) {
    dataStreamSocket.send(JSON.stringify({data: frameData, type: "frame", target: "teste"}));
  }
// Função para encerrar a chamada
function hangup() {
  // Encerrar conexão Peer e fechar os streams
  peerConnection.close();
  localStream.getTracks().forEach((track: { stop: () => any; }) => track.stop());
  remoteStream.getTracks().forEach((track: { stop: () => any; }) => track.stop());

  // Limpar os elementos de vídeo
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;

  // Habilitar botão "Start Call" e desabilitar "Hang Up"
  hangupButton.disabled = true;
  startButton.disabled = false;
}

// Associar as funções aos botões
startButton.addEventListener('click', startCall);
hangupButton.addEventListener('click', hangup);
