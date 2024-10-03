// responseHelper.js
const sendResponse = (res, statusCode=400, success = false, message = false, data = false) => {
    res.status(statusCode).json({
        success,
        message,
        data,
    });
};

module.exports = sendResponse;
