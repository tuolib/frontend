import Foundation
import ComposableArchitecture

@Reducer
struct OrderCreateFeature {
    @ObservableState
    struct State: Equatable {
        var checkoutPreview: CheckoutPreview?
        var addresses: [Address] = []
        var selectedAddressId: String?
        var remark: String = ""
        var isLoading = false
        var isSubmitting = false
        var showAddressSheet = false
        var showAddressForm = false
        var editingAddress: Address?
        var createdOrderId: String?

        var selectedAddress: Address? {
            guard let selectedAddressId else { return nil }
            return addresses.first { $0.id == selectedAddressId }
        }
    }

    enum Action {
        case onAppear
        case previewLoaded(Result<CheckoutPreview, Error>)
        case addressesLoaded(Result<[Address], Error>)
        case selectAddress(String)
        case setRemark(String)
        case toggleAddressSheet
        case placeOrder
        case orderCreated(Result<CreateOrderResult, Error>)
        // Address form
        case showAddressForm(Address?)
        case dismissAddressForm
        case saveAddress(AddressFormData)
        case addressSaved(Result<Address, Error>)
        case deleteAddress(String)
        case addressDeleted(String, Result<VoidResult, Error>)
    }

    @Dependency(\.cartClient) var cartClient
    @Dependency(\.addressClient) var addressClient
    @Dependency(\.orderClient) var orderClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.isLoading = true
                return .merge(
                    .run { send in
                        let result = await Result { try await cartClient.checkoutPreview() }
                        await send(.previewLoaded(result))
                    },
                    .run { send in
                        let result = await Result { try await addressClient.list() }
                        await send(.addressesLoaded(result))
                    }
                )

            case let .previewLoaded(.success(preview)):
                state.checkoutPreview = preview
                state.isLoading = false
                return .none

            case .previewLoaded(.failure):
                state.isLoading = false
                return .run { _ in
                    await ToastManager.shared.show("Failed to load checkout info", type: .error)
                }

            case let .addressesLoaded(.success(addresses)):
                state.addresses = addresses
                if state.selectedAddressId == nil {
                    state.selectedAddressId = addresses.first(where: \.isDefault)?.id ?? addresses.first?.id
                }
                return .none

            case .addressesLoaded(.failure):
                return .run { _ in
                    await ToastManager.shared.show("Failed to load addresses", type: .error)
                }

            case let .selectAddress(id):
                state.selectedAddressId = id
                state.showAddressSheet = false
                return .none

            case let .setRemark(text):
                state.remark = text
                return .none

            case .toggleAddressSheet:
                state.showAddressSheet.toggle()
                return .none

            case .placeOrder:
                guard let preview = state.checkoutPreview,
                      state.selectedAddressId != nil else {
                    return .run { _ in
                        await ToastManager.shared.show("Please select an address", type: .error)
                    }
                }
                state.isSubmitting = true
                let items = preview.items.map {
                    OrderAPI.CreateRequest.CreateItem(skuId: $0.skuId, quantity: $0.quantity)
                }
                let addressId = state.selectedAddressId!
                let remark = state.remark.isEmpty ? nil : state.remark
                return .run { send in
                    let result = await Result {
                        try await orderClient.create(items, addressId, remark)
                    }
                    await send(.orderCreated(result))
                }

            case let .orderCreated(.success(result)):
                state.isSubmitting = false
                state.createdOrderId = result.orderId
                return .run { _ in
                    await ToastManager.shared.show("Order placed!", type: .success)
                }

            case .orderCreated(.failure):
                state.isSubmitting = false
                return .run { _ in
                    await ToastManager.shared.show("Failed to place order", type: .error)
                }

            case let .showAddressForm(address):
                state.editingAddress = address
                state.showAddressForm = true
                return .none

            case .dismissAddressForm:
                state.showAddressForm = false
                state.editingAddress = nil
                return .none

            case let .saveAddress(form):
                if let editing = state.editingAddress {
                    return .run { send in
                        let result = await Result {
                            try await addressClient.update(.init(
                                id: editing.id,
                                label: form.label,
                                recipient: form.recipient,
                                phone: form.phone,
                                province: form.province,
                                city: form.city,
                                district: form.district,
                                address: form.address,
                                postalCode: form.postalCode,
                                isDefault: form.isDefault
                            ))
                        }
                        await send(.addressSaved(result))
                    }
                } else {
                    return .run { send in
                        let result = await Result {
                            try await addressClient.create(.init(
                                label: form.label,
                                recipient: form.recipient,
                                phone: form.phone,
                                province: form.province,
                                city: form.city,
                                district: form.district,
                                address: form.address,
                                postalCode: form.postalCode,
                                isDefault: form.isDefault
                            ))
                        }
                        await send(.addressSaved(result))
                    }
                }

            case let .addressSaved(.success(address)):
                state.showAddressForm = false
                state.editingAddress = nil
                if let index = state.addresses.firstIndex(where: { $0.id == address.id }) {
                    state.addresses[index] = address
                } else {
                    state.addresses.append(address)
                }
                if state.selectedAddressId == nil {
                    state.selectedAddressId = address.id
                }
                return .run { send in
                    let result = await Result { try await addressClient.list() }
                    await send(.addressesLoaded(result))
                }

            case .addressSaved(.failure):
                return .run { _ in
                    await ToastManager.shared.show("Failed to save address", type: .error)
                }

            case let .deleteAddress(id):
                state.addresses.removeAll { $0.id == id }
                if state.selectedAddressId == id {
                    state.selectedAddressId = state.addresses.first?.id
                }
                return .run { send in
                    let result = await Result {
                        try await addressClient.delete(id)
                        return VoidResult()
                    }
                    await send(.addressDeleted(id, result))
                }

            case .addressDeleted(_, .success):
                return .none

            case let .addressDeleted(id, .failure):
                return .run { send in
                    await ToastManager.shared.show("Failed to delete address", type: .error)
                    let result = await Result { try await addressClient.list() }
                    await send(.addressesLoaded(result))
                }
            }
        }
    }
}

struct AddressFormData: Equatable, Sendable {
    var label: String?
    var recipient: String
    var phone: String
    var province: String
    var city: String
    var district: String
    var address: String
    var postalCode: String?
    var isDefault: Bool
}
