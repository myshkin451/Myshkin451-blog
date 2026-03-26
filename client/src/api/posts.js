import client from './client';

export async function getPosts(params = {}) {
  const response = await client.get('/posts', { params });
  return response.data;
}

export async function getPostById(id) {
  const response = await client.get(`/posts/${id}`);
  return response.data;
}

export async function createPost(postData) {
  const response = await client.post('/posts', postData);
  return response.data;
}

export async function updatePost(id, postData) {
  const response = await client.put(`/posts/${id}`, postData);
  return response.data;
}

export async function deletePost(id) {
  const response = await client.delete(`/posts/${id}`);
  return response.data;
}

export async function searchPosts(params = {}) {
  const response = await client.get('/posts/search', { params });
  return response.data;
}
