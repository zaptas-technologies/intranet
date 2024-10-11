const cron = require('node-cron');
const LinkedInUser = require('../model/linkedinUserSchema');
const config = require('../config/connect');




const refreshAccessToken = async (linkedinUser) => {
    try {
        // Redirect user to LinkedIn authorization URL to obtain new code
        const authorizationUrl = `${config.linkedin.LINKEDIN_AUTH_URL}?client_id=${config.linkedin.clientId}&redirect_uri=${config.linkedin.redirectUri}&response_type=code&scope=w_member_social`;
        
        // Optionally: Send a notification or log that the user needs to reauthorize
        console.log(`User ${linkedinUser.linkedinId} needs to reauthorize for a new access token.`);
        
        // Redirect the user to the LinkedIn authorization URL (this may need to be handled in your frontend)
        return authorizationUrl; // Adjust this to your application's flow
    } catch (error) {
        console.error('Failed to redirect for reauthorization:', error);
        throw error; // Handle this as needed
    }
};

const startTokenRefreshJob = () => {
    // Run the job every 20 days at midnight
    cron.schedule('0 0 */20 * *', async () => {
        try {
            const linkedinUsers = await LinkedInUser.find();

            for (const linkedinUser of linkedinUsers) {
                const currentTime = Date.now();
                const tokenExpiryTime = new Date(linkedinUser.tokenExpiry).getTime();

                // Check if the access token is about to expire
                if (currentTime >= tokenExpiryTime - 5 * 60 * 1000) {
                    // need to look into this
                    await refreshAccessToken(linkedinUser);
                }
            }
        } catch (error) {
            console.error('Error during scheduled token refresh:', error);
        }
    });
};

// Export the function to start the cron job
module.exports = { startTokenRefreshJob };