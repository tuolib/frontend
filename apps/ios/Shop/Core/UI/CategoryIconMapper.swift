import Foundation

enum CategoryIconMapper {
    /// Map category slug to a unique SF Symbol icon
    static func icon(for slug: String) -> String {
        switch slug.lowercased() {
        // Top-level categories
        case "digital":
            return "iphone"
        case "computer":
            return "desktopcomputer"
        case "appliance":
            return "powerplug.fill"
        case "clothing":
            return "tshirt.fill"
        case "food":
            return "carrot.fill"
        case "beauty":
            return "sparkles"
        case "books":
            return "book.fill"
        case "sports":
            return "figure.run"
        case "home":
            return "house.fill"
        case "baby":
            return "teddybear.fill"

        // Sub — digital
        case "phones":
            return "iphone.gen3"
        case "earphones":
            return "headphones"
        case "smart-watches":
            return "applewatch"

        // Sub — computer
        case "laptops":
            return "laptopcomputer"
        case "tablets":
            return "ipad"
        case "keyboards":
            return "keyboard.fill"

        // Sub — appliance
        case "big-appliance":
            return "refrigerator.fill"
        case "small-appliance":
            return "fan.fill"
        case "kitchen-appliance":
            return "oven.fill"

        // Sub — clothing
        case "menswear":
            return "figure.stand"
        case "womenswear":
            return "figure.stand.dress"
        case "shoes":
            return "shoe.fill"

        // Sub — food
        case "snacks":
            return "birthday.cake.fill"
        case "drinks":
            return "cup.and.saucer.fill"
        case "fresh":
            return "leaf.fill"

        // Sub — beauty
        case "skincare":
            return "drop.fill"
        case "makeup":
            return "paintbrush.fill"
        case "wash-care":
            return "bubbles.and.sparkles.fill"

        // Sub — books
        case "literature":
            return "text.book.closed.fill"
        case "education":
            return "graduationcap.fill"
        case "comic":
            return "paintpalette.fill"

        // Sub — sports
        case "fitness":
            return "dumbbell.fill"
        case "outdoor":
            return "tent.fill"
        case "sportswear":
            return "figure.walk"

        // Sub — home
        case "furniture":
            return "sofa.fill"
        case "bedding":
            return "bed.double.fill"
        case "storage":
            return "shippingbox.fill"

        // Sub — baby
        case "milk-powder":
            return "cross.vial.fill"
        case "diapers":
            return "heart.fill"
        case "toys":
            return "gamecontroller.fill"

        default:
            return "tag.fill"
        }
    }
}
