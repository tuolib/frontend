import SwiftUI
import ComposableArchitecture

struct RegisterView: View {
    @Bindable var store: StoreOf<RegisterFeature>
    @Environment(\.dismiss) private var dismiss
    @FocusState private var focusedField: Field?

    enum Field: Hashable {
        case email, password, confirmPassword, nickname
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 8) {
                    Text("Create Account")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(Color.shopText)

                    Text("Join Shop and start shopping")
                        .font(ShopFonts.body)
                        .foregroundStyle(Color.shopTextSecondary)
                }
                .padding(.top, 24)
                .padding(.bottom, 28)

                // Form
                VStack(spacing: 20) {
                    // Nickname (optional)
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 4) {
                            Text("Nickname")
                                .font(ShopFonts.subheadline)
                                .fontWeight(.medium)
                                .foregroundStyle(Color.shopText)
                            Text("(optional)")
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopTextSecondary)
                        }

                        TextField("Enter your nickname", text: $store.nickname)
                            .textFieldStyle(.plain)
                            .textContentType(.nickname)
                            .focused($focusedField, equals: .nickname)
                            .padding(12)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                            .overlay(
                                RoundedRectangle(cornerRadius: ShopDimens.radiusSM)
                                    .stroke(Color.shopDivider, lineWidth: 1)
                            )
                    }

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

                        SecureField("At least 8 characters", text: $store.password)
                            .textFieldStyle(.plain)
                            .textContentType(.newPassword)
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

                    // Confirm Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Confirm Password")
                            .font(ShopFonts.subheadline)
                            .fontWeight(.medium)
                            .foregroundStyle(Color.shopText)

                        SecureField("Re-enter your password", text: $store.confirmPassword)
                            .textFieldStyle(.plain)
                            .textContentType(.newPassword)
                            .focused($focusedField, equals: .confirmPassword)
                            .padding(12)
                            .background(Color.white)
                            .clipShape(RoundedRectangle(cornerRadius: ShopDimens.radiusSM))
                            .overlay(
                                RoundedRectangle(cornerRadius: ShopDimens.radiusSM)
                                    .stroke(
                                        store.confirmPasswordError != nil ? Color.shopError : Color.shopDivider,
                                        lineWidth: 1
                                    )
                            )

                        if let error = store.confirmPasswordError {
                            Text(error)
                                .font(ShopFonts.caption)
                                .foregroundStyle(Color.shopError)
                        }
                    }

                    // Create Account Button
                    Button {
                        focusedField = nil
                        store.send(.registerTapped)
                    } label: {
                        HStack(spacing: 8) {
                            if store.isLoading {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Create Account")
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

                    // Terms
                    Text("By creating an account, you agree to Shop's Terms of Service and Privacy Policy.")
                        .font(ShopFonts.caption)
                        .foregroundStyle(Color.shopTextSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)
                }
                .padding(.horizontal, 24)

                // Sign In Link
                HStack(spacing: 4) {
                    Text("Already have an account?")
                        .font(ShopFonts.subheadline)
                        .foregroundStyle(Color.shopTextSecondary)
                    Button("Sign In") {
                        dismiss()
                    }
                    .font(ShopFonts.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(Color.shopTeal)
                }
                .padding(.top, 28)
                .padding(.bottom, 40)
            }
        }
        .background(Color.shopBackground)
        .navigationTitle("Create Account")
        .navigationBarTitleDisplayMode(.inline)
        .hideKeyboardOnTap()
        .onChange(of: store.registerSuccess) { _, success in
            if success {
                dismiss()
            }
        }
    }
}

#Preview {
    NavigationStack {
        RegisterView(
            store: Store(initialState: RegisterFeature.State()) {
                RegisterFeature()
            }
        )
    }
}
