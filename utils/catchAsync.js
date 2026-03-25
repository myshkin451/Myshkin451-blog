/**
 * 异步 controller 包装器
 * 捕获 async 函数抛出的错误并传递给 Express 全局错误中间件，
 * 消除 controller 中重复的 try/catch。
 *
 * 用法：
 *   const { catchAsync } = require('../utils/catchAsync');
 *   exports.getPost = catchAsync(async (req, res) => { ... });
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { catchAsync };
