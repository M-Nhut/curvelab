# Hướng dẫn triển khai CurveLab lên Vercel kết hợp Supabase (PostgreSQL & Storage)

Tài liệu này hướng dẫn chi tiết từng bước để triển khai website **CurveLab** lên **Vercel** và thiết lập cơ sở dữ liệu **Supabase PostgreSQL** cùng **Supabase Storage** để lưu trữ bài vẽ và tệp xuất.

---

## 1. Kiến trúc hệ thống

- **Frontend Hosting (Vercel)**:
  - Máy chủ toàn cầu (Global Edge Network), hỗ trợ HTTPS miễn phí, tốc độ tải cực nhanh.
  - Tự động định tuyến các không gian hình học (`/`, `/construction`, `/studio`) thông qua tệp cấu hình `vercel.json`.
  - Bộ nhớ đệm (caching) tối ưu cho các thư viện toán học lớn như MathJax trong `vendor/`.
- **Database (Supabase PostgreSQL)**:
  - Bảng `curvelab_projects` lưu trữ toàn bộ dữ liệu bài vẽ dưới dạng **JSONB**.
  - Tự động sinh mã chia sẻ ngắn gọn (`short_id`, ví dụ: `e8f1a23b`) để dễ dàng chia sẻ liên kết bài làm.
  - Phân loại rõ ràng 5 không gian hình học: `curve`, `surface`, `plane_geometry`, `space_geometry`, `worksheet`.
  - Thiết lập chính sách bảo mật **Row Level Security (RLS)** sẵn sàng.
- **Storage (Supabase Storage)**:
  - Bucket `curvelab-files` công khai (Public) để lưu trữ tệp ảnh PNG, mã nguồn LaTeX (`.tex`) và tệp sao lưu JSON.

---

## 2. Thiết lập Supabase (PostgreSQL & Storage)

### Bước 2.1: Tạo Project trên Supabase
1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập hoặc tạo tài khoản miễn phí.
2. Bấm **New Project**, đặt tên (ví dụ: `curvelab`), mật khẩu cơ sở dữ liệu và chọn Region gần nhất (ví dụ: `Singapore` - `ap-southeast-1`).
3. Chờ 1–2 phút để Supabase khởi tạo dự án.

