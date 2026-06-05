package com.example.mobile.data.api

import com.example.mobile.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @GET("api/auth/me")
    suspend fun getMe(
        @Header("Authorization") token: String
    ): Response<MeResponse>

    @GET("api/appliances")
    suspend fun getAppliances(
        @Header("Authorization") token: String
    ): Response<List<ApplianceDto>>

    @POST("api/appliances")
    suspend fun createAppliance(
        @Header("Authorization") token: String,
        @Body request: CreateApplianceRequest
    ): Response<ApplianceDto>

    @PATCH("api/appliances/{id}")
    suspend fun updateAppliance(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Body request: UpdateApplianceRequest
    ): Response<ApplianceDto>

    @DELETE("api/appliances/{id}")
    suspend fun deleteAppliance(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<Unit>

    @GET("api/tariffs")
    suspend fun getTariffs(
        @Header("Authorization") token: String
    ): Response<List<TariffDto>>

    @POST("api/tariffs")
    suspend fun createTariff(
        @Header("Authorization") token: String,
        @Body request: CreateTariffRequest
    ): Response<TariffDto>

    @PATCH("api/tariffs/{id}")
    suspend fun updateTariff(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Body request: UpdateTariffRequest
    ): Response<TariffDto>

    @POST("api/tariffs/{id}/activate")
    suspend fun activateTariff(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<TariffDto>

    @DELETE("api/tariffs/{id}")
    suspend fun deleteTariff(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<Unit>

    @GET("api/consumption")
    suspend fun getConsumption(
        @Header("Authorization") token: String,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null
    ): Response<List<ConsumptionRecordDto>>

    @POST("api/consumption")
    suspend fun createConsumption(
        @Header("Authorization") token: String,
        @Body request: CreateConsumptionRequest
    ): Response<ConsumptionRecordDto>

    @PATCH("api/consumption/{id}")
    suspend fun updateConsumption(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Body request: UpdateConsumptionRequest
    ): Response<ConsumptionRecordDto>

    @DELETE("api/consumption/{id}")
    suspend fun deleteConsumption(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<Unit>

    @GET("api/limits")
    suspend fun getLimits(
        @Header("Authorization") token: String,
        @Query("period_type") periodType: String? = null,
        @Query("date") date: String? = null
    ): Response<List<LimitDto>>

    @POST("api/limits")
    suspend fun createLimit(
        @Header("Authorization") token: String,
        @Body request: CreateLimitRequest
    ): Response<LimitDto>

    @PATCH("api/limits/{id}")
    suspend fun updateLimit(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Body request: UpdateLimitRequest
    ): Response<LimitDto>

    @DELETE("api/limits/{id}")
    suspend fun deleteLimit(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<Unit>

    @GET("api/limits/{id}/progress")
    suspend fun getLimitProgress(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<LimitProgressDto>

    @GET("api/reports/summary")
    suspend fun getSummary(
        @Header("Authorization") token: String,
        @Query("date_from") dateFrom: String,
        @Query("date_to") dateTo: String
    ): Response<SummaryResponse>

    @GET("api/reports/daily")
    suspend fun getDailyReport(
        @Header("Authorization") token: String,
        @Query("date_from") dateFrom: String,
        @Query("date_to") dateTo: String
    ): Response<List<DailyReportDto>>

    @GET("api/reports/by-appliance")
    suspend fun getByApplianceReport(
        @Header("Authorization") token: String,
        @Query("date_from") dateFrom: String,
        @Query("date_to") dateTo: String
    ): Response<List<ReportByApplianceDto>>

    @GET("api/reports/limits")
    suspend fun getLimitsReport(
        @Header("Authorization") token: String,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
        @Query("period_type") periodType: String? = null,
        @Query("status") status: String? = null
    ): Response<LimitsReportResponse>
}