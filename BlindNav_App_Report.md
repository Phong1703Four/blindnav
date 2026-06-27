# BlindNav — Báo cáo Chi tiết Ứng dụng Di động
### Dành cho người thân của người mù | Samsung Solve for Tomorrow 2026

---

## Tổng quan ứng dụng

BlindNav App là ứng dụng di động cài trên điện thoại của **con cái / người thân** người mù. App đóng vai trò trung tâm điều phối: nhận dữ liệu từ kính theo thời gian thực, cho phép người thân theo dõi, cài đặt và phản ứng khi có tình huống khẩn cấp.

**Đối tượng dùng app:** Con cái, vợ/chồng, người chăm sóc — không phải bản thân người mù.

**Nền tảng:** iOS và Android.

**Kết nối:** App ↔ Server ↔ Kính thông minh qua WiFi / 4G.

---

## Cấu trúc điều hướng

App có **thanh điều hướng dưới (bottom navigation bar)** gồm 5 tab chính, luôn hiển thị ở mọi màn hình:

```
[ 📍 Theo dõi ]  [ 🗺️ Lộ trình ]  [ 🚨 SOS ]  [ 📊 Thống kê ]  [ ⚙️ Cài đặt ]
```

Tab **SOS** nằm ở giữa, lớn hơn và màu đỏ để dễ bấm trong tình huống khẩn cấp.

Ngoài ra có màn hình **Cộng đồng** truy cập từ màn hình Theo dõi (nút góc phải trên).

---

## Màn hình 0 — Đăng nhập & Ghép đôi kính

### Mục đích
Lần đầu mở app, người thân cần tạo tài khoản và ghép đôi với kính của người mù.

### Luồng sử dụng
1. Mở app → màn hình chào với logo BlindNav và tagline *"Luôn bên cạnh, dù cách xa"*
2. Chọn **Đăng ký** → nhập số điện thoại → nhận OTP → xác nhận
3. Nhập tên người thân mù (ví dụ: "Bố") và ảnh đại diện
4. Bấm **Ghép đôi kính** → quét mã QR hiển thị trên màn hình kính → ghép đôi thành công
5. Chuyển thẳng vào màn hình Theo dõi

### Giao diện
- Nền trắng sạch, logo xanh dương ở giữa
- Nút "Đăng ký" nổi bật, nút "Đăng nhập" phụ ở dưới
- Bước ghép đôi có hoạt ảnh camera quét QR, thanh tiến trình 3 bước rõ ràng

---

## Màn hình 1 — Theo dõi GPS (Tab chính)

### Mục đích
Màn hình người thân mở **nhiều nhất** — xem bố/mẹ đang ở đâu, tình trạng kính thế nào, có an toàn không.

### Bố cục màn hình
```
┌─────────────────────────────────┐
│  🔵 Bố đang hoạt động    [···]  │  ← Header trạng thái
├─────────────────────────────────┤
│                                 │
│         [BẢN ĐỒ LIVE]          │  ← 60% màn hình
│    📍 icon người trên bản đồ    │
│    ──── vệt đường đã đi ────    │
│                                 │
├─────────────────────────────────┤
│  🔋 Pin kính: 78%  📶 Tốt       │  ← Thanh trạng thái kính
├─────────────────────────────────┤
│  📍 Hàng Bông, Hoàn Kiếm       │  ← Địa chỉ hiện tại (text)
│  🚶 1.2 km/h · Hướng: Bắc      │
│  🕐 Ra khỏi nhà: 45 phút       │
├─────────────────────────────────┤
│  [Xem lộ trình đang dùng]  [>]  │
│  [Lịch sử hôm nay]         [>]  │
│  [Đặt vùng an toàn]        [>]  │
└─────────────────────────────────┘
```

### Chi tiết từng thành phần

**Header trạng thái:**
- Tên người mù + chấm xanh nhấp nháy nếu đang hoạt động
- Chấm xám nếu kính tắt, chấm đỏ nếu mất kết nối > 5 phút
- Nút `···` mở menu nhanh: gọi điện, nhắn tin, xem hồ sơ y tế

