# Báo cáo hiệu năng

## Thiết lập đo

- Chrome 154, Lighthouse Desktop, production build được phục vụ qua Vite Preview trên cùng máy.
- Dataset stress gồm đúng 10.000 bài tập.
- Baseline: danh sách thường, không virtualization; lọc ngay theo input và render card thường.
- Optimized: `React.memo`, handler ổn định, debounce 300 ms, lọc memoized và `react-window`.
- React Profiler đo trên Vite development build. Kịch bản gõ một ký tự `B`; React StrictMode đang bật nên số function render ở development có thể được gọi nhiều lần.

## Kết quả Lighthouse

| Chỉ số | Baseline | Optimized |
|---|---:|---:|
| Performance score | 80/100 | 100/100 |
| First Contentful Paint | 0.3 s | 0.3 s |
| Largest Contentful Paint | 0.4 s | 0.4 s |
| Total Blocking Time | 460 ms | 0 ms |
| DOM elements | 80,050 | 132 |

Lighthouse lưu báo cáo đầy đủ tại [lighthouse-baseline.html](./lighthouse-baseline.html) và [lighthouse-optimized.html](./lighthouse-optimized.html). React Profiler lưu số đo thao tác tìm kiếm tại [profiler-render-counts.json](./profiler-render-counts.json).

## Kết quả React Profiler

Khi nhập `B` vào ô tìm kiếm với 10.000 bài:

| Chỉ số | Baseline | Optimized |
|---|---:|---:|
| AssignmentCard render calls sau thao tác | 40,000 | 0 |
| Card nằm trong DOM | 10,000 | 9 |
| Profiler commits sau thao tác | 20,000 | 9 |

Render calls ở baseline bao gồm các lần gọi thêm do React StrictMode trong development. Bản tối ưu không gọi lại phần thân `AssignmentCard` khi danh sách đầu vào vẫn giữ nguyên object; các commit còn lại là row của virtual list và Profiler boundary.

## Tái chạy benchmark

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Trong terminal khác, chạy hai lệnh để ghi lại Lighthouse HTML:

```bash
npm run lighthouse:baseline
npm run lighthouse:optimized
```

Đo Profiler trong development:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
npm run profile:search
```

`profile:search` tự mở Chrome headless, so sánh baseline/optimized, rồi cập nhật `profiler-render-counts.json`.

## Redux Logger

Logger chạy khi `NODE_ENV=development`. Ba thao tác được log tương ứng với `assignments/addAssignment`, `assignments/removeAssignment`, và `assignments/toggleCompleted`. Action nạp stress `assignments/setItems` được lọc khỏi logger để không in toàn bộ 10.000 bản ghi.

Các sự kiện console thật cùng `prev state`, `action`, `next state` đã được thu qua Chrome DevTools Protocol và lưu tại [redux-logger-actions.json](./redux-logger-actions.json). Để chụp ảnh giao diện Console theo định dạng ảnh yêu cầu của giảng viên, mở app bằng `npm run dev`, mở DevTools → Console và chụp từng action; trình duyệt DevTools không thể được chụp tự động trong môi trường này.
