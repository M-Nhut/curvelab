/**
 * CurveLab - Supabase Client Integration Helper
 * 
 * Module giao tiếp độc lập giữa CurveLab với Supabase PostgreSQL và Supabase Storage.
 * Bạn có thể nhúng trực tiếp hoặc gọi các hàm này khi cần tính năng lưu trữ đám mây.
 * 
 * Thư viện phụ thuộc: @supabase/supabase-js (nạp qua CDN hoặc npm)
 * CDN khuyến nghị: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['@supabase/supabase-js'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('@supabase/supabase-js'));
  } else {
    root.CurveLabSupabase = factory(root.supabase);
  }
})(typeof self !== 'undefined' ? self : this, function (supabaseJs) {
  'use strict';

  let client = null;
  const BUCKET_NAME = 'curvelab-files';

  /**
   * Khởi tạo kết nối tới Supabase
   * @param {string} supabaseUrl - Địa chỉ Project URL (VD: https://xyzcompany.supabase.co)
   * @param {string} supabaseAnonKey - Public Anon API Key của project
   */
  function init(supabaseUrl, supabaseAnonKey) {
    if (!supabaseJs || !supabaseJs.createClient) {
      throw new Error(
        'Không tìm thấy thư viện @supabase/supabase-js. Vui lòng thêm script CDN: ' +
        '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
      );
    }
    client = supabaseJs.createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }

  function getClient() {
    if (!client) {
      throw new Error('Supabase client chưa được khởi tạo. Hãy gọi CurveLabSupabase.init(url, anonKey) trước.');
    }
    return client;
  }

  // ============================================================================
  // 1. SUPABASE POSTGRESQL (LƯU & ĐỌC DỮ LIỆU BÀI VẼ)
  // ============================================================================

  /**
   * Lưu hoặc chia sẻ một bài vẽ lên cơ sở dữ liệu PostgreSQL
   * @param {Object} options
   * @param {string} options.title - Tên bài vẽ (Ví dụ: "Tam giác Euler")
   * @param {string} [options.description] - Mô tả tóm tắt bài vẽ
   * @param {string} options.category - Phân loại ('curve', 'surface', 'plane_geometry', 'space_geometry', 'worksheet')
   * @param {Object} options.content - Đối tượng JSON bài vẽ của CurveLab
   * @param {string} [options.thumbnailUrl] - Link ảnh xem trước
   * @param {boolean} [options.isPublic=true] - Cho phép truy cập công khai qua link
   * @returns {Promise<{data: Object, error: Object}>}
   */
  async function saveProject({ title, description = '', category, content, thumbnailUrl = null, isPublic = true }) {
    const supabase = getClient();
    const payload = {
      title: title || 'Bài vẽ không tên',
      description,
      category: category || 'plane_geometry',
      content,
      thumbnail_url: thumbnailUrl,
      is_public: isPublic
    };

    const { data, error } = await supabase
      .from('curvelab_projects')
      .insert([payload])
      .select('id, short_id, title, category, created_at')
      .single();

    return { data, error };
  }

  /**
   * Tải dữ liệu bài vẽ từ PostgreSQL qua short_id hoặc UUID
   * @param {string} idOrShortId - Mã ngắn (8 ký tự) hoặc UUID của bài vẽ
   * @returns {Promise<{project: Object, error: Object}>}
   */
  async function loadProject(idOrShortId) {
    const supabase = getClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrShortId);

    const query = supabase.from('curvelab_projects').select('*');
    if (isUuid) {
      query.eq('id', idOrShortId);
    } else {
      query.eq('short_id', idOrShortId);
    }

    const { data, error } = await query.single();
    return { project: data, error };
  }

  /**
   * Lấy danh sách các bài vẽ công khai gần đây
   * @param {string} [category] - Lọc theo danh mục (tùy chọn)
   * @param {number} [limit=20] - Số lượng bài cần lấy
   */
  async function listPublicProjects(category = null, limit = 20) {
    const supabase = getClient();
    let query = supabase
      .from('curvelab_projects')
      .select('id, short_id, title, description, category, thumbnail_url, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    return { projects: data || [], error };
  }

  // ============================================================================
  // 2. SUPABASE STORAGE (LƯU TỆP FILE, ẢNH PNG, MÃ LATEX)
  // ============================================================================

  /**
   * Upload tệp xuất (PNG, TeX, JSON) lên bucket Storage
   * @param {Blob|File} fileBlob - Đối tượng Blob hoặc File cần tải lên
   * @param {string} filename - Tên file (ví dụ: 'tam-giac.png' hoặc 'hinh-hoc.tex')
   * @param {string} [folder='exports'] - Thư mục con trong bucket
   * @returns {Promise<{publicUrl: string, path: string, error: Object}>}
   */
  async function uploadFile(fileBlob, filename, folder = 'exports') {
    const supabase = getClient();
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${folder}/${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { publicUrl: null, path: null, error };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      publicUrl: urlData ? urlData.publicUrl : null,
      path: filePath,
      error: null
    };
  }

  /**
   * Lấy URL công khai của tệp đã lưu trong bucket
   * @param {string} filePath - Đường dẫn tệp trong bucket
   */
  function getFileUrl(filePath) {
    const supabase = getClient();
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data ? data.publicUrl : null;
  }

  return {
    init,
    getClient,
    saveProject,
    loadProject,
    listPublicProjects,
    uploadFile,
    getFileUrl,
    BUCKET_NAME
  };
});
