/* ============================================
   Firebase Configuration
   BlindNav — Samsung Solve for Tomorrow 2026
   ============================================
   
   HƯỚNG DẪN: Thay thế config bên dưới bằng
   config từ Firebase Console của bạn:
   1. Vào https://console.firebase.google.com
   2. Tạo project mới hoặc chọn project có sẵn
   3. Vào Project Settings → General → Your apps
   4. Chọn "Web" → Register app
   5. Copy firebaseConfig object
   6. Dán vào bên dưới
   ============================================ */

const FirebaseConfig = {
  // ═══ THAY THẾ CONFIG NÀY BẰNG CONFIG CỦA BẠN ═══
  config: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "000000000000",
    appId: "YOUR_APP_ID"
  },

  // ID của kính (phải khớp với code ESP32)
  glassesId: "glass_001",

  // Firebase app instance
  app: null,
  db: null,
  isConnected: false,

  /**
   * Khởi tạo Firebase
   * @returns {boolean} true nếu kết nối thành công
   */
  init() {
    // Kiểm tra nếu chưa cấu hình
    if (this.config.apiKey === "YOUR_API_KEY") {
      console.log('⚠️ Firebase chưa được cấu hình. Chạy ở chế độ Demo.');
      return false;
    }

    try {
      // Kiểm tra Firebase SDK đã load
      if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase SDK chưa được load.');
        return false;
      }

      // Khởi tạo Firebase
      this.app = firebase.initializeApp(this.config);
      this.db = firebase.database();
      this.isConnected = true;

      // Theo dõi trạng thái kết nối
      this.db.ref('.info/connected').on('value', (snap) => {
        this.isConnected = snap.val() === true;
        if (typeof HardwareBridge !== 'undefined') {
          HardwareBridge.onConnectionChange(this.isConnected);
        }
        console.log(`🔥 Firebase: ${this.isConnected ? 'Connected' : 'Disconnected'}`);
      });

      console.log('✅ Firebase đã kết nối thành công!');
      return true;
    } catch (err) {
      console.error('❌ Firebase init error:', err);
      return false;
    }
  },

  /**
   * Lấy reference đến node data của kính
   * @param {string} path - path con (ví dụ: 'location', 'status')
   * @returns {firebase.database.Reference|null}
   */
  getRef(path) {
    if (!this.db) return null;
    const fullPath = `glasses/${this.glassesId}/${path}`;
    return this.db.ref(fullPath);
  },

  /**
   * Đọc dữ liệu 1 lần
   * @param {string} path
   * @returns {Promise<any>}
   */
  async read(path) {
    const ref = this.getRef(path);
    if (!ref) return null;
    const snap = await ref.once('value');
    return snap.val();
  },

  /**
   * Ghi dữ liệu
   * @param {string} path
   * @param {any} data
   */
  async write(path, data) {
    const ref = this.getRef(path);
    if (!ref) return;
    await ref.set(data);
  },

  /**
   * Lắng nghe real-time
   * @param {string} path
   * @param {Function} callback
   */
  listen(path, callback) {
    const ref = this.getRef(path);
    if (!ref) return null;
    ref.on('value', (snap) => {
      callback(snap.val());
    });
    return ref;
  },

  /**
   * Hủy lắng nghe
   * @param {firebase.database.Reference} ref
   */
  unlisten(ref) {
    if (ref) ref.off();
  }
};
