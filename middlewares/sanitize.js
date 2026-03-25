const sanitizeHtml = require('sanitize-html');

/**
 * 清理 HTML 标签（用于纯文本字段：标题、用户名等）
 */
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, { allowedTags: [], allowedAttributes: {} }).trim();
}

/**
 * 清理富文本内容（保留安全的 HTML 标签，用于文章内容）
 */
function sanitizeContent(str) {
  if (typeof str !== 'string') return str;
  return sanitizeHtml(str, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'pre', 'code', 'span', 'del', 'ins', 'sup', 'sub',
      'details', 'summary', 'figure', 'figcaption',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      code: ['class'],
      span: ['class'],
      pre: ['class'],
      a: ['href', 'title', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

module.exports = { stripHtml, sanitizeContent };
