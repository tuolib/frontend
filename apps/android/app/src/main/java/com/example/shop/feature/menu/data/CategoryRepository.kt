package com.example.shop.feature.menu.data

import com.example.shop.core.network.unwrap
import com.example.shop.feature.menu.data.model.CategoryNode
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CategoryRepository @Inject constructor(
    private val api: CategoryApi,
) {
    suspend fun getTree(): List<CategoryNode> {
        return api.tree().unwrap()
    }
}
