const slugify = require('slugify');

/**
 * 生成 URL 友好的 slug
 * 1. 用 slugify 处理标题
 * 2. 若结果为空（纯中文等），fallback 为 item-<timestamp>
 * 3. 纯数字加 item- 前缀
 * 4. 通过 existsFn 查重，重复则追加 -2、-3 ...
 *
 * @param {string} text - 原始文本（标题/名称）
 * @param {(slug: string) => Promise<boolean>} existsFn - 检查 slug 是否已存在
 * @returns {Promise<string>} 唯一 slug
 */
async function generateUniqueSlug(text, existsFn) {
  let base = slugify(text, { lower: true, strict: true, locale: 'zh' });

  if (!base || base.length === 0) {
    base = 'item-' + Date.now().toString(36);
  } else if (/^\d+$/.test(base)) {
    base = 'item-' + base;
  }

  let slug = base;
  let suffix = 2;

  while (await existsFn(slug)) {
    slug = `${base}-${suffix}`;
    suffix++;
  }

  return slug;
}

module.exports = { generateUniqueSlug };
