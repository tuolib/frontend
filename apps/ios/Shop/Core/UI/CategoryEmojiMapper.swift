import Foundation

enum CategoryEmojiMapper {
    static func emoji(for slug: String) -> String {
        switch slug.lowercased() {
        // Top-level
        case "digital":      return "📱"
        case "computer":     return "💻"
        case "appliance":    return "🔌"
        case "clothing":     return "👕"
        case "food":         return "🥕"
        case "beauty":       return "✨"
        case "books":        return "📚"
        case "sports":       return "🏃"
        case "home":         return "🏠"
        case "baby":         return "🧸"
        // Sub — digital
        case "phones":       return "📲"
        case "earphones":    return "🎧"
        case "smart-watches": return "⌚"
        // Sub — computer
        case "laptops":      return "💻"
        case "tablets":      return "📱"
        case "keyboards":    return "⌨️"
        // Sub — appliance
        case "big-appliance":    return "🧊"
        case "small-appliance":  return "🌀"
        case "kitchen-appliance": return "🍳"
        // Sub — clothing
        case "menswear":     return "👔"
        case "womenswear":   return "👗"
        case "shoes":        return "👟"
        // Sub — food
        case "snacks":       return "🍪"
        case "drinks":       return "🥤"
        case "fresh":        return "🥬"
        // Sub — beauty
        case "skincare":     return "💧"
        case "makeup":       return "💄"
        case "wash-care":    return "🧴"
        // Sub — books
        case "literature":   return "📖"
        case "education":    return "🎓"
        case "comic":        return "🎨"
        // Sub — sports
        case "fitness":      return "🏋️"
        case "outdoor":      return "⛺"
        case "sportswear":   return "🏅"
        // Sub — home
        case "furniture":    return "🛋️"
        case "bedding":      return "🛏️"
        case "storage":      return "📦"
        // Sub — baby
        case "milk-powder":  return "🍼"
        case "diapers":      return "👶"
        case "toys":         return "🎮"
        default:             return "🏷️"
        }
    }
}
