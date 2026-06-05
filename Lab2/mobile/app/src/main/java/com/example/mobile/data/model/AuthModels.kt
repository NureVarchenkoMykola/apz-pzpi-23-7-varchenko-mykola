package com.example.mobile.data.model

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String
)

data class RegisterResponse(
    val id: Int,
    val email: String
)

data class MeResponse(
    val id: Int,
    val role: String
)