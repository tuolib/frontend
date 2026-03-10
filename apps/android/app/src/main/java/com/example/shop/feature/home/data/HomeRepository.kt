package com.example.shop.feature.home.data

import com.example.shop.core.network.unwrap
import com.example.shop.feature.home.data.model.Banner
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HomeRepository @Inject constructor(
    private val api: HomeApi,
) {
    suspend fun getBanners(): List<Banner> {
        return api.getBanners().unwrap()
    }
}
