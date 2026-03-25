/**
 * 统一 API 响应格式
 *
 * 成功：{ success: true,  data, message }
 * 分页：{ success: true,  data, message, pagination: { total, totalPages, currentPage, pageSize } }
 * 错误：{ success: false, message, code }
 */

/**
 * 成功响应
 * @param {import('express').Response} res
 * @param {*} data - 响应数据
 * @param {string} [message='ok']
 * @param {number} [statusCode=200]
 */
const success = (res, data, message = 'ok', statusCode = 200) => {
  res.status(statusCode).json({ success: true, data, message });
};

/**
 * 带分页的成功响应
 * @param {import('express').Response} res
 * @param {*} data
 * @param {{ total: number, totalPages: number, currentPage: number, pageSize: number }} pagination
 * @param {string} [message='ok']
 */
const paginated = (res, data, pagination, message = 'ok') => {
  res.status(200).json({ success: true, data, message, pagination });
};

/**
 * 201 Created 响应
 */
const created = (res, data, message = '创建成功') => {
  success(res, data, message, 201);
};

module.exports = { success, paginated, created };
