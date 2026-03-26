import client from './client';

export async function getTags() {
  const response = await client.get('/tags');
  return response.data;
}

export async function getTagBySlug(slug) {
  const response = await client.get(`/tags/slug/${slug}`);
  return response.data;
}

export async function createTag(tagData) {
  const response = await client.post('/tags', tagData);
  return response.data;
}

export async function updateTag(id, tagData) {
  const response = await client.put(`/tags/${id}`, tagData);
  return response.data;
}

export async function deleteTag(id) {
  const response = await client.delete(`/tags/${id}`);
  return response.data;
}
