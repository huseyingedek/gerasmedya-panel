const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("geras_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Hata: ${res.status}`);
  return data;
}

export const coursesApi = {
  getAll: () => request("/api/courses"),
};

export const articlesApi = {
  get: (course, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (course) params.set("course", course);
    return request(`/api/articles?${params}`);
  },
};

export const authApi = {
  login:    (email, password) => request("/api/auth/login",    { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  me:       () => request("/api/auth/me"),
};

export const progressApi = {
  get:          (strategy)                          => request(`/api/progress?strategy=${strategy}`),
  toggle:       (contentSlug, contentType, strategy) => request("/api/progress/toggle", { method: "POST", body: JSON.stringify({ contentSlug, contentType, strategy }) }),
  savePosition: (contentSlug, strategy, position, duration) => request("/api/progress/video-position", { method: "POST", body: JSON.stringify({ contentSlug, strategy, position, duration }) }),
};

// ─── Admin API ─────────────────────────────────────────────────────
export const adminApi = {
  // Videolar
  getVideos:     (course) => request(`/api/admin/videos${course ? `?course=${course}` : ""}`),
  createVideo:   (data)   => request("/api/admin/videos",     { method: "POST", body: JSON.stringify(data) }),
  updateVideo:   (id, data) => request(`/api/admin/videos/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  deleteVideo:   (id)     => request(`/api/admin/videos/${id}`,   { method: "DELETE" }),
  getUploadUrl:  (filename, contentType) => request(`/api/admin/upload-url?filename=${encodeURIComponent(filename)}${contentType ? `&contentType=${encodeURIComponent(contentType)}` : ""}`),

  // Yazılar
  getArticles: (course, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (course) params.set("course", course);
    return request(`/api/admin/articles?${params}`);
  },
  createArticle: (data)   => request("/api/admin/articles",     { method: "POST", body: JSON.stringify(data) }),
  updateArticle: (id, data) => request(`/api/admin/articles/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  deleteArticle: (id)     => request(`/api/admin/articles/${id}`,   { method: "DELETE" }),

  // Kaynaklar
  getResources:    (videoId, articleId) => request(`/api/admin/resources${videoId ? `?videoId=${videoId}` : articleId ? `?articleId=${articleId}` : ""}`),
  createResource:  (data)  => request("/api/admin/resources",     { method: "POST", body: JSON.stringify(data) }),
  updateResource:  (id, data) => request(`/api/admin/resources/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteResource:  (id)    => request(`/api/admin/resources/${id}`,   { method: "DELETE" }),

  // Kullanıcılar
  getUsers:      ()         => request("/api/admin/users"),
  updateUser:    (id, data) => request(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Kurslar
  getCourses:    ()         => request("/api/admin/courses"),
  createCourse:  (data)     => request("/api/admin/courses",     { method: "POST",   body: JSON.stringify(data) }),
  updateCourse:  (id, data) => request(`/api/admin/courses/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  deleteCourse:  (id)       => request(`/api/admin/courses/${id}`, { method: "DELETE" }),
};

export const engageApi = {
  // Notlar
  getNote:  (slug)          => request(`/api/engage/${slug}/note`),
  saveNote: (slug, content) => request(`/api/engage/${slug}/note`, { method: "POST", body: JSON.stringify({ content }) }),

  // Puanlama
  getRating:  (slug)   => request(`/api/engage/${slug}/rating`),
  saveRating: (slug, rating) => request(`/api/engage/${slug}/rating`, { method: "POST", body: JSON.stringify({ rating }) }),

  // Yorumlar
  getComments:   (slug)         => request(`/api/engage/${slug}/comments`),
  addComment:    (slug, content) => request(`/api/engage/${slug}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
  deleteComment: (slug, id)     => request(`/api/engage/${slug}/comments/${id}`, { method: "DELETE" }),
};

// R2'ye doğrudan presigned URL ile yükle (admin video upload)
export async function uploadToR2(file, onProgress) {
  // 1. Presigned URL al (dosyanın gerçek content type'ını gönder)
  const { url } = await adminApi.getUploadUrl(
    encodeURIComponent(file.name).replace(/%20/g, "-"),
    file.type || "video/mp4"
  );

  // 2. XHR ile yükle (progress takibi için)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload  = () => xhr.status < 300 ? resolve(file.name) : reject(new Error("Upload başarısız."));
    xhr.onerror = () => reject(new Error("Ağ hatası."));
    xhr.send(file);
  });
}

export default request;
