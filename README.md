# CurveLab — bản sẵn sàng deploy

- **CurveLab/**: website hoàn chỉnh, chứa `index.html` và toàn bộ tài nguyên cần thiết. Có thể mở `CurveLab/index.html` trực tiếp để dùng ngoại tuyến.
- **CurveLab-deploy.zip**: bản đóng gói để upload. Sau khi giải nén, `index.html` nằm ngay ở thư mục gốc.
- **development/**: tài liệu kỹ thuật, bộ kiểm thử, các mẫu kiểm tra và công cụ đóng gói. Không cần đưa thư mục này lên hosting.

## Đưa lên hosting

Đây là website tĩnh, không cần backend, cài thư viện hoặc chạy build. Chọn **CurveLab** làm thư mục xuất bản, hoặc upload toàn bộ nội dung của `CurveLab-deploy.zip` vào thư mục public của hosting. Giữ nguyên tên tệp và thư mục `vendor`. Trang đầu là `index.html`; các trang còn lại là `construction.html` và `studio.html`.

Dự án đã được cấu hình sẵn để triển khai lên **Vercel** kết hợp **Supabase PostgreSQL** (lưu bài vẽ, chia sẻ liên kết) và **Supabase Storage** (lưu trữ tệp xuất ảnh/LaTeX). Xem hướng dẫn chi tiết tại [DEPLOY_VERCEL_SUPABASE.md](file:///Users/mac/Downloads/CurveLab-v8/DEPLOY_VERCEL_SUPABASE.md).

Website lưu bản làm việc trên trình duyệt. Trước khi chuyển từ bản cục bộ sang tên miền mới, dùng **Lưu bài** để tải tệp JSON; trên website mới dùng **Mở bài**. Dữ liệu lưu ở địa chỉ cũ không tự chuyển sang địa chỉ mới.

## Kéo tên điểm

Trong hình học phẳng hoặc không gian, chọn **Chọn / di chuyển**, bật nhãn điểm, rồi kéo trực tiếp chữ A, B, C… quanh điểm. Nhãn được giới hạn trong khoảng 56 pixel tính từ điểm, không làm thay đổi tọa độ. Nhấp đúp nhãn để đặt lại vị trí mặc định. Hỗ trợ Ctrl+Z / Ctrl+Y, lưu/mở bài và xuất PNG/LaTeX.

## Tia và góc biết số đo

**Tia**: chọn gốc O rồi điểm A chỉ hướng, bấm Dựng hình. Có thể bấm vùng trống để tạo điểm ngay trong công cụ. Tia OA đi từ O qua A, kéo dài một phía và có mũi tên chỉ hướng. Công cụ Giao điểm hỗ trợ tia trong 2D.

**Góc biết số đo**: dựng sẵn đoạn thẳng, tia hoặc đường thẳng; chọn công cụ, nhập góc theo độ (ví dụ `60` hoặc `180/2`), chọn cùng/ngược chiều kim đồng hồ, chọn cạnh gốc trên hình hoặc trong danh sách rồi bấm Dựng hình. Số đo nằm trong khoảng 0° < α < 360°, hỗ trợ cả góc lớn hơn 180°. Nếu bật tự dựng, nhập các tùy chọn trước khi chọn cạnh. Bật **Ký hiệu tính chất** để hiện cung góc và số đo. Tia mới luôn giữ góc đã nhập khi các điểm gốc thay đổi.

Chiều thuận của đoạn AB lấy A làm đỉnh và hướng A→B; đảo chiều lấy B làm đỉnh, hướng B→A. Với tia / đường thẳng, đảo chiều giữ nguyên gốc dựng và đổi hướng. Trong 3D, chọn mặt phẳng qua đỉnh song song Oxy / Oxz / Oyz chứa hướng cạnh gốc; hướng quay được tính theo hướng nhìn ghi trong lựa chọn, không theo góc quay màn hình. Nếu cạnh không song song mặt phẳng đã chọn, chương trình báo lỗi để bạn đổi mặt phẳng.

## Kiểm thử và đóng gói lại

Từ thư mục này, chạy `node development/test.cjs` để kiểm tra. Trên Windows, chạy `node development/package.cjs` sau khi sửa website để cập nhật `CurveLab-deploy.zip`.

Đã xuất bản công khai: https://curvelab-linh.modest-coati-6135.chatgpt.site

Bản Sites được quản lý trong `development/publish/.openai/hosting.json`. Khi cập nhật website, đồng bộ các tệp từ `CurveLab/` sang `development/publish/dist/` rồi xuất bản tiếp trên cùng project, không tạo Site mới. Thông tin phiên bản đang chạy nằm trong `development/deployment.json`.
