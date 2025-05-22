/**
 * Gọi lại API tối đa 3 lần, delay 3-5s giữa các lần
 * @param {function} apiFunc - hàm trả về Promise (API call)
 * @param {number} maxRetries - số lần thử lại tối đa (default 3)
 * @param {number} minDelay - delay tối thiểu giữa các lần (ms, default 3000)
 * @param {number} maxDelay - delay tối đa giữa các lần (ms, default 5000)
 * @returns {Promise}
 */
export async function retryApiCall(apiFunc, maxRetries = 3, minDelay = 3000, maxDelay = 5000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiFunc();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      console.warn(`❗ [retryApiCall] Lỗi lần ${attempt}: ${err?.message || err}. Sẽ thử lại sau ${delay/1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}