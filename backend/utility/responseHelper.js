// responseHelper.js
const sendResponse = (res, statusCode = 400, success = false, message = false, data = false, errorMessage = false) => {
    res.status(statusCode).json({
        success,
        message,
        data,
        errorMessage
    });
};

module.exports = sendResponse;
