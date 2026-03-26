import client from './client';

export async function getPostComments(postId) {
  const response = await client.get(`/posts/${postId}/comments`);
  return response.data;
}

export async function createComment(postId, commentData) {
  const response = await client.post(`/posts/${postId}/comments`, commentData);
  return response.data;
}

export async function updateComment(commentId, content) {
  const response = await client.put(`/comments/${commentId}`, { content });
  return response.data;
}

export async function deleteComment(commentId) {
  const response = await client.delete(`/comments/${commentId}`);
  return response.data;
}

export async function getRecentComments(limit = 5) {
  const response = await client.get('/comments/recent', { params: { limit } });
  return response.data;
}

export async function getAllComments(status = '') {
  const response = await client.get('/comments/all', { params: { status } });
  return response.data;
}

export async function updateCommentStatus(commentId, status) {
  const response = await client.patch(`/comments/${commentId}/moderate`, { status });
  return response.data;
}
