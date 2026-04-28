import axios from 'axios';

/**
 * ApiService Class - Handles all network communication with our backend.
 * OOP Concept: Singleton - We only need one instance of this class for the whole app.
 * OOP Concept: Encapsulation - We hide the complex Axios configuration inside this service.
 */
class ApiService {
  constructor() {
    // Determine the base URL for our API (student note: use env variables for flexibility!)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // Create the axios instance
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize our interceptors
    this.setupInterceptors();
  }

  /**
   * setupInterceptors - A private-style method to configure our request/response logic.
   */
  setupInterceptors() {
    // Request Interceptor: Attach JWT Token if available
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle global errors like 401 Unauthorized
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If we get a 401, it means our session is invalid.
          // We broadcast an event so the AuthContext can log us out.
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

  // Wrapper methods to make API calls easier (Polymorphism/Abstraction)
  get(url, config = {}) {
    return this.client.get(url, config);
  }

  post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

// Create and export a single instance (Singleton)
const apiService = new ApiService();
export default apiService;
