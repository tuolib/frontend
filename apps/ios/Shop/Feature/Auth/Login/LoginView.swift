import SwiftUI
import ComposableArchitecture

struct LoginView: View {
    @Bindable var store: StoreOf<LoginFeature>
    var onDismiss: (() -> Void)?
    @FocusState private var focusedField: Field?

    enum Field: Hashable {
        case email, password
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Logo
                VStack(spacing: 12) {
                    Image(systemName: "cart.fill")
                        .font(.system(size: 56))
                        .foregroundStyle(Color.shopAccent)

                    Text("Shop")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundStyle(Color.shopText)
                }
                .padding(.top, 40)
                .padding(.bottom, 32)

                // Form
                VStack(spacing: 20) {
                    // Email
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email")
                            .font(ShopFonts.subheadline)
                            .fontWeight(.medium)
                            .foregroundStyle(Color.shopText)

                        TextField("Enter your email", text: $store.email)
                            .textFieldStyle(.plain)
                            .keyboardType(.emailAddress)
                            .textContentType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .focused($focusedField, equals: .email)
                            .padding(12)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                            .overlay(
                                RoundedRectangle(cornerRadius: ShopDimens.radiusSM)
                                    .stroke(
                                        store.emailError != nil ? Color.shopError : Color.shopDivider,
                                        lineWidth: 1
                                    )
                            )

                        if let error = store.emailError {
                            Text(error)
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopError)
                        }
                    }

                    // Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password")
                            .font(ShopFonts.subheadline)
                            .fontWeight(.medium)
                            .foregroundStyle(Color.shopText)

                        SecureField("Enter your password", text: $store.password)
                            .textFieldStyle(.plain)
                            .textContentType(.password)
                            .focused($focusedField, equals: .password)
                            .padding(12)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                            .overlay(
                                RoundedRectangle(cornerRadius: ShopDimens.radiusSM)
                                    .stroke(
                                        store.passwordError != nil ? Color.shopError : Color.shopDivider,
                                        lineWidth: 1
                                    )
                            )

                        if let error = store.passwordError {
                            Text(error)
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopError)
                        }
                    }

                    // Sign In Button
                    Button {
                        focusedField = nil
                        store.send(.loginTapped)
                    } label: {
                        HStack(spacing: 8) {
                            if store.isLoading {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Sign In")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.shopAccent)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                    }
                    .disabled(store.isLoading)
                    .opacity(store.isLoading ? 0.7 : 1)
                    .padding(.top, 4)
                }
                .padding(.horizontal, 24)

                // Divider
                HStack {
                    Rectangle()
                        .fill(Color.shopDivider)
                        .frame(height: 1)
                    Text("New to Shop?")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                        .layoutPriority(1)
                    Rectangle()
                        .fill(Color.shopDivider)
                        .frame(height: 1)
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 28)

                // Create Account Button
                NavigationLink(value: AppRoute.register) {
                    Text("Create Account")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.white)
                        .foregroundStyle(Color.shopText)
                        .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusMD))
                        .overlay(
                            RoundedRectangle(cornerRadius: ShopDimens.radiusMD)
                                .stroke(Color.shopDivider, lineWidth: 1)
                        )
                }
                .padding(.horizontal, 24)
            }
        }
        .background(Color.shopBackground)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if onDismiss != nil {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onDismiss?()
                    }
                }
            }
        }
        .hideKeyboardOnTap()
        .onChange(of: store.loginSuccess) { _, success in
            if success {
                onDismiss?()
            }
        }
        .navigationDestination(for: AppRoute.self) { route in
            if case .register = route {
                RegisterView(
                    store: Store(initialState: RegisterFeature.State()) {
                        RegisterFeature()
                    }
                )
            }
        }
    }
}

#Preview {
    NavigationStack {
        LoginView(
            store: Store(initialState: LoginFeature.State()) {
                LoginFeature()
            },
            onDismiss: nil
        )
    }
}
