package com.example.shop.core.util

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object DateFormatter {

    private val dateFormatter = DateTimeFormatter
        .ofPattern("yyyy-MM-dd")
        .withZone(ZoneId.systemDefault())

    private val dateTimeFormatter = DateTimeFormatter
        .ofPattern("yyyy-MM-dd HH:mm")
        .withZone(ZoneId.systemDefault())

    private val fullDateTimeFormatter = DateTimeFormatter
        .ofPattern("yyyy-MM-dd HH:mm:ss")
        .withZone(ZoneId.systemDefault())

    /** ISO 8601 → "2024-03-05" */
    fun formatDate(isoString: String?): String {
        if (isoString.isNullOrBlank()) return ""
        return try {
            val instant = Instant.parse(isoString)
            dateFormatter.format(instant)
        } catch (_: Exception) {
            isoString
        }
    }

    /** ISO 8601 → "2024-03-05 14:30" */
    fun formatDateTime(isoString: String?): String {
        if (isoString.isNullOrBlank()) return ""
        return try {
            val instant = Instant.parse(isoString)
            dateTimeFormatter.format(instant)
        } catch (_: Exception) {
            isoString
        }
    }

    /** ISO 8601 → "2024-03-05 14:30:00" */
    fun formatFullDateTime(isoString: String?): String {
        if (isoString.isNullOrBlank()) return ""
        return try {
            val instant = Instant.parse(isoString)
            fullDateTimeFormatter.format(instant)
        } catch (_: Exception) {
            isoString
        }
    }
}
