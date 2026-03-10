package com.example.shop.core.ui.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.shop.core.ui.theme.PriceRed
import com.example.shop.core.ui.theme.Success
import com.example.shop.core.ui.theme.TextSecondary
import com.example.shop.core.util.PriceFormatter

@Composable
fun PriceText(
    price: String,
    modifier: Modifier = Modifier,
    comparePrice: String? = null,
    fontSize: TextUnit = 18.sp,
    showSymbol: Boolean = true,
) {
    val formatted = PriceFormatter.format(price)
    val parts = formatted.split(".")
    val integer = parts.getOrElse(0) { formatted }
    val decimal = parts.getOrElse(1) { "00" }

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        // ¥ symbol + integer part
        Text(
            text = if (showSymbol) "¥$integer" else integer,
            color = PriceRed,
            fontSize = fontSize,
            fontWeight = FontWeight.Bold,
            lineHeight = fontSize,
        )
        // Decimal part
        Text(
            text = ".$decimal",
            color = PriceRed,
            fontSize = fontSize * 0.7f,
            fontWeight = FontWeight.Bold,
            lineHeight = fontSize * 0.7f,
        )

        // Compare price (strikethrough)
        if (comparePrice != null) {
            val compareParsed = comparePrice.toDoubleOrNull()
            val priceParsed = price.toDoubleOrNull()
            if (compareParsed != null && priceParsed != null && compareParsed > priceParsed) {
                Text(
                    text = "¥${PriceFormatter.format(comparePrice)}",
                    color = TextSecondary,
                    fontSize = fontSize * 0.65f,
                    textDecoration = TextDecoration.LineThrough,
                )
                // Discount percentage
                val discount = ((1 - priceParsed / compareParsed) * 100).toInt()
                if (discount > 0) {
                    Text(
                        text = "-${discount}%",
                        color = Success,
                        fontSize = fontSize * 0.65f,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
        }
    }
}
