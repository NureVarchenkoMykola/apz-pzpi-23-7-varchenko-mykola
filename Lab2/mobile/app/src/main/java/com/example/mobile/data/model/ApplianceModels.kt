package com.example.mobile.data.model

data class ApplianceDto(
    val id: Int,
    val user_id: Int,
    val name: String,
    val description: String?,
    val estimated_power: String?,
    val created_at: String?
)

data class CreateApplianceRequest(
    val name: String,
    val description: String? = null,
    val estimated_power: Double? = null
)

data class UpdateApplianceRequest(
    val name: String? = null,
    val description: String? = null,
    val estimated_power: Double? = null
)