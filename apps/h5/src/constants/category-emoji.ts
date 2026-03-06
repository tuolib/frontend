/**
 * 分类 slug → Emoji 映射
 * 用于首页胶囊和分类菜单页，替代 lucide 线条图标
 */

const CATEGORY_EMOJI: Record<string, string> = {
  // 一级分类
  digital: '📱',
  computer: '💻',
  appliance: '🔌',
  clothing: '👕',
  food: '🍎',
  beauty: '💄',
  books: '📚',
  sports: '⚽',
  home: '🏠',
  baby: '👶',

  // 二级 — 手机数码
  phones: '📱',
  earphones: '🎧',
  'smart-watches': '⌚',

  // 二级 — 电脑办公
  laptops: '💻',
  tablets: '📱',
  keyboards: '⌨️',

  // 二级 — 家用电器
  'big-appliance': '🧊',
  'small-appliance': '🍳',
  'kitchen-appliance': '🍲',

  // 二级 — 服饰鞋包
  menswear: '👔',
  womenswear: '👗',
  shoes: '👟',

  // 二级 — 食品生鲜
  snacks: '🍪',
  drinks: '🥤',
  fresh: '🥬',

  // 二级 — 美妆个护
  skincare: '🧴',
  makeup: '💄',
  'wash-care': '🧴',

  // 二级 — 图书音像
  literature: '📖',
  education: '🎓',
  comic: '🎨',

  // 二级 — 运动户外
  fitness: '🏋️',
  outdoor: '⛺',
  sportswear: '👟',

  // 二级 — 家居家装
  furniture: '🛋️',
  bedding: '🛏️',
  storage: '📦',

  // 二级 — 母婴玩具
  'milk-powder': '🍼',
  diapers: '🧒',
  toys: '🧸',
};

/**
 * 根据分类 slug 获取对应 emoji
 */
export function getCategoryEmoji(slug: string, _iconUrl?: string | null): string {
  return CATEGORY_EMOJI[slug] ?? '';
}