### Bước 2.2: Khởi tạo bảng PostgreSQL
1. Trong thanh điều hướng bên trái của Supabase Dashboard, chọn biểu tượng **SQL Editor**.
2. Bấm **New query**.
3. Mở tệp [`supabase/schema.sql`](file:///Users/mac/Downloads/CurveLab-v8/supabase/schema.sql) trong thư mục dự án, sao chép toàn bộ nội dung và dán vào SQL Editor.
4. Bấm **Run** (hoặc `Ctrl + Enter` / `Cmd + Enter`).
5. Kết quả sẽ hiện `Success. No rows returned`. Bảng `curvelab_projects` và các chính sách bảo mật RLS đã được tạo thành công.

### Bước 2.3: Khởi tạo Storage Bucket
1. Tiếp tục tại **SQL Editor**, bấm **New query**.
2. Mở tệp [`supabase/storage.sql`](file:///Users/mac/Downloads/CurveLab-v8/supabase/storage.sql), sao chép toàn bộ nội dung và dán vào.
3. Bấm **Run**.
4. Vào mục **Storage** ở thanh bên trái, bạn sẽ thấy bucket `curvelab-files` với nhãn `Public`.

### Bước 2.4: Lấy thông tin API Key
1. Vào **Project Settings** (biểu tượng bánh răng ở thanh bên trái) -> chọn mục **API**.
2. Sao chép hai thông số:
   - **Project URL**: dạng `https://[project-ref].supabase.co`
   - **anon / public key**: chuỗi token bắt đầu bằng `eyJhbGciOi...`

---

## 3. Triển khai lên Vercel

Dự án đã được cấu hình sẵn 2 tệp [`vercel.json`](file:///Users/mac/Downloads/CurveLab-v8/vercel.json) ở thư mục gốc và [`CurveLab/vercel.json`](file:///Users/mac/Downloads/CurveLab-v8/CurveLab/vercel.json), giúp bạn triển khai dễ dàng theo một trong hai cách dưới đây:

### Cách 3.1: Triển khai qua Vercel Dashboard (Khuyên dùng)
1. Đẩy mã nguồn dự án lên GitHub, GitLab hoặc Bitbucket.
2. Truy cập [https://vercel.com](https://vercel.com) và bấm **Add New...** -> **Project**.
3. Chọn kho lưu trữ chứa CurveLab và bấm **Import**.
4. Cấu hình Project trên Vercel:
   - **Framework Preset**: Chọn `Other`.
   - **Root Directory**:
     - **Khuyên dùng tốt nhất**: Bấm **Edit** cạnh Root Directory và chọn thư mục **`CurveLab`** (để Vercel xuất bản thẳng các trang từ thư mục này, không bị lỗi 404).
     - Nếu để mặc định `./`, dự án đã có tệp `index.html` và `vercel.json` ở gốc tự động chuyển hướng vào `CurveLab`.
   - **Environment Variables**: Thêm 2 biến môi trường đã lấy từ Supabase ở Bước 2.4:
     - `NEXT_PUBLIC_SUPABASE_URL` = `[Project URL của bạn]`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[anon key của bạn]`
5. Bấm nút **Deploy**.
6. Sau vài giây, trang web của bạn sẽ hoạt động tại địa chỉ tên miền do Vercel cấp (ví dụ: `https://curvelab-xxx.vercel.app`).

> [!TIP]
> **Nếu bạn đã deploy rồi mà gặp lỗi 404 trên Vercel**:
> 1. Vào **Vercel Dashboard** -> Chọn project của bạn -> Vào mục **Settings** -> **General**.
> 2. Tìm mục **Root Directory** -> Bấm nút **Edit** -> Gõ hoặc chọn **`CurveLab`** -> Bấm **Save**.
> 3. Chuyển sang tab **Deployments** -> Bấm vào dấu `...` ở bản deploy mới nhất -> Chọn **Redeploy**. Website sẽ hoạt động ngay lập tức!

### Cách 3.2: Triển khai nhanh qua Vercel CLI
Nếu bạn đã cài Vercel CLI trên máy tính:
```bash
# Đăng nhập vào Vercel (nếu chưa)
npx vercel login

# Triển khai dự án lên Vercel
npx vercel

# Triển khai bản chính thức (Production)
npx vercel --prod
```

---

## 4. Cách sử dụng thư viện Supabase Client trong mã nguồn

Tệp [`supabase/curvelab-supabase.js`](file:///Users/mac/Downloads/CurveLab-v8/supabase/curvelab-supabase.js) đã được viết sẵn đầy đủ các hàm giao tiếp.

### Nhúng thư viện vào trang HTML
Thêm đoạn script sau vào trước thẻ đóng `</body>` trong trang HTML của bạn (ví dụ `index.html` hoặc `construction.html`):

```html
<!-- Nạp Supabase JS SDK từ CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Nạp bộ công cụ tích hợp CurveLab Supabase -->
<script src="../supabase/curvelab-supabase.js"></script>

<script>
  // 1. Khởi tạo kết nối
  const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
  const supabaseAnonKey = 'YOUR_ANON_KEY';
  CurveLabSupabase.init(supabaseUrl, supabaseAnonKey);

  // 2. Ví dụ: Lưu bài vẽ hiện tại lên PostgreSQL
  async function saveToCloud(drawingData, projectTitle) {
    const { data, error } = await CurveLabSupabase.saveProject({
      title: projectTitle || 'Tam giác Euler',
      category: 'plane_geometry',
      content: drawingData,
      isPublic: true
    });
    if (error) {
      alert('Lỗi lưu bài: ' + error.message);
    } else {
      console.log('Đã lưu thành công! Mã chia sẻ:', data.short_id);
      alert('Đã lưu bài lên Cloud! Mã chia sẻ của bạn là: ' + data.short_id);
    }
  }

  // 3. Ví dụ: Mở bài vẽ từ Cloud bằng mã short_id
  async function loadFromCloud(shortId) {
    const { project, error } = await CurveLabSupabase.loadProject(shortId);
    if (error || !project) {
      alert('Không tìm thấy bài vẽ!');
    } else {
      console.log('Dữ liệu bài vẽ:', project.content);
      // Nạp dữ liệu vào CurveLab
    }
  }

  // 4. Ví dụ: Tải ảnh PNG lên Supabase Storage
  async function uploadImageToStorage(canvasElement, fileName) {
    canvasElement.toBlob(async (blob) => {
      const { publicUrl, error } = await CurveLabSupabase.uploadFile(blob, fileName, 'images');
      if (!error) {
        console.log('Ảnh đã được lưu tại:', publicUrl);
      }
    }, 'image/png');
  }
</script>
```

---

## 5. Kiểm tra tính toàn vẹn của mã nguồn

Bạn có thể chạy toàn bộ 12 bộ kiểm thử tự động của dự án để đảm bảo cấu hình mới không làm ảnh hưởng đến hoạt động hiện tại:

```bash
node development/test.cjs
```

Tất cả các kiểm tra hình học, toán học, tương tác canvas và xuất TikZ/LaTeX sẽ hiển thị:
```
PASS: all CurveLab checks.
```
