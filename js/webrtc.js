/* ============================================
   BlindNav WebRTC + PeerJS
   Liên lạc thời gian thực giữa 2 thiết bị (Internet)
   Samsung Solve for Tomorrow 2026
   ============================================ */

const BlindNavRTC = {
  // ── State ──
  peer: null,
  conn: null, // DataConnection
  callObj: null, // MediaConnection for Audio/Video call
  cameraCallObj: null, // MediaConnection for Camera feed
  localStream: null,
  remoteStream: null,
  role: null, // 'user' (blind) or 'family'
  myId: null,
  targetId: null,
  callState: 'idle', // idle | calling | ringing | connected | ended
  callTimer: null,
  callDuration: 0,
  
  // Fake SDP needed to bypass old BlindNavRTC._incomingOfferSdp checks
  _incomingOfferSdp: 'peerjs-mock-sdp',

  // ── Callbacks ──
  onCallStateChange: null,
  onRemoteStream: null,
  onMessage: null,
  onCallTimer: null,
  onCameraFeed: null,
  onSOSAlert: null,
  onRequestCamera: null,

  /**
   * Initialize — sử dụng PeerJS để giao tiếp qua Internet
   */
  init(role) {
    this.role = role;
    // Sử dụng ID duy nhất để tránh đụng độ trên server PeerJS công cộng
    this.myId = role === 'user' ? 'ss-blindnav-user-p1703' : 'ss-blindnav-family-p1703';
    this.targetId = role === 'user' ? 'ss-blindnav-family-p1703' : 'ss-blindnav-user-p1703';
    
    // Tạo đối tượng PeerJS
    this.peer = new Peer(this.myId, {
      debug: 1
    });

    this.peer.on('open', (id) => {
      console.log(`📡 PeerJS connected. My ID: ${id}`);
      this.connectToTarget();
      // Retry kết nối mỗi 5 giây nếu chưa kết nối
      setInterval(() => {
        if (!this.conn || !this.conn.open) {
          this.connectToTarget();
        }
      }, 5000);
    });

    this.peer.on('connection', (conn) => {
      // Bên kia chủ động kết nối tới
      console.log('🔗 Incoming data connection from', conn.peer);
      this._setupDataConnection(conn);
    });

    this.peer.on('call', (call) => {
      if (call.metadata && call.metadata.type === 'camera') {
        call.answer();
        call.on('stream', (remoteStream) => {
          console.log('📹 Camera stream received via PeerJS');
          if (this.onCameraFeed) this.onCameraFeed(remoteStream);
        });
      } else {
        console.log('📞 Incoming WebRTC call via PeerJS');
        this.callObj = call;
        this._setCallState('ringing');
        this.send({ type: 'call-ringing' });
      }
    });

    this.peer.on('error', (err) => {
      console.warn('PeerJS error:', err.type, err.message);
      // Nếu ID bị trùng, báo lỗi
      if (err.type === 'unavailable-id') {
        console.error('ID is taken! Please check if another tab is open.');
      }
    });
  },

  connectToTarget() {
    if (this.conn && this.conn.open) return;
    
    // Chỉ tạo mới nếu chưa có conn hoặc conn đã đóng
    console.log(`🔄 Attempting to connect to ${this.targetId}...`);
    const conn = this.peer.connect(this.targetId, { reliable: true });
    this._setupDataConnection(conn);
  },

  _setupDataConnection(conn) {
    // Nếu đã có kết nối và đang mở thì bỏ qua
    if (this.conn && this.conn.open && this.conn.peer === conn.peer) return;

    this.conn = conn;
    
    this.conn.on('open', () => {
      console.log(`✅ Data connection established with ${this.targetId}`);
      this.send({ type: 'presence', role: this.role, status: 'online' });
    });

    this.conn.on('data', (data) => {
      this._onData(data);
    });

    this.conn.on('close', () => {
      console.log(`❌ Data connection closed`);
      this.conn = null;
    });
  },

  /**
   * Gửi dữ liệu qua PeerJS DataConnection
   */
  send(data) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send({ ...data, from: this.role, ts: Date.now() });
      } catch (e) {
        console.warn('PeerJS Data send error:', e);
      }
    }
  },

  /**
   * Xử lý dữ liệu nhận được
   */
  _onData(data) {
    if (data.from === this.role) return; // Bỏ qua nếu từ chính mình (thực ra DataChannel ít khi bị)

    switch (data.type) {
      // ── Presence ──
      case 'presence':
        console.log(`👤 ${data.role} is ${data.status}`);
        if (data.role === 'user' && data.status === 'online' && this.role === 'family') {
          // Xin phép lấy luồng camera khi user online
          setTimeout(() => this.send({ type: 'request-camera' }), 2000);
        }
        break;

      // ── Messaging & Updates ──
      case 'text-message':
      case 'voice-message':
      case 'obstacle-update':
      case 'location-update':
        if (this.onMessage) this.onMessage(data);
        break;

      // ── SOS ──
      case 'sos-alert':
      case 'sos-cancel':
      case 'sos-resolved':
        if (this.onSOSAlert) this.onSOSAlert(data);
        break;

      // ── Camera request ──
      case 'request-camera':
        if (this.onRequestCamera) this.onRequestCamera();
        break;

      // ── WebRTC Call Signaling (Fallback/UI triggers) ──
      case 'call-ringing':
        this._setCallState('ringing');
        break;
      case 'call-hangup':
        this._handleHangup();
        break;
    }
  },

  // ═══════════════════════════════════════════
  // VIDEO/AUDIO CALL — PeerJS MediaConnection
  // ═══════════════════════════════════════════

  /**
   * Bắt đầu cuộc gọi (người gọi)
   */
  async startCall(existingStream = null) {
    try {
      this._setCallState('calling');

      if (existingStream) {
        this.localStream = existingStream;
      } else {
        const videoConstraints = this.role === 'user' ? { facingMode: 'environment' } : true;
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
        } catch (e) {
          // Fallback to any camera if environment camera is not available
          this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }
      }

      this.callObj = this.peer.call(this.targetId, this.localStream);
      
      this.callObj.on('stream', (remoteStream) => {
        if (this.onRemoteStream) this.onRemoteStream(remoteStream);
        if (this.callState !== 'connected') {
          this._setCallState('connected');
          this._startCallTimer();
        }
      });

      this.callObj.on('close', () => this._handleHangup());
      
      console.log('📞 Call initiated via PeerJS');
    } catch (err) {
      console.error('❌ Start call error:', err);
      this._setCallState('ended');
    }
  },

  /**
   * Trả lời cuộc gọi (người nhận)
   */
  async answerCall(offerSdp) {
    // offerSdp không cần cho PeerJS (chỉ tương thích UI cũ)
    try {
      const videoConstraints = this.role === 'user' ? { facingMode: 'environment' } : true;
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true });
      } catch (e) {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }

      if (this.callObj) {
        this.callObj.answer(this.localStream);
        
        this.callObj.on('stream', (remoteStream) => {
          if (this.onRemoteStream) this.onRemoteStream(remoteStream);
        });

        this.callObj.on('close', () => this._handleHangup());
        
        this._setCallState('connected');
        this._startCallTimer();
        console.log('✅ Call answered via PeerJS');
      }
    } catch (err) {
      console.error('❌ Answer call error:', err);
      this._setCallState('ended');
    }
  },

  /**
   * Kết thúc cuộc gọi
   */
  endCall() {
    this.send({ type: 'call-hangup' });
    this._handleHangup();
  },

  _handleHangup() {
    if (this.callObj) {
      this.callObj.close();
      this.callObj = null;
    }
    
    // Nếu là người thân, tắt camera (người mù có thể giữ camera để gửi feed)
    if (this.localStream && this.role === 'family') {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    this._stopCallTimer();
    this._setCallState('ended');
    setTimeout(() => this._setCallState('idle'), 1500);
    console.log('📴 Call ended');
  },

  // ═══════════════════════════════════════════
  // CAMERA FEED SHARING — Một chiều (User -> Family)
  // ═══════════════════════════════════════════

  /**
   * Chia sẻ camera feed (user → family)
   */
  async shareCameraFeed(cameraStream) {
    if (!this.peer || this.peer.disconnected) return;
    
    try {
      if (this.cameraCallObj) {
        this.cameraCallObj.close();
      }
      
      // Gọi cho người thân, kèm metadata định danh đây là luồng camera
      this.cameraCallObj = this.peer.call(this.targetId, cameraStream, {
        metadata: { type: 'camera' }
      });
      
      console.log('📹 Camera feed shared to family via PeerJS');
    } catch (err) {
      console.error('Camera share error:', err);
    }
  },

  // ═══════════════════════════════════════════
  // INTERNAL
  // ═══════════════════════════════════════════

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
