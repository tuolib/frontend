package com.example.shop.feature.auth.login

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.shop.core.ui.theme.BackgroundGray
import com.example.shop.core.ui.theme.DarkNavy
import com.example.shop.core.ui.theme.Orange
import com.example.shop.core.ui.theme.Teal
import com.example.shop.core.ui.theme.TextPrimary
import com.example.shop.core.ui.theme.TextSecondary

@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val focusManager = LocalFocusManager.current

    LaunchedEffect(Unit) {
        viewModel.event.collect { event ->
            when (event) {
                LoginEvent.LoginSuccess -> onLoginSuccess()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundGray)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Dark header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(96.dp)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(DarkNavy, Color(0xFF232F3E)),
                    ),
                ),
        )

        // Logo
        Spacer(Modifier.height(20.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Outlined.ShoppingBag,
                contentDescription = null,
                tint = Orange,
                modifier = Modifier.size(28.dp),
            )
            Spacer(Modifier.width(8.dp))
            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(color = TextPrimary, fontWeight = FontWeight.Bold)) {
                        append("Shop")
                    }
                    withStyle(SpanStyle(color = Orange, fontWeight = FontWeight.Bold)) {
                        append("Mall")
                    }
                },
                fontSize = 24.sp,
            )
        }

        Spacer(Modifier.height(20.dp))

        // Auth card
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .shadow(
                    elevation = 8.dp,
                    shape = RoundedCornerShape(12.dp),
                    ambientColor = Color.Black.copy(alpha = 0.08f),
                    spotColor = Color.Black.copy(alpha = 0.06f),
                ),
            shape = RoundedCornerShape(12.dp),
            color = Color.White,
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 24.dp),
            ) {
                Text(
                    text = "Sign in",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary,
                )

                Spacer(Modifier.height(20.dp))

                // Email field
                Text(
                    text = "Email",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextPrimary,
                )
                Spacer(Modifier.height(4.dp))
                OutlinedTextField(
                    value = state.email,
                    onValueChange = viewModel::updateEmail,
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("Enter your email", fontSize = 14.sp, color = TextSecondary) },
                    isError = state.emailError != null,
                    supportingText = state.emailError?.let { { Text(it) } },
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Teal,
                        unfocusedBorderColor = Color(0xFFD1D5DB),
                        cursorColor = Teal,
                    ),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next,
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) },
                    ),
                )

                Spacer(Modifier.height(12.dp))

                // Password field
                Text(
                    text = "Password",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextPrimary,
                )
                Spacer(Modifier.height(4.dp))
                OutlinedTextField(
                    value = state.password,
                    onValueChange = viewModel::updatePassword,
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    placeholder = { Text("Enter your password", fontSize = 14.sp, color = TextSecondary) },
                    isError = state.passwordError != null,
                    supportingText = state.passwordError?.let { { Text(it) } },
                    visualTransformation = PasswordVisualTransformation(),
                    shape = RoundedCornerShape(8.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Teal,
                        unfocusedBorderColor = Color(0xFFD1D5DB),
                        cursorColor = Teal,
                    ),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done,
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            focusManager.clearFocus()
                            viewModel.login()
                        },
                    ),
                )

                // Error message
                if (state.error != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = state.error!!,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 14.sp,
                    )
                }

                Spacer(Modifier.height(20.dp))

                // Gold submit button
                GoldButton(
                    text = "Sign in",
                    onClick = viewModel::login,
                    isLoading = state.isLoading,
                )

                Spacer(Modifier.height(16.dp))

                // Terms
                Text(
                    text = "By continuing, you agree to ShopMall's Terms of Use and Privacy Policy.",
                    fontSize = 11.sp,
                    color = Color(0xFF555555),
                    lineHeight = 16.sp,
                )
            }
        }

        Spacer(Modifier.height(20.dp))

        // Divider with text
        AuthDivider(text = "New to ShopMall?")

        Spacer(Modifier.height(20.dp))

        // Secondary button: Create account
        LightButton(
            text = "Create your ShopMall account",
            onClick = onNavigateToRegister,
            modifier = Modifier.padding(horizontal = 20.dp),
        )

        Spacer(Modifier.height(32.dp))

        // Footer
        Text(
            text = "\u00A9 2026 ShopMall",
            fontSize = 11.sp,
            color = Color(0xFF999999),
        )

        Spacer(Modifier.height(24.dp))
    }
}

// ── Shared auth UI components ──

@Composable
internal fun GoldButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true,
) {
    val isEnabled = enabled && !isLoading
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(44.dp)
            .background(
                brush = if (isEnabled) {
                    Brush.verticalGradient(listOf(Color(0xFFFFD814), Orange))
                } else {
                    Brush.verticalGradient(listOf(Color(0xFFF7E6A0), Color(0xFFF0CC62)))
                },
                shape = RoundedCornerShape(8.dp),
            )
            .border(
                width = 1.dp,
                color = if (isEnabled) Color(0xFFC89411) else Color(0xFFD4B55A),
                shape = RoundedCornerShape(8.dp),
            )
            .then(if (isEnabled) Modifier.clickable(onClick = onClick) else Modifier),
        contentAlignment = Alignment.Center,
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = TextPrimary,
            )
        } else {
            Text(
                text = text,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isEnabled) TextPrimary else TextPrimary.copy(alpha = 0.65f),
            )
        }
    }
}

@Composable
internal fun LightButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(40.dp)
            .background(
                brush = Brush.verticalGradient(listOf(Color.White, Color(0xFFF0F0F0))),
                shape = RoundedCornerShape(8.dp),
            )
            .border(
                width = 1.dp,
                color = Color(0xFFD5D9D9),
                shape = RoundedCornerShape(8.dp),
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            fontSize = 14.sp,
            color = TextPrimary,
        )
    }
}

@Composable
internal fun AuthDivider(
    text: String,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        HorizontalDivider(
            modifier = Modifier.weight(1f),
            color = Color(0xFFBBBBBB),
        )
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp),
            fontSize = 12.sp,
            color = Color(0xFF767676),
        )
        HorizontalDivider(
            modifier = Modifier.weight(1f),
            color = Color(0xFFBBBBBB),
        )
    }
}
