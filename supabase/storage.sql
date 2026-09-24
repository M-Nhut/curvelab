-- ==============================================================================
-- CURVELAB - SUPABASE STORAGE CONFIGURATION
-- Cấu hình Storage Bucket để lưu trữ tệp xuất (ảnh PNG, mã LaTeX .tex, JSON bài vẽ)
-- ==============================================================================

-- 1. Tạo bucket 'curvelab-files' với quyền truy cập công khai (public: true)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'curvelab-files',
    'curvelab-files',
    true,
    10485760, -- Giới hạn 10MB cho mỗi tệp
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'application/json',
        'text/plain',
        'application/x-tex'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760;

-- 2. Thiết lập chính sách bảo mật RLS cho storage.objects

-- 2.1. Cho phép bất kỳ ai xem / tải tệp công khai từ bucket 'curvelab-files'
CREATE POLICY "Public Read Access curvelab-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'curvelab-files');

-- 2.2. Cho phép người dùng (kể cả anon) upload tệp vào bucket 'curvelab-files'
CREATE POLICY "Public Upload Access curvelab-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'curvelab-files');

-- 2.3. Cho phép cập nhật tệp nếu là người sở hữu
CREATE POLICY "Owner Update Access curvelab-files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'curvelab-files' AND (auth.uid() = owner OR auth.uid() IS NULL));

-- 2.4. Cho phép xóa tệp nếu là người sở hữu
CREATE POLICY "Owner Delete Access curvelab-files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'curvelab-files' AND (auth.uid() = owner OR auth.uid() IS NULL));
