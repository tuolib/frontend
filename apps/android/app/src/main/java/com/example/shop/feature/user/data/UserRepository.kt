package com.example.shop.feature.user.data

import com.example.shop.core.network.unwrap
import com.example.shop.feature.auth.data.model.User
import com.example.shop.feature.user.data.model.UserUpdateRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserRepository @Inject constructor(
    private val api: UserApi,
) {
    suspend fun profile(): User {
        return api.profile().unwrap()
    }

    suspend fun update(request: UserUpdateRequest): User {
        return api.update(request).unwrap()
    }
}