**Bản đồ live:**
- Dùng nền bản đồ OpenStreetMap
- Icon người mù (hình người + kính) thay vì chấm tròn bình thường
- Vệt xanh mờ hiển thị đường đã đi trong 30 phút qua
- Bấm vào bản đồ để phóng to / thu nhỏ
- Nút 🎯 góc dưới phải: tự động căn giữa về vị trí người mù

**Thanh trạng thái kính:**
- Pin hiển thị dạng thanh màu + phần trăm. Dưới 20% → chuyển đỏ + cảnh báo
- Tín hiệu kết nối: Tốt / Trung bình / Yếu / Mất kết nối
- Nếu mất kết nối: hiển thị "Mất tín hiệu 3 phút trước" + nút **Liên hệ ngay**

**Địa chỉ và chuyển động:**
- Địa chỉ cập nhật mỗi 10 giây từ GPS + dịch ngược tên đường
- Tốc độ di chuyển: nếu đứng yên > 10 phút → hiển thị "Đang đứng yên"
- Thời gian ra khỏi nhà tính từ lần cuối rời geofence nhà

**3 nút tắt:**
- *Xem lộ trình đang dùng:* hiện lộ trình đang active trên bản đồ
- *Lịch sử hôm nay:* mở timeline các điểm đã đi
- *Đặt vùng an toàn:* shortcut vào cài đặt geofence

### Tính năng Geofence (Vùng an toàn)
Mở từ nút "Đặt vùng an toàn":
- Kéo thả để vẽ vùng tròn trên bản đồ (bán kính 500m đến 5km)
- Có thể đặt nhiều vùng: "Vùng nhà", "Vùng chợ", "Vùng bệnh viện"
- Mỗi vùng chọn hành động khi ra ngoài: **Chỉ thông báo** hoặc **Thông báo + Gọi điện**
- Có thể tắt geofence tạm thời khi biết người thân đi xa

---

## Màn hình 2 — Lộ trình quen thuộc

### Mục đích
Con cái tạo sẵn các lộ trình thường dùng. Người mù chỉ cần nói tên lộ trình, kính tự dẫn — không cần AI tính toán real-time mỗi lần.

### Bố cục màn hình chính
```
┌─────────────────────────────────┐
│  Lộ trình của Bố         [+ Thêm]│
├─────────────────────────────────┤
│  🟢 Nhà → Chợ Đồng Xuân        │
│     1.4 km · Dùng 12 lần       │
│     Lần cuối: hôm qua 8:30     │  [>]
├─────────────────────────────────┤
│  🔵 Nhà → Trạm xe buýt 36      │
│     600 m · Dùng 8 lần         │
│     Lần cuối: 3 ngày trước     │  [>]
├─────────────────────────────────┤
│  🟡 Nhà → Bệnh viện Bạch Mai   │
│     3.1 km · Dùng 3 lần        │
│     Lần cuối: tuần trước       │  [>]
├─────────────────────────────────┤
│  ⬜ Nhà → Nhà thờ Lớn          │
│     900 m · Dùng 1 lần         │
│     Chưa dùng tuần này         │  [>]
└─────────────────────────────────┘
```

Màu chấm = mức độ sử dụng: xanh lá (hay dùng), xanh dương (bình thường), vàng (ít dùng), xám (lâu không dùng).

### Tạo lộ trình mới

Bấm **+ Thêm** → mở luồng 4 bước:

**Bước 1 — Đặt điểm đi và đến**
- Bản đồ toàn màn hình
- Thanh tìm kiếm trên cùng: gõ địa chỉ điểm đến
- Điểm xuất phát mặc định là "Nhà" (đã lưu sẵn)
- App tự vẽ tuyến đường đi bộ tối ưu màu xanh

**Bước 2 — Điều chỉnh lộ trình**
- Kéo đường lộ trình sang trái/phải để chọn đường khác nếu muốn
- Bấm vào đoạn đường để xem tên đường
- Nút "Dùng lộ trình này" xác nhận

