// Environment configuration
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',

  // Derived URLs
  get apiUrl() {
    return `${this.apiBaseUrl}/api`;
  },

  get shortUrlBase() {
    return this.apiBaseUrl;
  },
};

export default config;
