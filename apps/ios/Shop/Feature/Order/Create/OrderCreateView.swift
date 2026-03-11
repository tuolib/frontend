import SwiftUI
import ComposableArchitecture
import Kingfisher

struct OrderCreateView: View {
    @Bindable var store: StoreOf<OrderCreateFeature>
    var onPayment: (String) -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if store.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let preview = store.checkoutPreview {
                orderContent(preview)
            } else {
                VStack(spacing: ShopDimens.spacingMD) {
                    EmptyStateView(
                        icon: "exclamationmark.triangle",
                        title: "Unable to load checkout"
                    )
                    Button("Retry") {
                        store.send(.onAppear)
                    }
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(Color.shopTeal)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("Confirm Order")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { store.send(.onAppear) }
        .sheet(isPresented: Binding(
            get: { store.showAddressSheet },
            set: { _ in store.send(.toggleAddressSheet) }
        )) {
            addressSelectionSheet
        }
        .sheet(isPresented: Binding(
            get: { store.showAddressForm },
            set: { newValue in if !newValue { store.send(.dismissAddressForm) } }
        )) {
            addressFormSheet
        }
        .onChange(of: store.createdOrderId) { _, orderId in
            if let orderId {
                onPayment(orderId)
            }
        }
    }

    // MARK: - Main Content

    private func orderContent(_ preview: CheckoutPreview) -> some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: ShopDimens.spacingMD) {
                    // Address Section
                    addressSection

                    // Items Section
                    itemsSection(preview.items)

                    // Remark
                    remarkSection

                    // Summary
                    summarySection(preview)
                }
                .padding(.vertical, ShopDimens.spacingMD)
            }

            // Bottom bar
            bottomBar(preview)
        }
    }

    // MARK: - Address Section

    private var addressSection: some View {
        Button { store.send(.toggleAddressSheet) } label: {
            HStack(spacing: ShopDimens.spacingMD) {
                Image(systemName: "mappin.circle.fill")
                    .font(.title2)
                    .foregroundStyle(Color.shopTeal)

                if let address = store.selectedAddress {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(address.recipient)
                                .font(ShopFonts.subheadlineSemibold)
                                .foregroundStyle(Color.shopText)
                            Text(address.phone)
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopTextSecondary)
                        }
                        Text(address.fullAddress)
                            .font(ShopFonts.caption)
                            .foregroundStyle(Color.shopTextSecondary)
                            .lineLimit(2)
                    }
                } else {
                    Text("Select delivery address")
                        .font(ShopFonts.subheadline)
                        .foregroundStyle(Color.shopTextSecondary)
                }

                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(Color.shopTextSecondary)
            }
            .padding(ShopDimens.spacingMD)
            .background(Color.shopCard)
            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
            .padding(.horizontal, ShopDimens.spacingMD)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Items

    private func itemsSection(_ items: [CheckoutItem]) -> some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            Text("Items (\(items.count))")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)
                .padding(.horizontal, ShopDimens.spacingMD)

            ForEach(items, id: \.skuId) { item in
                HStack(spacing: ShopDimens.spacingMD) {
                    KFImage(URL(string: item.imageUrl ?? ""))
                        .placeholder {
                            Color.shopBackground
                                .overlay {
                                    Image(systemName: "photo")
                                        .foregroundStyle(Color.shopDivider)
                                }
                        }
                        .resizable()
                        .scaledToFill()
                        .frame(width: 64, height: 64)
                        .clipped()
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))

                    VStack(alignment: .leading, spacing: 4) {
                        Text(item.productTitle)
                            .font(ShopFonts.subheadline)
                            .foregroundStyle(Color.shopText)
                            .lineLimit(2)

                        if let attrs = item.attributes, !attrs.isEmpty {
                            Text(attrs.map { "\($0.key): \($0.value)" }.joined(separator: ", "))
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopTextSecondary)
                        }

                        HStack {
                            PriceText(item.price, size: .small)
                            Spacer()
                            Text("x\(item.quantity)")
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopTextSecondary)
                        }
                    }
                }
                .padding(ShopDimens.spacingMD)
            }
        }
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Remark

    private var remarkSection: some View {
        VStack(alignment: .leading, spacing: ShopDimens.spacingSM) {
            Text("Remark")
                .font(ShopFonts.subheadlineSemibold)
                .foregroundStyle(Color.shopText)

            TextField("Leave a note (optional)", text: $store.remark.sending(\.setRemark))
                .font(ShopFonts.subheadline)
                .padding(ShopDimens.spacingSM)
                .background(Color.shopBackground)
                .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    // MARK: - Summary

    private func summarySection(_ preview: CheckoutPreview) -> some View {
        VStack(spacing: ShopDimens.spacingSM) {
            summaryRow("Subtotal (\(preview.totalQuantity) items)", value: preview.totalAmount)
            summaryRow("Shipping", valueText: "Free")
            Divider()
            HStack {
                Text("Total")
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(Color.shopText)
                Spacer()
                PriceText(preview.totalAmount, size: .normal)
            }
        }
        .padding(ShopDimens.spacingMD)
        .background(Color.shopCard)
        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
        .padding(.horizontal, ShopDimens.spacingMD)
    }

    private func summaryRow(_ label: String, value: Double) -> some View {
        HStack {
            Text(label)
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)
            Spacer()
            Text("¥\(String(format: "%.2f", value))")
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopText)
        }
    }

    private func summaryRow(_ label: String, valueText: String) -> some View {
        HStack {
            Text(label)
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.shopTextSecondary)
            Spacer()
            Text(valueText)
                .font(ShopFonts.subheadline)
                .foregroundStyle(Color.green)
        }
    }

    // MARK: - Bottom Bar

    private func bottomBar(_ preview: CheckoutPreview) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Total")
                    .font(ShopFonts.caption)
                    .foregroundStyle(Color.shopTextSecondary)
                PriceText(preview.totalAmount, size: .large)
            }

            Spacer()

            Button {
                store.send(.placeOrder)
            } label: {
                Text("Place Order")
                    .font(ShopFonts.subheadlineSemibold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(store.isSubmitting || store.selectedAddressId == nil
                                ? Color.shopTextSecondary : Color.shopAccent)
                    .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusFull))
            }
            .disabled(store.isSubmitting || store.selectedAddressId == nil)
        }
        .padding(.horizontal, ShopDimens.spacingMD)
        .padding(.vertical, ShopDimens.spacingSM)
        .background(Color.shopCard)
        .overlay(alignment: .top) {
            Divider()
        }
    }

    // MARK: - Address Selection Sheet

    private var addressSelectionSheet: some View {
        NavigationStack {
            List {
                ForEach(store.addresses) { address in
                    Button {
                        store.send(.selectAddress(address.id))
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
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
                                }
                                Text(address.fullAddress)
                                    .font(ShopFonts.caption)
                                    .foregroundStyle(Color.shopTextSecondary)
                                    .lineLimit(2)
                            }

                            Spacer()

                            if address.id == store.selectedAddressId {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Color.shopTeal)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) {
                            store.send(.deleteAddress(address.id))
                        } label: {
                            Label("Delete", systemImage: "trash")
                        }
                        Button {
                            store.send(.showAddressForm(address))
                        } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                        .tint(.blue)
                    }
                }

                Button {
                    store.send(.showAddressForm(nil))
                } label: {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(Color.shopTeal)
                        Text("Add New Address")
                            .foregroundStyle(Color.shopTeal)
                    }
                }
            }
            .navigationTitle("Select Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        store.send(.toggleAddressSheet)
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Address Form Sheet

    private var addressFormSheet: some View {
        AddressFormView(
            address: store.editingAddress,
            onSave: { form in
                store.send(.saveAddress(form))
            },
            onDismiss: {
                store.send(.dismissAddressForm)
            }
        )
    }
}

