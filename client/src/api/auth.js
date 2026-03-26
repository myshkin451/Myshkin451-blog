import client from './client';
import { useAuthStore } from '../stores/auth';

export async function login(credentials) {
  const response = await client.post('/users/login', credentials);
  if (response.data.user) {
    useAuthStore().setUser(response.data.user);
  }
  return response.data;
}

export async function register(userData) {
  const response = await client.post('/users/register', userData);
  if (response.data.user) {
    useAuthStore().setUser(response.data.user);
  }
  return response.data;
}

export async function logout() {
  try {
    await client.post('/users/logout');
  } catch {
    // 即使请求失败也清除本地状态
  }
  useAuthStore().clearUser();
}

export async function checkAuth() {
  const response = await client.get('/users/me');
  return response.data;
}

export async function getUserProfile() {
  const response = await client.get('/users/profile');
  return response.data;
}

export async function updateUserProfile(profileData) {
  const response = await client.put('/users/profile', profileData);
  return response.data;
}

export async function updatePassword(passwordData) {
  const response = await client.put('/users/password', passwordData);
  return response.data;
}

export async function getUserPosts() {
  const response = await client.get('/users/posts');
  return response.data;
}

export async function getUserComments() {
  const response = await client.get('/users/comments');
  return response.data;
}