**Bước 3 — Thêm điểm mốc**
Đây là tính năng quan trọng nhất của màn hình này:
- Bấm vào bất kỳ vị trí trên lộ trình → popup thêm điểm mốc
- Nhập ghi chú: "Bậc thềm cao 20cm", "Cột điện chắn lối", "Ngã tư đông xe", "Cổng chợ hẹp"
- Chọn mức độ cảnh báo: **Nhắc nhở** (nói nhẹ) hoặc **Cảnh báo** (nói rõ, rung mạnh)
- Chọn thời điểm nhắc: 5m, 10m, hoặc 20m trước khi đến điểm đó

Ví dụ điểm mốc thực tế:
```
📍 [Điểm mốc tại km 0.3]
   "Bậc thềm cao tại cổng chợ"
   Nhắc trước: 10 mét
   Mức độ: Cảnh báo
```

**Bước 4 — Đặt tên và lưu**
- Nhập tên lộ trình: "Đi chợ sáng", "Về nhà từ bệnh viện"
- Chọn lệnh giọng nói kích hoạt: mặc định là tên lộ trình, có thể tùy chỉnh
- Bấm **Lưu vào kính** → đồng bộ lên kính ngay lập tức

### Chi tiết lộ trình (khi bấm vào 1 lộ trình)

```
┌─────────────────────────────────┐
│  ← Nhà → Chợ Đồng Xuân    [✏️] │
├─────────────────────────────────┤
│         [BẢN ĐỒ LỘ TRÌNH]      │
│    ───●──────●────●─────●───   │
│       A      B    C     D       │
├─────────────────────────────────┤
│  📏 1.4 km  ·  🚶 ~18 phút     │
├─────────────────────────────────┤
│  ĐIỂM MỐC (3)                  │
│  ⚠️  km 0.3 · Bậc thềm cao     │
│  ℹ️  km 0.8 · Rẽ trái hẻm nhỏ  │
│  ⚠️  km 1.2 · Đèn đỏ dài       │
├─────────────────────────────────┤
│  LỊCH SỬ SỬ DỤNG              │
│  Hôm qua 08:32 · 19 phút       │
│  21/6 08:15    · 21 phút       │
│  19/6 09:02    · 17 phút       │
├─────────────────────────────────┤
│  [Cập nhật lộ trình]           │
│  [Xóa lộ trình]                │
└─────────────────────────────────┘
```

### Cập nhật lộ trình từ xa
Khi đường thi công hoặc có thay đổi:
- Con cái chỉnh lộ trình trên app → bấm **Đồng bộ**
- Kính nhận cập nhật tự động trong vòng 30 giây
- Lần sau người mù dùng lệnh giọng nói → kính dẫn theo lộ trình mới
- Người mù không cần làm gì

---

## Màn hình 3 — Trung tâm SOS

### Mục đích
Quản lý tình huống khẩn cấp: cài đặt danh sách liên hệ, xem lịch sử SOS, và nhận cảnh báo tức thì.

### Bố cục màn hình chính
```
┌─────────────────────────────────┐
│  Trung tâm SOS                  │
├─────────────────────────────────┤
│  TRẠNG THÁI HIỆN TẠI           │
│  ✅ Bố đang an toàn             │
│  Ra ngoài 45 phút · GPS ổn     │
├─────────────────────────────────┤
│  LIÊN HỆ KHẨN CẤP             │
│  1. Con Lan    0912 xxx xxx     │
│  2. Anh Hùng   0987 xxx xxx    │
│  3. Bà Hoa     0965 xxx xxx    │
│                    [Chỉnh sửa] │
├─────────────────────────────────┤
│  CHECK-IN TỰ ĐỘNG              │
│  Bật · Ra ngoài > 2 giờ → báo │
│                    [Chỉnh sửa] │
├─────────────────────────────────┤
│  LỊCH SỬ SOS (30 ngày qua)    │
│  Không có sự kiện nào          │
└─────────────────────────────────┘
```

### Khi SOS kích hoạt — Màn hình khẩn cấp

Khi người mù bấm nút SOS trên kính, app chuyển ngay sang màn hình này với nền đỏ:

