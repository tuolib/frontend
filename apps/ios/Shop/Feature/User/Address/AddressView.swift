import SwiftUI
import ComposableArchitecture

struct AddressView: View {
    @Bindable var store: StoreOf<AddressFeature>

    var body: some View {
        Group {
            if store.isLoading && !store.hasLoaded {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if store.addresses.isEmpty {
                emptyState
            } else {
                addressList
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("My Addresses")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    store.send(.showForm(nil))
                } label: {
                    Image(systemName: "plus")
                        .foregroundStyle(Color.shopTeal)
                }
            }
        }
        .onAppear { store.send(.onAppear) }
        .sheet(isPresented: Binding(
            get: { store.showForm },
            set: { newValue in if !newValue { store.send(.dismissForm) } }
        )) {
            AddressFormView(
                address: store.editingAddress,
                onSave: { form in
                    store.send(.saveAddress(form))
                },
                onDismiss: {
                    store.send(.dismissForm)
                }
            )
        }
    }

    private var emptyState: some View {
        VStack(spacing: ShopDimens.spacingMD) {
            EmptyStateView(
                icon: "mappin.slash",
                title: "No addresses"
            )

            Button {
                store.send(.showForm(nil))
            } label: {
                Text("Add Address")
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color.shopTeal)
                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
            }
        }
    }

    private var addressList: some View {
        List {
            ForEach(store.addresses) { address in
                addressRow(address)
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) {
                            store.send(.deleteAddress(address.id))
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
                    .swipeActions(edge: .leading) {
                        Button {
                            store.send(.showForm(address))
                        } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                        .tint(.blue)
                    }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable { store.send(.refresh) }
    }

    private func addressRow(_ address: Address) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Text(address.recipient)
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(Color.shopText)
                Text(address.phone)
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopTextSecondary)

                if address.isDefault {
                    Text("Default")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(Color.shopTeal)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.shopTeal.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }

                if let label = address.label, !label.isEmpty {
                    Text(label)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(Color.shopAccent)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.shopAccent.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }
            }

            Text(address.fullAddress)
                .font(ShopFonts.caption)
                .foregroundStyle(Color.shopTextSecondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}
