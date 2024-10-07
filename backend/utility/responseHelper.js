const axios = require('axios');

const sendResponse = (res, statusCode = 400, success = false, message = false, data = false, errorMessage = false) => {
    res.status(statusCode).json({
        success,
        message,
        data,
        errorMessage
    });
};

const purifyText = (text) => {
    return text
      .replace(/@\[[^\]]*\]\(urn:[^\)]+\)/g, '') // Remove LinkedIn mentions
      .replace(/{hashtag\|\#\|([^\}]+)\}/g, '#$1') // Convert hashtags formatted as {hashtag|#|...} to #...
      .replace(/!!!/g, '') // Remove "!!!" from the text
      .replace(/“|”|‘|’/g, '') // Remove special quotes
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim(); // Trim leading and trailing whitespace
};

/**
 * A generalized API call function.
 * @param {string} method - The HTTP method ('GET', 'POST', 'PUT', 'DELETE').
 * @param {string} url - The API endpoint URL.
 * @param {object} headers - Headers to include in the request.
 * @param {object} [data] - The request payload for methods like POST or PUT (optional).
 * @param {object} res - The Express response object to handle API errors properly.
 * @returns {Promise<any>} - Returns the response data if successful, or sends an error response if it fails.
 */
const apiCall = async (method, url, headers, data = null, res) => {
    try {
        const config = {
            method: method,
            url: url,
            headers: headers,
            ...(data && { data }), // Include data only if it exists
        };

        // Make the API request
        const response = await axios(config);

        // Return the response data if the API call is successful
        return response.data;
    } catch (error) {
        // Enhanced error handling
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

        // Log the error details without excessive information
        console.error(`API call failed. Method: ${method}, URL: ${url}, Status: ${status}`, errorMessage);

        // Use sendResponse utility to send a formatted error response
        sendResponse(res, status, false, 'API call failed', null, errorMessage);

        throw new Error('API call failed'); // Optional: Rethrow the error if you want to handle it further up the chain
    }
};

module.exports = { sendResponse, purifyText, apiCall };

