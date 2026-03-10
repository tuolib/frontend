package com.example.shop.core.util

import java.math.BigDecimal
import java.text.DecimalFormat

object PriceFormatter {
    private val formatter = DecimalFormat("#,##0.00")

    /** Format string price. "7999.00" → "7,999.00" */
    fun format(price: String): String {
        return try {
            formatter.format(BigDecimal(price))
        } catch (_: Exception) {
            price
        }
    }

    /** Format numeric price. 7999.0 → "7,999.00" */
    fun format(price: Double): String {
        return formatter.format(price)
    }

    /** With ¥ symbol. "7999.00" → "¥7,999.00" */
    fun formatWithSymbol(price: String): String = "¥${format(price)}"

    /** With ¥ symbol. 7999.0 → "¥7,999.00" */
    fun formatWithSymbol(price: Double): String = "¥${format(price)}"
}
