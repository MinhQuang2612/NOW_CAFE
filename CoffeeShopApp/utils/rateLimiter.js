const rateLimiters = {};

/**
 * Giới hạn số lần gọi API cho từng service phía client
 * @param {string} key - tên service (vd: 'user-service')
 * @param {number} limit - số lần tối đa
 * @param {number} windowMs - thời gian tính bằng ms
 * @returns {boolean} - true nếu được phép gọi, false nếu vượt quá
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  if (!rateLimiters[key]) {
    rateLimiters[key] = [];
  }
  // Xóa các lần gọi cũ ngoài window
  rateLimiters[key] = rateLimiters[key].filter(ts => now - ts < windowMs);
  if (rateLimiters[key].length >= limit) {
    return false; // Đã vượt quá số lần cho phép
  }
  rateLimiters[key].push(now);
  return true; // Được phép gọi
} 