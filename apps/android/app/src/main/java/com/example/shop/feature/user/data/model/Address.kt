package com.example.shop.feature.user.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Address(
    val id: String,
    val userId: String = "",
    val label: String? = null,
    val recipient: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val address: String,
    val postalCode: String? = null,
    val isDefault: Boolean = false,
    val createdAt: String = "",
    val updatedAt: String = "",
)

@Serializable
data class AddressCreateRequest(
    val label: String? = null,
    val recipient: String,
    val phone: String,
    val province: String,
    val city: String,
    val district: String,
    val address: String,
    val postalCode: String? = null,
    val isDefault: Boolean = false,
)

@Serializable
data class AddressUpdateRequest(
    val id: String,
    val label: String? = null,
    val recipient: String? = null,
    val phone: String? = null,
    val province: String? = null,
    val city: String? = null,
    val district: String? = null,
    val address: String? = null,
    val postalCode: String? = null,
    val isDefault: Boolean? = null,
)

@Serializable
data class AddressDeleteRequest(val id: String)
