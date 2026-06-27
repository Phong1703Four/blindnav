/* ============================================
   BlindNav Mock Data — Firebase Schema Demo
   ============================================ */

const BlindNavData = {
  // ── Current User (Caretaker) ──
  user: {
    id: 'user_001',
    name: 'Con Lan',
    phone: '0912 345 678',
    role: 'caretaker'
  },

  // ── Glasses Status ──
  glasses: {
    id: 'glass_001',
    pairedUser: 'Bố',
    status: {
      isOnline: true,
      battery: 78,
      signal: 'good', // 'good' | 'medium' | 'weak' | 'lost'
      lastSeen: Date.now(),
      connectionStatus: 'active' // 'active' | 'off' | 'lost'
    },
    location: {
      lat: 21.0285,
      lng: 105.8542,
      speed: 1.2,
      heading: 'Bắc',
      address: 'Hàng Bông, Hoàn Kiếm, Hà Nội',
      timestamp: Date.now(),
      timeOutside: 45 // minutes
    }
  },

  // ── GPS Trail (last 30 min) ──
  gpsTrail: [
    { lat: 21.0275, lng: 105.8535, time: -30 },
    { lat: 21.0278, lng: 105.8538, time: -25 },
    { lat: 21.0280, lng: 105.8536, time: -20 },
    { lat: 21.0282, lng: 105.8540, time: -15 },
    { lat: 21.0283, lng: 105.8539, time: -10 },
    { lat: 21.0284, lng: 105.8541, time: -5 },
    { lat: 21.0285, lng: 105.8542, time: 0 }
  ],

  // ── Geofences ──
  geofences: [
    {
      id: 'geo_home',
      name: 'Vùng nhà',
      lat: 21.0275,
      lng: 105.8535,
      radius: 500,
      action: 'notify_and_call',
      enabled: true
    },
    {
      id: 'geo_market',
      name: 'Vùng chợ',
      lat: 21.0370,
      lng: 105.8500,
      radius: 300,
      action: 'notify',
      enabled: true
    }
  ],

  // ── Routes ──
  routes: [
    {
      id: 'route_001',
      name: 'Nhà → Chợ Đồng Xuân',
      voiceCommand: 'đi chợ sáng',
      distance: 1.4,
      duration: 18,
      usageCount: 12,
      lastUsed: '08:30 hôm qua',
      frequency: 'frequent', // frequent, normal, rare, unused
      color: '#1D9E75',
      waypoints: [
        { lat: 21.0275, lng: 105.8535 },
        { lat: 21.0290, lng: 105.8530 },
        { lat: 21.0310, lng: 105.8520 },
        { lat: 21.0340, lng: 105.8510 },
        { lat: 21.0370, lng: 105.8500 }
      ],
      landmarks: [
        {
          id: 'lm_001',
          lat: 21.0310,
          lng: 105.8520,
          distanceFromStart: 0.3,
          note: 'Bậc thềm cao tại cổng chợ',
          alertLevel: 'warning',
          alertDistance: 10
        },
        {
          id: 'lm_002',
          lat: 21.0340,
          lng: 105.8510,
          distanceFromStart: 0.8,
          note: 'Rẽ trái hẻm nhỏ',
          alertLevel: 'info',
          alertDistance: 5
        },
        {
          id: 'lm_003',
          lat: 21.0360,
          lng: 105.8505,
          distanceFromStart: 1.2,
          note: 'Đèn đỏ dài - ngã tư đông xe',
          alertLevel: 'warning',
          alertDistance: 20
        }
      ],
      history: [
        { date: 'Hôm qua 08:32', duration: '19 phút' },
        { date: '21/6 08:15', duration: '21 phút' },
        { date: '19/6 09:02', duration: '17 phút' }
      ]
    },
    {
      id: 'route_002',
      name: 'Nhà → Trạm xe buýt 36',
      voiceCommand: 'đi xe buýt',
      distance: 0.6,
      duration: 8,
      usageCount: 8,
      lastUsed: '3 ngày trước',
      frequency: 'normal',
      color: '#1A73E8',
      waypoints: [
        { lat: 21.0275, lng: 105.8535 },
        { lat: 21.0280, lng: 105.8550 },
        { lat: 21.0285, lng: 105.8565 }
      ],
      landmarks: [
        {
          id: 'lm_004',
          lat: 21.0280,
          lng: 105.8550,
          distanceFromStart: 0.3,
          note: 'Cẩn thận xe máy đi ngược chiều',
          alertLevel: 'warning',
          alertDistance: 10
        }
      ],
      history: [
        { date: '23/6 07:45', duration: '9 phút' },
        { date: '22/6 07:50', duration: '8 phút' }
      ]
    },
    {
      id: 'route_003',
      name: 'Nhà → Bệnh viện Bạch Mai',
      voiceCommand: 'đi bệnh viện',
      distance: 3.1,
      duration: 40,
      usageCount: 3,
      lastUsed: 'tuần trước',
      frequency: 'rare',
      color: '#F59E0B',
      waypoints: [
        { lat: 21.0275, lng: 105.8535 },
        { lat: 21.0200, lng: 105.8550 },
        { lat: 21.0100, lng: 105.8520 },
        { lat: 21.0000, lng: 105.8480 }
      ],
      landmarks: [],
      history: [
        { date: '18/6 09:00', duration: '42 phút' }
      ]
    },
    {
      id: 'route_004',
      name: 'Nhà → Nhà thờ Lớn',
      voiceCommand: 'đi nhà thờ',
      distance: 0.9,
      duration: 12,
      usageCount: 1,
      lastUsed: 'Chưa dùng tuần này',
      frequency: 'unused',
      color: '#94A3B8',
      waypoints: [
        { lat: 21.0275, lng: 105.8535 },
        { lat: 21.0288, lng: 105.8490 },
        { lat: 21.0292, lng: 105.8470 }
      ],
      landmarks: [],
      history: [
        { date: '10/6 16:00', duration: '14 phút' }
      ]
    }
  ],

  // ── Emergency Contacts ──
  emergencyContacts: [
    { id: 1, name: 'Con Lan', phone: '0912 345 678', order: 1 },
    { id: 2, name: 'Anh Hùng', phone: '0987 654 321', order: 2 },
    { id: 3, name: 'Bà Hoa', phone: '0965 432 100', order: 3 }
  ],

  // ── SOS Events ──
  sosEvents: [
    {
      id: 'sos_001',
      timestamp: new Date(2026, 5, 20, 16, 45).getTime(),
      timeStr: '20/06/2026 16:45',
      location: { lat: 21.0290, lng: 105.8545 },
      address: 'Hàng Bông, Hoàn Kiếm',
      status: 'resolved',
      respondedBy: 'Con Lan',
      respondedAt: '16:48',
      note: 'Bố bị ngã nhẹ, đã đến đón an toàn'
    }
  ],

  // ── Medical Profile ──
  medicalProfile: {
    fullName: 'Nguyễn Văn An',
    birthYear: 1955,
    age: 71,
    bloodType: 'O+',
    allergies: ['Penicillin', 'Aspirin liều cao'],
    conditions: ['Huyết áp cao', 'Tiểu đường type 2'],
    medications: [
      { name: 'Amlodipine 5mg', schedule: 'sáng' },
      { name: 'Metformin 500mg', schedule: 'sáng, tối' }
    ],
    doctor: {
      name: 'BS. Trần Minh',
      phone: '0912 345 678'
    }
  },

  // ── Statistics ──
  stats: {
    weekly: {
      totalKm: 8.4,
      totalObstacles: 47,
      totalTrafficLights: 12,
      days: [
        { day: 'T2', km: 2.1, obstacles: 12, lights: 3 },
        { day: 'T3', km: 0.8, obstacles: 5, lights: 1 },
        { day: 'T4', km: 3.2, obstacles: 18, lights: 4 },
        { day: 'T5', km: 0.5, obstacles: 3, lights: 1 },
        { day: 'T6', km: 1.8, obstacles: 9, lights: 3 },
        { day: 'T7', km: 0, obstacles: 0, lights: 0 },
        { day: 'CN', km: 0, obstacles: 0, lights: 0 }
      ]
    },
    frequentPlaces: [
      { icon: '🏪', name: 'Chợ Đồng Xuân', count: 5 },
      { icon: '🏥', name: 'Nhà thuốc Long Châu', count: 2 },
      { icon: '⛪', name: 'Nhà thờ Lớn', count: 1 }
    ],
    timeDistribution: [
      { range: '7:00–9:00', level: 90, label: 'nhiều' },
      { range: '9:00–11:00', level: 50, label: 'trung bình' },
      { range: '11:00–13:00', level: 20, label: 'ít' },
      { range: '13:00–17:00', level: 30, label: 'ít' }
    ],
    weeklyReport: 'Tuần này bố đã đi được 8.4 km, tránh 47 vật cản và nhận diện 12 đèn giao thông. Bố ra ngoài nhiều nhất vào sáng Thứ 4. Không có sự kiện SOS nào.',
    monthly: {
      totalKm: 32.6,
      totalObstacles: 182,
      totalTrafficLights: 48,
      days: [
        { day: 'Tuần 1', km: 7.8, obstacles: 38, lights: 10 },
        { day: 'Tuần 2', km: 8.4, obstacles: 47, lights: 12 },
        { day: 'Tuần 3', km: 9.2, obstacles: 52, lights: 14 },
        { day: 'Tuần 4', km: 7.2, obstacles: 45, lights: 12 }
      ]
    },
    monthlyReport: 'Tháng này bố đã đi được 32.6 km, tránh 182 vật cản và nhận diện 48 đèn giao thông. Trung bình mỗi tuần đi 8.2 km. Có 1 sự kiện SOS được xử lý an toàn.'
  },

  // ── Community Reports ──
  communityReports: [
    {
      id: 'rpt_001',
      type: 'Vỉa hè bị chiếm',
      severity: 'danger',
      lat: 21.0290,
      lng: 105.8545,
      address: 'Hàng Bông đoạn 120–150',
      description: 'Xe máy đậu chắn hết vỉa hè',
      timeAgo: '14 phút trước',
      confirmations: 8
    },
    {
      id: 'rpt_002',
      type: 'Đèn giao thông hỏng',
      severity: 'danger',
      lat: 21.0300,
      lng: 105.8530,
      address: 'Ngã tư Đinh Tiên Hoàng',
      description: 'Đèn bên phía đường Đinh Tiên Hoàng không hoạt động',
      timeAgo: '1 giờ trước',
      confirmations: 5
    },
    {
      id: 'rpt_003',
      type: 'Lối vào chợ vừa thông',
      severity: 'good',
      lat: 21.0370,
      lng: 105.8500,
      address: 'Cổng Bắc chợ Đồng Xuân',
      description: 'Lối đi bộ đã được dọn sạch',
      timeAgo: '3 giờ trước',
      confirmations: 3
    }
  ],

  // ── Settings ──
  settings: {
    voice: {
      gender: 'Nữ',
      region: 'miền Bắc',
      speed: 'Chậm',
      volume: 80,
      obstacleStyle: 'detailed' // 'detailed' | 'brief'
    },
    ai: {
      obstacleDetection: true,
      trafficLight: true,
      ocr: true,
      currency: true,
      faceRecognition: true,
      smallObstacle: false
    },
    gpsInterval: 5,
    notifications: {
      sos: true,
      lowBattery: true,
      lostConnection: true,
      weeklyReport: true,
      communityNearby: false
    },
    checkIn: {
      enabled: true,
      maxHours: 2,
      action: 'notify_then_call'
    }
  }
};
