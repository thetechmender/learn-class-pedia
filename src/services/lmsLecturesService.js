import { ENDPOINTS } from '../config/api';
import apiHelper from './apiHelper';

class LmsLecturesService {
  async searchLmsLectures(params = {}) {
    try {
      const { page = 1, pageSize = 50, search = '' } = params;
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (pageSize) queryParams.append('pageSize', pageSize);
      if (search) queryParams.append('search', search);
      
      const queryString = queryParams.toString();
      const endpoint = `${ENDPOINTS.LMS_LECTURES_SEARCH}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiHelper.get(endpoint);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching LMS lectures:', error);
      throw error;
    }
  }
}

export default new LmsLecturesService();