// MARK: - Address Form View

struct AddressFormView: View {
    let address: Address?
    let onSave: (AddressFormData) -> Void
    let onDismiss: () -> Void

    @State private var recipient: String = ""
    @State private var phone: String = ""
    @State private var province: String = ""
    @State private var city: String = ""
    @State private var district: String = ""
    @State private var addressText: String = ""
    @State private var label: String = ""
    @State private var postalCode: String = ""
    @State private var isDefault: Bool = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Contact") {
                    TextField("Recipient", text: $recipient)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }

                Section("Address") {
                    TextField("Province", text: $province)
                    TextField("City", text: $city)
                    TextField("District", text: $district)
                    TextField("Detailed Address", text: $addressText)
                }

                Section("Optional") {
                    TextField("Label (e.g. Home, Office)", text: $label)
                    TextField("Postal Code", text: $postalCode)
                        .keyboardType(.numberPad)
                    Toggle("Set as Default", isOn: $isDefault)
                        .tint(Color.shopTeal)
                }
            }
            .navigationTitle(address == nil ? "New Address" : "Edit Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { onDismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        onSave(AddressFormData(
                            label: label.isEmpty ? nil : label,
                            recipient: recipient,
                            phone: phone,
                            province: province,
                            city: city,
                            district: district,
                            address: addressText,
                            postalCode: postalCode.isEmpty ? nil : postalCode,
                            isDefault: isDefault
                        ))
                    }
                    .fontWeight(.semibold)
                    .disabled(recipient.isEmpty || phone.isEmpty || province.isEmpty ||
                              city.isEmpty || district.isEmpty || addressText.isEmpty)
                }
            }
            .onAppear {
                if let address {
                    recipient = address.recipient
                    phone = address.phone
                    province = address.province
                    city = address.city
                    district = address.district
                    addressText = address.address
                    label = address.label ?? ""
                    postalCode = address.postalCode ?? ""
                    isDefault = address.isDefault
                }
            }
        }
    }
}
