package com.example.shop.core.util

import android.util.Patterns

/** Validate email format */
fun String.isValidEmail(): Boolean =
    isNotBlank() && Patterns.EMAIL_ADDRESS.matcher(this).matches()

/** Validate password (at least 8 characters) */
fun String.isValidPassword(): Boolean = length >= 8
