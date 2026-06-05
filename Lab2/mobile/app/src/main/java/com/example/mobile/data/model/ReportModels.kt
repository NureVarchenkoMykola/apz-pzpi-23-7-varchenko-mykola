package com.example.mobile.data.model

data class SummaryResponse(
    val period: ReportPeriodDto,
    val totals: ReportTotalsDto,
    val averages: ReportAveragesDto,
    val max_day: MaxDayDto?
)

data class ReportPeriodDto(
    val date_from: String,
    val date_to: String,
    val days: Int
)

data class ReportTotalsDto(
    val total_kwh: Double,
    val total_cost: Double,
    val records_count: Int
)

data class ReportAveragesDto(
    val kwh_per_day: Double,
    val cost_per_day: Double,
    val kwh_per_record: Double,
    val cost_per_record: Double
)

data class MaxDayDto(
    val date: String,
    val kwh: Double,
    val cost: Double
)

data class DailyReportDto(
    val record_date: String,
    val total_kwh: Double,
    val total_cost: Double,
    val records_count: Int
)

data class ReportByApplianceDto(
    val appliance_id: Int?,
    val appliance_name: String?,
    val total_kwh: Double,
    val total_cost: Double,
    val records_count: Int
)

data class LimitsReportResponse(
    val filters: LimitsReportFilters?,
    val totals: LimitsReportTotals,
    val items: List<LimitsReportItem>
)

data class LimitsReportFilters(
    val period_type: List<String>?,
    val ids: List<Int>?,
    val status: List<String>?,
    val period: ReportPeriodDto?
)

data class LimitsReportTotals(
    val limits_count: Int,
    val ok_count: Int,
    val threshold_reached_count: Int,
    val limit_exceeded_count: Int,
    val total_limit_kwh: Double,
    val total_used_kwh: Double
)

data class LimitsReportItem(
    val id: Int,
    val period_type: String,
    val period_start: String,
    val period_end: String,
    val limit_kwh: Double,
    val used_kwh: Double,
    val remaining_kwh: Double,
    val percent_used: Double,
    val alert_enabled: Boolean,
    val alert_threshold_percent: Int,
    val threshold_reached: Boolean,
    val limit_exceeded: Boolean,
    val status: String
)