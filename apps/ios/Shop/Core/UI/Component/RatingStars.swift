import SwiftUI

struct RatingStars: View {
    let rating: Double
    let count: Int?
    var starSize: CGFloat = 14

    init(rating: String, count: Int? = nil, starSize: CGFloat = 14) {
        self.rating = Double(rating) ?? 0
        self.count = count
        self.starSize = starSize
    }

    init(rating: Double, count: Int? = nil, starSize: CGFloat = 14) {
        self.rating = rating
        self.count = count
        self.starSize = starSize
    }

    var body: some View {
        HStack(spacing: 2) {
            HStack(spacing: 1) {
                ForEach(1...5, id: \.self) { index in
                    starImage(for: index)
                        .font(.system(size: starSize))
                        .foregroundStyle(Color.shopStar)
                }
            }

            if let count {
                Text("(\(count))")
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopTeal)
            }
        }
    }

    private func starImage(for index: Int) -> Image {
        let threshold = Double(index)
        if rating >= threshold {
            return Image(systemName: "star.fill")
        } else if rating >= threshold - 0.5 {
            return Image(systemName: "star.leadinghalf.filled")
        } else {
            return Image(systemName: "star")
        }
    }
}

#Preview {
    VStack(spacing: 12) {
        RatingStars(rating: "4.5", count: 2000)
        RatingStars(rating: "3.0", count: 150)
        RatingStars(rating: "5.0")
        RatingStars(rating: "0.0")
    }
    .padding()
}
