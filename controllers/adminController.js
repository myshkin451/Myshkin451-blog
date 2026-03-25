const { catchAsync } = require('../utils/catchAsync');
const { success } = require('../utils/response');
const adminService = require('../services/adminService');

exports.getStats = catchAsync(async (req, res) => {
  const stats = await adminService.getStats();
  success(res, stats);
});
