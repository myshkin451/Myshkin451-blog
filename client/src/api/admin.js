import client from './client';

export async function getAdminStats() {
  const response = await client.get('/admin/stats');
  return response.data;
}
