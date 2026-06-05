package com.example.mobile.data.model

data class TariffDto(
    val id: Int,
    val user_id: Int,
    val price_per_kwh: String,
    val tariff_name: String,
    val valid_from: String,
    val valid_to: String?,
    val is_active: Boolean,
    val created_at: String?
)

data class CreateTariffRequest(
    val tariff_name: String,
    val price_per_kwh: Double,
    val valid_from: String,
    val valid_to: String? = null,
    val is_active: Boolean = true
)

data class UpdateTariffRequest(
    val tariff_name: String? = null,
    val price_per_kwh: Double? = null,
    val valid_from: String? = null,
    val valid_to: String? = null,
    val is_active: Boolean? = null
)