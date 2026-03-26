/**
 * API 统一入口 — 聚合所有子模块，保持 `import api from '../api'` 兼容。
 * 新代码建议直接从子模块导入：import { getPosts } from '../api/posts'
 */
export { getPosts, getPostById, createPost, updatePost, deletePost, searchPosts } from './posts';
export { login, register, logout, checkAuth, getUserProfile, updateUserProfile, updatePassword, getUserPosts, getUserComments } from './auth';
export { getPostComments, createComment, updateComment, deleteComment, getRecentComments, getAllComments, updateCommentStatus } from './comments';
export { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from './categories';
export { getTags, getTagBySlug, createTag, updateTag, deleteTag } from './tags';
export { uploadPostImage, uploadPostCover, uploadAvatar } from './uploads';
export { getAdminStats } from './admin';

// 默认导出：对象形式兼容现有 `api.xxx()` 调用
import * as posts from './posts';
import * as auth from './auth';
import * as comments from './comments';
import * as categories from './categories';
import * as tags from './tags';
import * as uploads from './uploads';
import * as admin from './admin';

export default {
  ...posts,
  ...auth,
  ...comments,
  ...categories,
  ...tags,
  ...uploads,
  ...admin,
};
