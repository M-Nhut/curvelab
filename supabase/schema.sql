-- ==============================================================================
-- CURVELAB - SUPABASE POSTGRESQL SCHEMA
-- Cơ sở dữ liệu lưu trữ bài vẽ, mô hình hình học, công thức và chia sẻ link
-- ==============================================================================

-- 1. Bật extension tạo UUID và hàm tiện ích nếu chưa có
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tạo hàm tự động cập nhật timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Tạo bảng lưu trữ các bài vẽ / bài làm của CurveLab
CREATE TABLE IF NOT EXISTS public.curvelab_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id VARCHAR(12) UNIQUE NOT NULL DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
    title TEXT NOT NULL DEFAULT 'Bài vẽ mới',
    description TEXT DEFAULT '',
    category VARCHAR(32) NOT NULL DEFAULT 'plane_geometry', 
    -- Các phân loại không gian của CurveLab:
    -- 'curve'          : Đường cong 2D/3D (index.html)
    -- 'surface'        : Mặt cong 3D (studio.html#surface)
    -- 'plane_geometry' : Bàn dựng hình phẳng 2D (construction.html)
    -- 'space_geometry' : Bàn dựng hình không gian 3D (construction.html#space)
    -- 'worksheet'      : Sổ khảo sát nhiều hàm (studio.html#worksheet)
    content JSONB NOT NULL,
    -- JSON chứa toàn bộ dữ liệu bài vẽ (tọa độ điểm, đường, phương trình, camera, màu sắc...)
    thumbnail_url TEXT,
    -- Đường dẫn ảnh đại diện bài vẽ nếu lưu trên Supabase Storage
    is_public BOOLEAN NOT NULL DEFAULT true,
    -- Cho phép bất kỳ ai có link đều mở và xem được
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- ID tài khoản người tạo (nếu dùng Supabase Auth, hoặc NULL cho khách)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tạo chỉ mục (Indexes) để truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_curvelab_projects_short_id ON public.curvelab_projects(short_id);
CREATE INDEX IF NOT EXISTS idx_curvelab_projects_category ON public.curvelab_projects(category);
CREATE INDEX IF NOT EXISTS idx_curvelab_projects_created_at ON public.curvelab_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_curvelab_projects_content_gin ON public.curvelab_projects USING GIN (content);

-- 5. Gắn trigger tự động cập nhật updated_at
DROP TRIGGER IF EXISTS trg_curvelab_projects_updated_at ON public.curvelab_projects;
CREATE TRIGGER trg_curvelab_projects_updated_at
BEFORE UPDATE ON public.curvelab_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Thiết lập Row Level Security (RLS) để bảo vệ dữ liệu
ALTER TABLE public.curvelab_projects ENABLE ROW LEVEL SECURITY;

-- 6.1. Cho phép mọi người (kể cả khách / anon) đọc bài vẽ công khai hoặc mở qua short_id
CREATE POLICY "Cho phép đọc bài vẽ công khai"
ON public.curvelab_projects
FOR SELECT
USING (is_public = true);

-- 6.2. Cho phép người dùng (kể cả khách anon) tạo bài vẽ mới
CREATE POLICY "Cho phép tạo bài vẽ mới"
ON public.curvelab_projects
FOR INSERT
WITH CHECK (true);

-- 6.3. Cho phép chủ sở hữu cập nhật bài vẽ của mình (hoặc dựa trên user_id nếu có auth)
CREATE POLICY "Cho phép người tạo sửa bài vẽ"
ON public.curvelab_projects
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 6.4. Cho phép chủ sở hữu xóa bài vẽ của mình
CREATE POLICY "Cho phép người tạo xóa bài vẽ"
ON public.curvelab_projects
FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Ghi chú kiểm tra hoàn tất
COMMENT ON TABLE public.curvelab_projects IS 'Bảng lưu trữ dự án và bản vẽ CurveLab trên Supabase PostgreSQL';
