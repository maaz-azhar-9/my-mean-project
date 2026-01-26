// config.js
require('dotenv').config();

module.exports = {
    app2: {
        baseUrl: process.env.AI_POST_SUGGESTION_BASE_URL,
        timeout: 60000,
    }
};