# Assignment Manager — bài thực hành nâng cấp

Project độc lập React 18 + TypeScript, không phụ thuộc repo `industrial-control-center`.

## Chạy project

```bash
npm install
npm run dev
```

Lệnh kiểm tra:

```bash
npm test          # Jest + RTL + coverage
npm run lint      # TypeScript strict check
npm run build     # production build
```

## Đối chiếu yêu cầu

- `usePinStore` dùng Zustand: ghim/bỏ ghim và sắp xếp item đã ghim lên đầu.
- `ThemeContext` độc lập, provider value được bọc bằng `useMemo`.
- Redux Logger chỉ bật khi `NODE_ENV=development`; action thêm, xoá, hoàn thành được ghi nhận.
- Stress test sinh đúng 10.000 bài tập mẫu.
- `AssignmentCard` dùng `React.memo`, handler dùng `useCallback`.
- Tìm kiếm dùng `useDebounce(300)` và `useMemo`.
- Danh sách dùng `react-window`; trang thống kê dùng `React.lazy` + `Suspense`.
- Jest + ts-jest + React Testing Library: 27 test; coverage `src/features/` vượt 70% statements.

Xem [PERFORMANCE.md](./PERFORMANCE.md) để biết cách đo và bảng trước/sau. Báo cáo Lighthouse được lưu tại `lighthouse-baseline.html` và `lighthouse-optimized.html`; số liệu máy đọc được ở `lighthouse-metrics.json` và `profiler-render-counts.json`.

Các action Redux Logger thực tế đã được chạy và lưu state trước/sau tại `redux-logger-actions.json`. `npm run capture:logger` có thể ghi lại lại các sự kiện này.
