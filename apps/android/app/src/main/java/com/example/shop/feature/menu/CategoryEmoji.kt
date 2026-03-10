package com.example.shop.feature.menu

/**
 * 分类 slug → Emoji 映射，与 H5 保持一致
 */
object CategoryEmoji {

    private val EMOJI_MAP = mapOf(
        // 一级分类
        "digital" to "📱",
        "computer" to "💻",
        "appliance" to "🔌",
        "clothing" to "👕",
        "food" to "🍎",
        "beauty" to "💄",
        "books" to "📚",
        "sports" to "⚽",
        "home" to "🏠",
        "baby" to "👶",

        // 二级 — 手机数码
        "phones" to "📱",
        "earphones" to "🎧",
        "smart-watches" to "⌚",

        // 二级 — 电脑办公
        "laptops" to "💻",
        "tablets" to "📱",
        "keyboards" to "⌨️",

        // 二级 — 家用电器
        "big-appliance" to "🧊",
        "small-appliance" to "🍳",
        "kitchen-appliance" to "🍲",

        // 二级 — 服饰鞋包
        "menswear" to "👔",
        "womenswear" to "👗",
        "shoes" to "👟",

        // 二级 — 食品生鲜
        "snacks" to "🍪",
        "drinks" to "🥤",
        "fresh" to "🥬",

        // 二级 — 美妆个护
        "skincare" to "🧴",
        "makeup" to "💄",
        "wash-care" to "🧴",

        // 二级 — 图书音像
        "literature" to "📖",
        "education" to "🎓",
        "comic" to "🎨",

        // 二级 — 运动户外
        "fitness" to "🏋️",
        "outdoor" to "⛺",
        "sportswear" to "👟",

        // 二级 — 家居家装
        "furniture" to "🛋️",
        "bedding" to "🛏️",
        "storage" to "📦",

        // 二级 — 母婴玩具
        "milk-powder" to "🍼",
        "diapers" to "🧒",
        "toys" to "🧸",
    )

    fun get(slug: String): String? = EMOJI_MAP[slug]
}
