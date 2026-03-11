import SwiftUI
import Kingfisher

struct ImageCarousel: View {
    let images: [ProductImage]
    @State private var currentPage = 0

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            TabView(selection: $currentPage) {
                ForEach(Array(images.enumerated()), id: \.element.id) { index, image in
                    KFImage(URL(string: image.url))
                        .placeholder {
                            Color.shopBackground
                                .overlay {
                                    Image(systemName: "photo")
                                        .font(.system(size: 40))
                                        .foregroundStyle(Color.shopDivider)
                                }
                        }
                        .resizable()
                        .scaledToFill()
                        .clipped()
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            if images.count > 1 {
                Text("\(currentPage + 1) / \(images.count)")
                    .font(ShopFonts.caption)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.black.opacity(0.5))
                    .clipShape(Capsule())
                    .padding(ShopDimens.spacingMD)
            }
        }
        .aspectRatio(1, contentMode: .fit)
        .clipped()
        .background(Color.shopCard)
    }
}