```
┌─────────────────────────────────┐
│  🚨 BỐ VỪA BẤM SOS             │  ← Nền đỏ, chữ trắng
│  21:34 · Hàng Bông, Hoàn Kiếm  │
├─────────────────────────────────┤
│  [XEM VỊ TRÍ TRÊN BẢN ĐỒ]     │  ← Nút lớn, nền trắng
├─────────────────────────────────┤
│  ĐANG XỬ LÝ TỰ ĐỘNG           │
│  ✅ Đã gửi SMS vị trí 3 người   │
│  🔄 Đang gọi Con Lan...         │
│  ⏳ Dự phòng: Anh Hùng (10s)   │
├─────────────────────────────────┤
│  GHI ÂM MÔI TRƯỜNG             │
│  ▶️ 00:28  [Nghe]  [Tải về]    │
├─────────────────────────────────┤
│  [Báo đã xử lý — Bố ổn rồi]   │
└─────────────────────────────────┘
```

**Luồng xử lý tự động khi SOS:**

1. App rung + âm thanh cảnh báo ngay lập tức (không thể tắt tiếng)
2. Gửi SMS link Google Maps tới tất cả liên hệ khẩn cấp
3. Gọi điện cho liên hệ số 1 — nếu không bắt máy sau 10 giây → gọi liên hệ số 2 → số 3
4. Hiển thị file ghi âm 30 giây xung quanh người mù lúc SOS (để biết chuyện gì xảy ra)
5. Bản đồ tự động căn giữa vị trí SOS

**Bấm "Báo đã xử lý":** Dừng quy trình gọi điện tự động, ghi nhận sự kiện đã giải quyết.

### Cài đặt liên hệ khẩn cấp
```
┌─────────────────────────────────┐
│  ← Liên hệ khẩn cấp            │
├─────────────────────────────────┤
│  Thứ tự gọi khi SOS:           │
│                                 │
│  ≡ 1. Con Lan   0912 xxx xxx   │  ← Kéo thả để đổi thứ tự
│  ≡ 2. Anh Hùng  0987 xxx xxx  │
│  ≡ 3. Bà Hoa    0965 xxx xxx  │
│                                 │
│  [+ Thêm liên hệ]              │
├─────────────────────────────────┤
│  Gọi mỗi người tối đa: 15 giây │
│  Sau khi thử hết: Gọi 113/115  │
└─────────────────────────────────┘
```

### Check-in tự động
Tính năng cảnh báo khi người mù ra ngoài lâu mà không về:
- **Cài thời gian:** 1 giờ / 2 giờ / 3 giờ / Tùy chỉnh
- **Hành động khi quá giờ:** Thông báo → Gọi điện → Báo SOS đầy đủ
- **Tắt tạm:** Khi biết người thân đi xa (đi thăm con ở tỉnh khác...)
- **Tự reset:** Khi kính phát hiện người dùng trở về vùng nhà

### Lịch sử SOS
Mỗi sự kiện SOS lưu lại:
- Thời gian, địa điểm chính xác
- Ai đã phản hồi và lúc mấy giờ
- File ghi âm (lưu 30 ngày)
- Ghi chú của người thân (thêm sau)

---

## Màn hình 4 — Thống kê

### Mục đích
Cho thấy BlindNav đang thực sự giúp ích — bằng số liệu cụ thể mỗi ngày.

### Bố cục màn hình
```
┌─────────────────────────────────┐
│  Thống kê       [Tuần] [Tháng] │
│  2 – 8 tháng 6, 2026           │
├─────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 8.4  │ │  47  │ │  12  │   │
│  │  km  │ │vật   │ │ đèn  │   │
│  │ đi   │ │cản   │ │giao  │   │
│  │được  │ │tránh │ │thông │   │
│  └──────┘ └──────┘ └──────┘   │
├─────────────────────────────────┤
│  HOẠT ĐỘNG THEO NGÀY           │
│  T2 ████████ 2.1 km            │
│  T3 ███ 0.8 km                 │
│  T4 █████████████ 3.2 km       │
│  T5 ██ 0.5 km                  │
│  T6 ██████ 1.8 km              │
│  T7 0 km                       │
│  CN 0 km                       │
├─────────────────────────────────┤
│  ĐỊA ĐIỂM THƯỜNG LUI TỚI      │
│  🏪 Chợ Đồng Xuân · 5 lần      │
│  🏥 Nhà thuốc Long Châu · 2 lần│
│  ⛪ Nhà thờ Lớn · 1 lần        │
├─────────────────────────────────┤
│  KHUNG GIỜ THƯỜNG ĐI           │
│  7:00–9:00   ██████████ nhiều  │
│  9:00–11:00  █████ trung bình  │
│  11:00–13:00 ██ ít             │
│  13:00–17:00 ███ ít            │
└─────────────────────────────────┘
```

