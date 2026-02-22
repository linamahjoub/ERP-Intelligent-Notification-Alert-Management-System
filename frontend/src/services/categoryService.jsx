const API_URL = process.env.REACT_APP_API_URL;

console.log('📍 API_URL configuré à:', API_URL);

export const categoryService = {
  // Récupérer toutes les catégories
  async getAllCategories() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ Aucun token trouvé dans localStorage');
        return [];
      }
      console.log('🔄 Fetching categories from:', `${API_URL}/categories/`);
      const response = await fetch(`${API_URL}/categories/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Raw data from API:', data);
      
      // L'API retourne un objet avec 'results' (pagination)
      const categoryList = data.results || (Array.isArray(data) ? data : []);
      console.log('✅ Categories processed:', categoryList);
      
      return categoryList;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  },

  // Créer une nouvelle catégorie
  async createCategory(categoryData) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/categories/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      throw error;
    }
  },

  // Mettre à jour une catégorie
  async updateCategory(id, categoryData) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/categories/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  },

  // Supprimer une catégorie
  async deleteCategory(id) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/categories/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return { ok: true };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  },
};
