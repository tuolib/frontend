package com.example.shop.core.util

import java.text.DecimalFormat

object PriceFormatter {
    private val formatter = DecimalFormat("#,##0.00")

    /**
     * Format price from cents (分) to display string (元).
     * Example: 799900 → "7,999.00"
     */
    fun format(priceInCents: Long): String {
        return formatter.format(priceInCents / 100.0)
    }

    /**
     * Format price with currency symbol.
     * Example: 799900 → "¥7,999.00"
     */
    fun formatWithSymbol(priceInCents: Long): String {
        return "¥${format(priceInCents)}"
    }
}