### Các chỉ số theo dõi

**Km đã đi:** Tổng quãng đường mỗi ngày/tuần/tháng. Biểu đồ cột cho thấy ngày nào bố ra ngoài nhiều.

**Vật cản đã tránh:** Số lần kính phát hiện và cảnh báo vật cản thành công. Con số này tăng → kính đang hoạt động tốt.

**Đèn giao thông nhận ra:** Số lần AI phát hiện đèn đỏ/xanh và cảnh báo. Quan trọng để kiểm tra AI hoạt động đúng không.

**Địa điểm thường lui tới:** Tổng hợp từ GPS history — hiểu thói quen di chuyển của người thân.

**Khung giờ thường đi:** Giúp con cái biết lúc nào bố hay ra ngoài để chú ý điện thoại hơn.

### Báo cáo tự động hàng tuần
Mỗi Chủ nhật, app tự tạo và đẩy thông báo tóm tắt:

> **📊 Báo cáo tuần của Bố**
> Tuần này bố đã đi được 8.4 km, tránh 47 vật cản và nhận diện 12 đèn giao thông. Bố ra ngoài nhiều nhất vào sáng Thứ 4. Không có sự kiện SOS nào. 💙

Bấm vào thông báo → mở chi tiết báo cáo đầy đủ có thể chia sẻ (png hoặc PDF) cho anh chị em cùng theo dõi.

### Heatmap địa điểm
Tab **Bản đồ nhiệt** trong màn hình thống kê:
- Hiển thị vùng màu nhiệt trên bản đồ theo mức độ lui tới
- Màu đỏ = hay đi nhiều nhất, vàng = trung bình, xanh = ít
- Giúp biết đường quen / đường lạ để ưu tiên thêm điểm mốc

---

## Màn hình 5 — Cộng đồng

### Mục đích
Người dùng BlindNav báo cáo vật cản thực tế trên đường — kính của tất cả người dùng khác tự nhận cảnh báo khi đi qua khu vực đó.

### Bố cục màn hình
```
┌─────────────────────────────────┐
│  Cộng đồng    [Gần tôi ▼] [+]  │
├─────────────────────────────────┤
│         [BẢN ĐỒ CỘNG ĐỒNG]    │
│   🔴 🟡 🟢 · các điểm báo cáo  │
├─────────────────────────────────┤
│  GẦN VỊ TRÍ CỦA BỐ            │
│                                 │
│  🔴 Vỉa hè bị chiếm            │
│  Hàng Bông đoạn 120–150        │
│  14 phút trước · 8 xác nhận    │
│                                 │
│  🔴 Đèn giao thông hỏng        │
│  Ngã tư Đinh Tiên Hoàng        │
│  1 giờ trước · 5 xác nhận      │
│                                 │
│  🟢 Lối vào chợ vừa thông      │
│  Cổng Bắc chợ Đồng Xuân        │
│  3 giờ trước · 3 xác nhận      │
└─────────────────────────────────┘
```

### Màu sắc báo cáo
- 🔴 Đỏ: Nguy hiểm (đèn hỏng, đường đào, vật cản lớn)
- 🟡 Vàng: Chú ý (vỉa hè bị chiếm, xe đậu bừa)
- 🟢 Xanh: Thông tin tốt (đường vừa thông, lối đi mới)

