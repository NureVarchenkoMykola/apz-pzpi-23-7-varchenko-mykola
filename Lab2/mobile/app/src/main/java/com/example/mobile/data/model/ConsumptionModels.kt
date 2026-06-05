package com.example.mobile.data.model

data class ConsumptionRecordDto(
    val id: Int,
    val user_id: Int,
    val appliance_id: Int?,
    val consumption_kwh: String,
    val applied_price_per_kwh: String,
    val cost: String,
    val record_date: String,
    val notes: String?,
    val created_at: String?,
    val updated_at: String?
)

data class CreateConsumptionRequest(
    val appliance_id: Int? = null,
    val consumption_kwh: Double? = null,
    val usage_hours: Double? = null,
    val record_date: String,
    val notes: String? = null
)

data class UpdateConsumptionRequest(
    val appliance_id: Int? = null,
    val consumption_kwh: Double? = null,
    val usage_hours: Double? = null,
    val record_date: String? = null,
    val notes: String? = null
)