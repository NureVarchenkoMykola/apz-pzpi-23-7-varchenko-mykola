package com.example.mobile.ui.utils

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

fun todayIso(): String {
    return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
}

fun currentMonthStartIso(): String {
    val calendar = Calendar.getInstance()
    calendar.set(Calendar.DAY_OF_MONTH, 1)
    return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.time)
}

fun currentMonthEndIso(): String {
    val calendar = Calendar.getInstance()
    calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH))
    return SimpleDateFormat("yyyy-MM-dd", Locale.US).format(calendar.time)
}

fun validateRequired(value: String, fieldName: String): String? {
    return if (value.trim().isEmpty()) {
        "$fieldName не може бути порожнім"
    } else {
        null
    }
}

fun validateEmail(value: String): String? {
    val trimmed = value.trim()

    return when {
        trimmed.isEmpty() -> "Email не може бути порожнім"
        !trimmed.contains("@") || !trimmed.contains(".") -> "Email має некоректний формат"
        else -> null
    }
}

fun validatePassword(value: String): String? {
    return when {
        value.isBlank() -> "Пароль не може бути порожнім"
        value.length < 6 -> "Пароль має містити не менше 6 символів"
        else -> null
    }
}

fun validatePositiveDouble(value: String, fieldName: String): String? {
    val number = value.trim().replace(',', '.').toDoubleOrNull()

    return when {
        value.trim().isEmpty() -> "$fieldName не може бути порожнім"
        number == null -> "$fieldName має бути числом"
        number <= 0 -> "$fieldName має бути більше 0"
        else -> null
    }
}

fun parsePositiveDouble(value: String): Double? {
    return value.trim().replace(',', '.').toDoubleOrNull()?.takeIf { it > 0 }
}

fun validateIsoDateField(value: String, fieldName: String): String? {
    val trimmed = value.trim()

    if (trimmed.isEmpty()) {
        return "$fieldName не може бути порожньою"
    }

    val regex = Regex("^\\d{4}-\\d{2}-\\d{2}$")
    if (!regex.matches(trimmed)) {
        return "$fieldName має бути у форматі YYYY-MM-DD"
    }

    return try {
        val format = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        format.isLenient = false
        format.parse(trimmed)
        null
    } catch (e: Exception) {
        "$fieldName містить некоректну дату"
    }
}

fun validatePercent(value: String): String? {
    val number = value.trim().toIntOrNull()

    return when {
        value.trim().isEmpty() -> "Поріг не може бути порожнім"
        number == null -> "Поріг має бути цілим числом"
        number !in 1..100 -> "Поріг має бути від 1 до 100"
        else -> null
    }
}

fun extractBackendMessage(raw: String?): String {
    if (raw.isNullOrBlank()) return ""

    val match = Regex("\"message\"\\s*:\\s*\"([^\"]+)\"").find(raw)
    return match?.groupValues?.getOrNull(1) ?: raw
}

fun backendErrorText(code: Int, rawError: String?): String {
    val backendMessage = extractBackendMessage(rawError)

    return when (code) {
        400 -> "Некоректні дані. $backendMessage"
        401 -> "Потрібно повторно увійти в систему."
        403 -> "Доступ заборонено. $backendMessage"
        404 -> "Дані не знайдено."
        409 -> "Конфлікт даних. $backendMessage"
        else -> "Помилка сервера: $code. $backendMessage"
    }.trim()
}