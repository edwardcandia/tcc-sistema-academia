// frontend/src/hooks/useApi.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle API calls with authentication and loading state
 */
export const useApi = () => {
  const { authHeader, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute API request with authentication
   * @param {Function} apiCall - Function that returns a Promise (axios call)
   * @param {Object} options - Configuration options
   * @returns {Promise} - Result of the API call
   */
  const execute = useCallback(async (apiCall, options = {}) => {
    // Default options
    const {
      showLoader = true,
      handleError = true,
      errorMessage = 'Ocorreu um erro na operação',
      successMessage = null,
      onSuccess = null,
      onError = null,
      redirectOnUnauthorized = true
    } = options;

    try {
      // Show loader if requested
      if (showLoader) setLoading(true);
      
      // Reset error state
      setError(null);
      
      // Execute API call
      const response = await apiCall();
      
      // Process successful response
      if (successMessage && window.toast) {
        window.toast.success(successMessage);
      }
      
      // Execute success callback if provided
      if (onSuccess) onSuccess(response.data);
      
      return response.data;
    } catch (err) {
      // Handle error
      const errorResponse = err.response || {};
      const status = errorResponse.status;
      const responseData = errorResponse.data || {};
      
      // Create formatted error object
      const formattedError = {
        message: responseData.message || err.message || errorMessage,
        status,
        details: responseData.details || null,
        originalError: err
      };
      
      // Set error state
      setError(formattedError);
      
      // Handle unauthorized/forbidden errors (401/403)
      if ((status === 401 || status === 403) && redirectOnUnauthorized) {
        console.warn('Unauthorized access, logging out');
        logout();
        
        // Show message about session expiration
        if (window.toast) {
          window.toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        }
      }
      
      // General error toast
      else if (handleError && window.toast) {
        window.toast.error(formattedError.message);
      }
      
      // Execute error callback if provided
      if (onError) onError(formattedError);
      
      // Re-throw to allow handling at component level if needed
      throw formattedError;
    } finally {
      // Hide loader
      if (showLoader) setLoading(false);
    }
  }, [logout]);

  /**
   * Execute GET request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   */
  const get = useCallback((url, options = {}) => {
    return execute(() => axios.get(url, authHeader()), options);
  }, [execute, authHeader]);

  /**
   * Execute POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Request options
   */
  const post = useCallback((url, data, options = {}) => {
    return execute(() => axios.post(url, data, authHeader()), options);
  }, [execute, authHeader]);

  /**
   * Execute PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Data to send
   * @param {Object} options - Request options
   */
  const put = useCallback((url, data, options = {}) => {
    return execute(() => axios.put(url, data, authHeader()), options);
  }, [execute, authHeader]);

  /**
   * Execute DELETE request
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   */
  const del = useCallback((url, options = {}) => {
    return execute(() => axios.delete(url, authHeader()), options);
  }, [execute, authHeader]);

  return {
    get,
    post,
    put,
    delete: del,
    loading,
    error,
    execute
  };
};

export default useApi;