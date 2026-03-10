package com.example.shop.core.storage

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SearchHistoryStore @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) {
    val history: Flow<List<String>> = dataStore.data.map { prefs ->
        prefs[HISTORY_KEY]?.split(SEPARATOR)?.filter { it.isNotBlank() } ?: emptyList()
    }

    suspend fun add(keyword: String) {
        val trimmed = keyword.trim()
        if (trimmed.isEmpty()) return
        dataStore.edit { prefs ->
            val current = prefs[HISTORY_KEY]
                ?.split(SEPARATOR)
                ?.filter { it.isNotBlank() }
                ?.toMutableList()
                ?: mutableListOf()
            current.remove(trimmed)
            current.add(0, trimmed)
            val limited = current.take(MAX_HISTORY)
            prefs[HISTORY_KEY] = limited.joinToString(SEPARATOR)
        }
    }

    suspend fun remove(keyword: String) {
        dataStore.edit { prefs ->
            val current = prefs[HISTORY_KEY]
                ?.split(SEPARATOR)
                ?.filter { it.isNotBlank() && it != keyword }
                ?: return@edit
            prefs[HISTORY_KEY] = current.joinToString(SEPARATOR)
        }
    }

    suspend fun clear() {
        dataStore.edit { prefs ->
            prefs.remove(HISTORY_KEY)
        }
    }

    companion object {
        private val HISTORY_KEY = stringPreferencesKey("search_history")
        private const val SEPARATOR = "\u001F"
        private const val MAX_HISTORY = 10
    }
}
