import { API_CONFIG, ENDPOINTS, HTTP_STATUS } from '../config/api';
import { isProduction } from '../config/appSettings';

class LmsLecturesService {
  getApiUrl() {
    return isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local;
  }

  async searchLmsLectures(params = {}) {
    try {
      const { page = 1, pageSize = 50, search = '' } = params;
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (pageSize) queryParams.append('pageSize', pageSize);
      if (search) queryParams.append('search', search);
      
      const queryString = queryParams.toString();
      const url = `${this.getApiUrl()}${ENDPOINTS.LMS_LECTURES_SEARCH}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching LMS lectures:', error);
      throw error;
    }
  }
}

export default new LmsLecturesService();
