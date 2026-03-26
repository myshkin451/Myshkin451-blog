import client from './client';

export async function getCategories() {
  const response = await client.get('/categories');
  return response.data;
}

export async function getCategoryBySlug(slug) {
  const response = await client.get(`/categories/slug/${slug}`);
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await client.post('/categories', categoryData);
  return response.data;
}

export async function updateCategory(id, categoryData) {
  const response = await client.put(`/categories/${id}`, categoryData);
  return response.data;
}

export async function deleteCategory(id) {
  const response = await client.delete(`/categories/${id}`);
  return response.data;
}
