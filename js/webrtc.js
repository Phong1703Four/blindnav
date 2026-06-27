/* ============================================
   BlindNav WebRTC + BroadcastChannel
   Liên lạc thời gian thực giữa 2 tab
   Samsung Solve for Tomorrow 2026
   ============================================
   
   Sử dụng BroadcastChannel API để 2 tab trên
   cùng trình duyệt giao tiếp trực tiếp.
   WebRTC dùng cho video/audio call thật.
   ============================================ */

const BlindNavRTC = {
  // ── State ──
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  callState: 'idle', // idle | calling | ringing | connected | ended
  callTimer: null,
  callDuration: 0,
  role: null, // 'user' (blind) or 'family'
  channel: null, // BroadcastChannel
  pendingCandidates: [],

  // ── Camera sharing state ──
  cameraPc: null,
  cameraPendingCandidates: [],
  _cameraStream: null, // Store reference for re-sharing

  // ── ICE Servers ──
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],

  // ── Callbacks ──
  onCallStateChange: null,
  onRemoteStream: null,
  onMessage: null,
  onCallTimer: null,
  onCameraFeed: null,
  onSOSAlert: null,
  onRequestCamera: null,

  /**
   * Initialize — sử dụng BroadcastChannel để giao tiếp giữa 2 tab
   */
  init(role) {
    this.role = role;
    
    // Tạo BroadcastChannel — cả 2 tab cùng channel name
    this.channel = new BroadcastChannel('blindnav-sync');
    this.channel.onmessage = (e) => this._onChannelMessage(e.data);
    
    // Thông báo tab đã online
    this.send({ type: 'presence', role: this.role, status: 'online' });
    
    console.log(`📡 BlindNav RTC initialized as: ${role} (BroadcastChannel)`);
  },

  /**
   * Gửi message qua BroadcastChannel
   */
  send(data) {
    if (this.channel) {
      try {
        this.channel.postMessage({ ...data, from: this.role, ts: Date.now() });
      } catch (e) {
        console.warn('BroadcastChannel send error:', e);
      }
    }
  },

  /**
   * Xử lý message nhận được từ tab kia
   */
  _onChannelMessage(data) {
    // Bỏ qua message từ chính mình
    if (data.from === this.role) return;

    switch (data.type) {
      // ── Presence ──
      case 'presence':
        console.log(`👤 ${data.role} is ${data.status}`);
        // Nếu user vừa online và mình là family, yêu cầu camera
        if (data.role === 'user' && data.status === 'online' && this.role === 'family') {
          setTimeout(() => this.send({ type: 'request-camera' }), 1000);
        }
        break;

      // ── Text message ──
      case 'text-message':
        console.log('📨 Text message received:', data.text);
        if (this.onMessage) this.onMessage(data);
        break;

      // ── Voice message ──
      case 'voice-message':
        console.log('🎤 Voice message received');
        if (this.onMessage) this.onMessage(data);
        break;

      // ── SOS Alert ──
      case 'sos-alert':
        console.log('🚨 SOS Alert received!');
        if (this.onSOSAlert) this.onSOSAlert(data);
        break;
      case 'sos-cancel':
        console.log('✅ SOS Cancelled');
        if (this.onSOSAlert) this.onSOSAlert(data);
        break;
      case 'sos-resolved':
        console.log('✅ SOS Resolved by family');
        if (this.onSOSAlert) this.onSOSAlert(data);
        break;

      // ── Camera feed sharing ──
      case 'camera-offer':
        this._handleCameraOffer(data);
        break;
      case 'camera-answer':
        this._handleCameraAnswer(data);
        break;
      case 'camera-ice':
        this._handleCameraICE(data);
        break;

      // ── Request camera (family yêu cầu user share camera) ──
      case 'request-camera':
        console.log('📹 Camera request received');
        if (this.onRequestCamera) {
          this.onRequestCamera();
        }
        break;

      // ── Obstacle/Location updates ──
      case 'obstacle-update':
        if (this.onMessage) this.onMessage(data);
        break;
      case 'location-update':
        if (this.onMessage) this.onMessage(data);
        break;

      // ── WebRTC Call Signaling ──
      case 'call-offer':
        this._handleCallOffer(data);
        break;
      case 'call-answer':
        this._handleCallAnswer(data);
        break;
      case 'ice-candidate':
        this._handleICECandidate(data);
        break;
      case 'call-hangup':
        this._handleHangup();
        break;
      case 'call-ringing':
        this._setCallState('ringing');
        break;
    }
  },

  // ═══════════════════════════════════════════
  // VIDEO/AUDIO CALL — WebRTC
  // ═══════════════════════════════════════════

  /**
   * Bắt đầu cuộc gọi (người gọi)
   */
  async startCall(existingStream = null) {
    try {
      this._setCallState('calling');

      // Lấy stream
      if (existingStream) {
        this.localStream = existingStream;
      } else {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      }

      // Tạo peer connection
      this._createPeerConnection();

      // Thêm tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Tạo offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await this.peerConnection.setLocalDescription(offer);

      // Gửi offer cho tab kia
      this.send({
        type: 'call-offer',
        sdp: offer.sdp
      });

      console.log('📞 Call offer sent');
    } catch (err) {
      console.error('❌ Start call error:', err);
      this._setCallState('ended');
    }
  },

  /**
   * Trả lời cuộc gọi (người nhận)
   */
  async answerCall(offerSdp) {
    try {
      // Lấy stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Tạo peer connection
      this._createPeerConnection();

      // Thêm tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Set remote description (offer)
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: offerSdp })
      );

      // Thêm pending ICE candidates
      for (const candidate of this.pendingCandidates) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn('Failed to add pending ICE candidate:', e);
        }
      }
      this.pendingCandidates = [];

      // Tạo answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Gửi answer
      this.send({
        type: 'call-answer',
        sdp: answer.sdp
      });

      this._setCallState('connected');
      this._startCallTimer();

      console.log('✅ Call answered');
    } catch (err) {
      console.error('❌ Answer call error:', err);
      this._setCallState('ended');
    }
  },

  /**
   * Kết thúc cuộc gọi
   */
  endCall() {
    // Gửi hangup
    this.send({ type: 'call-hangup' });

    this._cleanup();
    this._setCallState('ended');
    setTimeout(() => this._setCallState('idle'), 1500);
    console.log('📴 Call ended');
  },

  // ═══════════════════════════════════════════
  // CAMERA FEED SHARING — WebRTC (one-way)
  // ═══════════════════════════════════════════

  /**
   * Chia sẻ camera feed (user → family)
   */
  async shareCameraFeed(cameraStream) {
    try {
      // Lưu reference để re-share khi cần
      this._cameraStream = cameraStream;

      // Cleanup camera PC cũ nếu có
      if (this.cameraPc) {
        try { this.cameraPc.close(); } catch(e) {}
        this.cameraPc = null;
      }
      this.cameraPendingCandidates = [];

      this.cameraPc = new RTCPeerConnection({ iceServers: this.iceServers });

      this.cameraPc.onicecandidate = (e) => {
        if (e.candidate) {
          this.send({ type: 'camera-ice', candidate: e.candidate.toJSON() });
        }
      };

      this.cameraPc.onconnectionstatechange = () => {
        console.log(`📹 Camera connection: ${this.cameraPc?.connectionState}`);
      };

      cameraStream.getTracks().forEach(track => {
        this.cameraPc.addTrack(track, cameraStream);
      });

      const offer = await this.cameraPc.createOffer();
      await this.cameraPc.setLocalDescription(offer);

      this.send({ type: 'camera-offer', sdp: offer.sdp });
      console.log('📹 Camera feed offer sent');
    } catch (err) {
      console.error('Camera share error:', err);
    }
  },

  /**
   * Xử lý camera offer (family nhận từ user)
   */
  async _handleCameraOffer(data) {
    try {
      // Cleanup camera PC cũ nếu có
      if (this.cameraPc) {
        try { this.cameraPc.close(); } catch(e) {}
        this.cameraPc = null;
      }
      this.cameraPendingCandidates = [];

      this.cameraPc = new RTCPeerConnection({ iceServers: this.iceServers });

      this.cameraPc.onicecandidate = (e) => {
        if (e.candidate) {
          this.send({ type: 'camera-ice', candidate: e.candidate.toJSON() });
        }
      };

      this.cameraPc.ontrack = (e) => {
        console.log('📹 Camera track received!');
        if (this.onCameraFeed) {
          this.onCameraFeed(e.streams[0]);
        }
      };

      this.cameraPc.onconnectionstatechange = () => {
        console.log(`📹 Camera connection: ${this.cameraPc?.connectionState}`);
      };

      await this.cameraPc.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: data.sdp })
      );

      // Thêm pending camera ICE candidates
      for (const candidate of this.cameraPendingCandidates) {
        try {
          await this.cameraPc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn('Failed to add pending camera ICE:', e);
        }
      }
      this.cameraPendingCandidates = [];

      const answer = await this.cameraPc.createAnswer();
      await this.cameraPc.setLocalDescription(answer);

      this.send({ type: 'camera-answer', sdp: answer.sdp });
      console.log('📹 Camera answer sent');
    } catch (err) {
      console.error('Camera offer handle error:', err);
    }
  },

  /**
   * Xử lý camera answer (user nhận từ family)
   */
  async _handleCameraAnswer(data) {
    try {
      if (this.cameraPc && this.cameraPc.signalingState !== 'stable') {
        await this.cameraPc.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
        );

        // Thêm pending camera ICE candidates
        for (const candidate of this.cameraPendingCandidates) {
          try {
            await this.cameraPc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('Failed to add pending camera ICE:', e);
          }
        }
        this.cameraPendingCandidates = [];

        console.log('📹 Camera answer processed');
      }
    } catch (err) {
      console.error('Camera answer error:', err);
    }
  },

  /**
   * Xử lý camera ICE candidate
   */
  async _handleCameraICE(data) {
    try {
      if (this.cameraPc && this.cameraPc.remoteDescription) {
        await this.cameraPc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        // Queue candidate cho đến khi remote description được set
        this.cameraPendingCandidates.push(data.candidate);
      }
    } catch (err) {
      console.warn('Camera ICE candidate error:', err);
    }
  },

  // ═══════════════════════════════════════════
  // INTERNAL — WebRTC Call Signaling Handlers
  // ═══════════════════════════════════════════

  async _handleCallOffer(data) {
    console.log('📞 Incoming call offer');
    this._incomingOfferSdp = data.sdp;
    this._setCallState('ringing');
    
    // Thông báo đang đổ chuông
    this.send({ type: 'call-ringing' });
  },

  async _handleCallAnswer(data) {
    try {
      if (this.peerConnection && this.peerConnection.signalingState === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
        );
        
        // Thêm pending candidates
        for (const candidate of this.pendingCandidates) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('Failed to add pending ICE candidate:', e);
          }
        }
        this.pendingCandidates = [];

        this._setCallState('connected');
        this._startCallTimer();
        console.log('✅ Call connected');
      }
    } catch (err) {
      console.error('Handle answer error:', err);
    }
  },

  async _handleICECandidate(data) {
    try {
      const pc = this.peerConnection;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        // Queue it — sẽ add sau khi có remote description
        this.pendingCandidates.push(data.candidate);
      }
    } catch (err) {
      console.warn('ICE candidate error:', err);
    }
  },

  _handleHangup() {
    this._cleanup();
    this._setCallState('ended');
    setTimeout(() => this._setCallState('idle'), 1500);
  },

  // ═══════════════════════════════════════════
  // INTERNAL — Peer Connection
  // ═══════════════════════════════════════════

  _createPeerConnection() {
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch(e) {}
    }
    this.pendingCandidates = [];

    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    this.peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        this.send({
          type: 'ice-candidate',
          candidate: e.candidate.toJSON()
        });
      }
    };

    this.peerConnection.ontrack = (e) => {
      console.log('🎥 Remote track received');
      this.remoteStream = e.streams[0];
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log(`🔗 Call connection: ${state}`);
      if (state === 'connected') {
        this._setCallState('connected');
      }
      if (state === 'disconnected' || state === 'failed') {
        this._handleHangup();
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log(`🧊 ICE state: ${state}`);
    };
  },

  _cleanup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch(e) {}
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this._incomingOfferSdp = null;
    this._stopCallTimer();
    this.pendingCandidates = [];
  },

  _setCallState(state) {
    this.callState = state;
    console.log(`📞 Call state → ${state}`);
    if (this.onCallStateChange) this.onCallStateChange(state);
  },

  _startCallTimer() {
    this.callDuration = 0;
    this._stopCallTimer();
    this.callTimer = setInterval(() => {
      this.callDuration++;
      if (this.onCallTimer) {
        const m = Math.floor(this.callDuration / 60).toString().padStart(2, '0');
        const s = (this.callDuration % 60).toString().padStart(2, '0');
        this.onCallTimer(`${m}:${s}`);
      }
    }, 1000);
  },

  _stopCallTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
  }
};
