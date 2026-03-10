// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "Shop",
    platforms: [
        .iOS(.v17),
    ],
    dependencies: [
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0"),
        .package(url: "https://github.com/onevcat/Kingfisher", from: "8.1.0"),
    ],
    targets: [
        .executableTarget(
            name: "Shop",
            dependencies: [
                .product(name: "ComposableArchitecture", package: "swift-composable-architecture"),
                .product(name: "Kingfisher", package: "Kingfisher"),
            ],
            path: "Shop"
        ),
    ]
)
