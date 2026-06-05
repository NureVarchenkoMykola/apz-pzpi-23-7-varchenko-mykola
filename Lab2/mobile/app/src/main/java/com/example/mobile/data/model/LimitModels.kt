package com.example.mobile.data.model

data class LimitDto(
    val id: Int,
    val user_id: Int,
    val limit_kwh: String,
    val period_type: String,
    val period_start: String,
    val period_end: String,
    val alert_enabled: Boolean,
    val alert_threshold_percent: Int,
    val created_at: String?
)

data class CreateLimitRequest(
    val limit_kwh: Double,
    val period_type: String,
    val period_start: String,
    val period_end: String? = null,
    val alert_enabled: Boolean = true,
    val alert_threshold_percent: Int = 80
)

data class UpdateLimitRequest(
    val limit_kwh: Double? = null,
    val period_type: String? = null,
    val period_start: String? = null,
    val period_end: String? = null,
    val alert_enabled: Boolean? = null,
    val alert_threshold_percent: Int? = null
)

data class LimitProgressDto(
    val limit_id: Int,
    val period_type: String,
    val period_start: String,
    val period_end: String,
    val limit_kwh: String,
    val used_kwh: String,
    val percent_used: Double?,
    val alert_enabled: Boolean,
    val alert_threshold_percent: Int,
    val threshold_reached: Boolean,
    val limit_exceeded: Boolean
)