### Thêm báo cáo mới
Bấm nút `+` góc phải trên:
1. Bản đồ mở ra — bấm vào vị trí cần báo cáo
2. Chọn loại: Vỉa hè bị chiếm / Đường đào / Đèn hỏng / Nguy hiểm khác / Thông tin tốt
3. Nhập mô tả ngắn (tùy chọn): "Xe tải đậu chắn hết lối đi"
4. Bấm **Gửi** → hiển thị ngay trên bản đồ cộng đồng

### Cơ chế xác nhận
- Người dùng khác bấm ✅ **Xác nhận** nếu vẫn còn tình trạng đó
- Bấm ❌ **Đã hết** nếu đường thông rồi
- Báo cáo tự ẩn sau 24 giờ hoặc khi có đủ 5 phản hồi "Đã hết"
- Báo cáo có nhiều xác nhận → hiển thị nổi bật hơn trên bản đồ

### Ảnh hưởng đến kính
Khi kính của người mù đi qua khu vực có báo cáo cộng đồng trong vòng 50m:
- Loa thông báo: *"Cộng đồng báo cáo: vỉa hè bị chiếm phía trước, cẩn thận"*
- Rung nhẹ kèm theo

### Chia sẻ dữ liệu với chính quyền
Trong phần cài đặt cộng đồng, người dùng có thể chọn **Đóng góp dữ liệu ẩn danh** cho UBND phường — giúp chính quyền biết điểm nóng cần xử lý vỉa hè.

---

## Màn hình 6 — Cài đặt

### Mục đích
Tùy chỉnh toàn bộ trải nghiệm: giọng nói kính, tính năng AI, thông tin y tế, và quản lý tài khoản.

### Bố cục màn hình
```
┌─────────────────────────────────┐
│  Cài đặt                        │
├─────────────────────────────────┤
│  👤 HỒ SƠ NGƯỜI DÙNG KÍNH      │
│  Tên: Bố                        │
│  Ảnh · Thông tin y tế      [>] │
├─────────────────────────────────┤
│  🔊 GIỌNG NÓI & ÂM THANH       │
│  Giọng: Nữ miền Bắc        [>] │
│  Tốc độ đọc: Chậm          [>] │
│  Âm lượng: ████████░░          │
├─────────────────────────────────┤
│  🤖 TÍNH NĂNG AI               │
│  Nhận diện vật cản      [ON ●] │
│  Đèn giao thông         [ON ●] │
│  OCR đọc biển hiệu      [ON ●] │
│  Nhận diện tiền         [ON ●] │
│  Nhận diện người thân   [ON ●] │
│  Thông báo vật cản nhỏ  [OFF○] │
├─────────────────────────────────┤
│  📍 VỊ TRÍ & AN TOÀN           │
│  Cập nhật GPS: mỗi 5 giây  [>] │
│  Geofence                   [>] │
│  Check-in tự động           [>] │
├─────────────────────────────────┤
│  🔔 THÔNG BÁO                  │
│  SOS                    [ON ●] │
│  Pin kính yếu (<20%)    [ON ●] │
│  Mất kết nối kính       [ON ●] │
│  Báo cáo tuần           [ON ●] │
│  Cộng đồng gần bố       [OFF○] │
├─────────────────────────────────┤
│  ℹ️  Về BlindNav · Hỗ trợ       │
└─────────────────────────────────┘
```

### Hồ sơ y tế
Quan trọng nhất trong phần cài đặt — hiển thị tự động khi SOS kích hoạt:

```
┌─────────────────────────────────┐
│  ← Hồ sơ y tế của Bố           │
├─────────────────────────────────┤
│  Họ tên: Nguyễn Văn An         │
│  Năm sinh: 1955 (71 tuổi)      │
│  Nhóm máu: O+                  │
├─────────────────────────────────┤
│  DỊ ỨNG THUỐC                 │
│  ⚠️ Penicillin                  │
│  ⚠️ Aspirin liều cao            │
├─────────────────────────────────┤
│  BỆNH NỀN                      │
│  • Huyết áp cao                │
│  • Tiểu đường type 2           │
├─────────────────────────────────┤
│  THUỐC ĐANG DÙNG              │
│  • Amlodipine 5mg (sáng)       │
│  • Metformin 500mg (sáng, tối) │
├─────────────────────────────────┤
│  LIÊN HỆ BÁC SĨ               │
│  BS. Trần Minh – 0912 xxx xxx  │
└─────────────────────────────────┘
```

