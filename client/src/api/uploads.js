import client from './client';

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

export async function uploadPostImage(formData) {
  const response = await client.post('/uploads/image', formData, MULTIPART);
  return { url: response.data.url, path: response.data.path };
}

export async function uploadPostCover(postId, formData) {
  const response = await client.post(`/posts/${postId}/cover`, formData, MULTIPART);
  return response.data;
}

export async function uploadAvatar(formData) {
  const response = await client.post('/uploads/avatar', formData, MULTIPART);
  return response.data;
}
