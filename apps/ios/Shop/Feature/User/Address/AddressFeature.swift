import Foundation
import ComposableArchitecture

@Reducer
struct AddressFeature {
    @ObservableState
    struct State: Equatable {
        var addresses: [Address] = []
        var isLoading = false
        var hasLoaded = false
        var showForm = false
        var editingAddress: Address?
    }

    enum Action {
        case onAppear
        case refresh
        case addressesLoaded(Result<[Address], Error>)
        case showForm(Address?)
        case dismissForm
        case saveAddress(AddressFormData)
        case addressSaved(Result<Address, Error>)
        case deleteAddress(String)
        case addressDeleted(String, Result<VoidResult, Error>)
    }

    @Dependency(\.addressClient) var addressClient

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                guard !state.hasLoaded else { return .none }
                state.isLoading = true
                return loadAddresses()

            case .refresh:
                state.isLoading = true
                return loadAddresses()

            case let .addressesLoaded(.success(addresses)):
                state.isLoading = false
                state.hasLoaded = true
                state.addresses = addresses
                return .none

            case .addressesLoaded(.failure):
                state.isLoading = false
                state.hasLoaded = true
                return .run { _ in
                    await ToastManager.shared.show("Failed to load addresses", type: .error)
                }

            case let .showForm(address):
                state.editingAddress = address
                state.showForm = true
                return .none

            case .dismissForm:
                state.showForm = false
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

            case .addressSaved(.success):
                state.showForm = false
                state.editingAddress = nil
                return .run { send in
                    await ToastManager.shared.show("Address saved", type: .success)
                    // Reload to get fresh data (default flags may have changed)
                    let result = await Result { try await addressClient.list() }
                    await send(.addressesLoaded(result))
                }

            case .addressSaved(.failure):
                return .run { _ in
                    await ToastManager.shared.show("Failed to save address", type: .error)
                }

            case let .deleteAddress(id):
                state.addresses.removeAll { $0.id == id }
                return .run { send in
                    let result = await Result {
                        try await addressClient.delete(id)
                        return VoidResult()
                    }
                    await send(.addressDeleted(id, result))
                }

            case .addressDeleted(_, .success):
                return .none

            case .addressDeleted(_, .failure):
                return .run { send in
                    await ToastManager.shared.show("Failed to delete address", type: .error)
                    let result = await Result { try await addressClient.list() }
                    await send(.addressesLoaded(result))
                }
            }
        }
    }

    private func loadAddresses() -> Effect<Action> {
        .run { send in
            let result = await Result { try await addressClient.list() }
            await send(.addressesLoaded(result))
        }
    }
}