Khi nhân viên cứu thương đến, màn hình này tự bật full-screen trên kính, không cần mở khóa.

### Cài đặt giọng nói chi tiết
- **Giọng:** Nữ miền Bắc / Nam miền Bắc / Nữ miền Nam / Nam miền Nam
- **Tốc độ đọc:** Rất chậm / Chậm / Bình thường / Nhanh — người già thường dùng Chậm
- **Kiểu thông báo vật cản:** Nói đầy đủ ("Cẩn thận, có người phía trước, cách 2 mét") hoặc Ngắn gọn ("Người, 2m")
- **Chế độ yên tĩnh:** Tắt thông báo không quan trọng từ 21:00–7:00

### Cài đặt tần suất GPS
- Mỗi 5 giây (mặc định, tốn pin hơn)
- Mỗi 10 giây (cân bằng)
- Mỗi 30 giây (tiết kiệm pin, ít chính xác hơn)

### Quản lý người dùng kính
Một tài khoản app có thể quản lý **nhiều kính** (nếu cả bố và mẹ đều dùng):
- Tab chuyển đổi ở đầu màn hình Theo dõi: "Bố | Mẹ"
- Mỗi kính cài đặt độc lập hoàn toàn

---

## Thông báo đẩy (Push Notifications)

App gửi các loại thông báo sau, người dùng có thể tắt từng loại trong Cài đặt:

| Loại thông báo | Nội dung | Có thể tắt? |
|---|---|---|
| SOS | "🚨 Bố vừa bấm SOS! Vị trí: Hàng Bông" | Không |
| Pin yếu | "🔋 Pin kính của Bố còn 15%" | Có |
| Mất kết nối | "📡 Mất tín hiệu kính của Bố 5 phút" | Có |
| Ra khỏi vùng | "📍 Bố vừa ra khỏi vùng an toàn" | Có |
| Check-in | "⏰ Bố ra ngoài đã 2 tiếng, chưa về" | Có |
| Báo cáo tuần | "📊 Báo cáo tuần của Bố đã sẵn sàng" | Có |
| Cộng đồng gần bố | "⚠️ Vỉa hè bị chiếm gần vị trí của Bố" | Có |

---

## Thiết kế giao diện chung

### Màu sắc chủ đạo
- **Xanh dương chính** (`#1A73E8`): Nút, liên kết, tiêu đề phụ
- **Xanh đậm** (`#0D47A1`): Tiêu đề chính, header
- **Đỏ** (`#E24B4A`): SOS, cảnh báo nguy hiểm, pin yếu
- **Xanh lá** (`#1D9E75`): Trạng thái ổn, xác nhận thành công
- **Vàng** (`#F59E0B`): Chú ý, cảnh báo mức nhẹ
- **Nền** trắng sạch, text tối — dễ đọc trong mọi điều kiện ánh sáng

### Font chữ
- Font hệ thống (SF Pro trên iOS, Roboto trên Android)
- Cỡ chữ mặc định lớn hơn bình thường 10% — vì người dùng app thường lớn tuổi
- Hỗ trợ Dynamic Type (iOS) và Text Scale (Android) để người dùng tự chỉnh

### Triết lý thiết kế
- **Ưu tiên thông tin quan trọng nhất** lên đầu mỗi màn hình
- **Nút hành động khẩn cấp** luôn dễ tìm, kích thước lớn
- **Ít thao tác nhất có thể** — từ khi mở app đến khi biết bố đang ở đâu: 0 bấm (hiện ngay)
- **Trạng thái luôn rõ ràng** — xanh là ổn, đỏ là cần chú ý, không bao giờ mơ hồ

---

*BlindNav App — Thiết kế vì sự an tâm của người thân.*
*Samsung Solve for Tomorrow 2026 | Nhóm [Tên nhóm] | Trường [Tên trường]*
