package com.example.shop.feature.user.data

import com.example.shop.core.network.requireSuccess
import com.example.shop.core.network.unwrap
import com.example.shop.feature.user.data.model.Address
import com.example.shop.feature.user.data.model.AddressCreateRequest
import com.example.shop.feature.user.data.model.AddressDeleteRequest
import com.example.shop.feature.user.data.model.AddressUpdateRequest
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AddressRepository @Inject constructor(
    private val api: AddressApi,
) {
    suspend fun list(): List<Address> {
        return api.list().unwrap()
    }

    suspend fun create(request: AddressCreateRequest): Address {
        return api.create(request).unwrap()
    }

    suspend fun update(request: AddressUpdateRequest): Address {
        return api.update(request).unwrap()
    }

    suspend fun delete(id: String) {
        api.delete(AddressDeleteRequest(id)).requireSuccess()
    }
}
