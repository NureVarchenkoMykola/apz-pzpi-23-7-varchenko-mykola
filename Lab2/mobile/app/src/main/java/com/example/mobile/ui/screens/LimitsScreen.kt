package com.example.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.mobile.data.api.ApiClient
import com.example.mobile.data.model.CreateLimitRequest
import com.example.mobile.data.model.LimitDto
import com.example.mobile.data.model.LimitProgressDto
import com.example.mobile.data.model.UpdateLimitRequest
import com.example.mobile.ui.components.AppCard
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.utils.backendErrorText
import com.example.mobile.ui.utils.currentMonthEndIso
import com.example.mobile.ui.utils.currentMonthStartIso
import com.example.mobile.ui.utils.parsePositiveDouble
import com.example.mobile.ui.utils.validateIsoDateField
import com.example.mobile.ui.utils.validatePercent
import com.example.mobile.ui.utils.validatePositiveDouble
import kotlinx.coroutines.launch

@Composable
fun LimitsScreen(
    authHeader: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()

    var limits by remember { mutableStateOf<List<LimitDto>>(emptyList()) }
    var progresses by remember { mutableStateOf<Map<Int, LimitProgressDto>>(emptyMap()) }
    var editingId by remember { mutableStateOf<Int?>(null) }

    var limitKwh by remember { mutableStateOf("150") }
    var periodType by remember { mutableStateOf("month") }
    var periodMenuExpanded by remember { mutableStateOf(false) }
    var periodStart by remember { mutableStateOf(currentMonthStartIso()) }
    var periodEnd by remember { mutableStateOf(currentMonthEndIso()) }
    var alertsEnabled by remember { mutableStateOf(true) }
    var threshold by remember { mutableStateOf("80") }

    var limitKwhError by remember { mutableStateOf<String?>(null) }
    var periodStartError by remember { mutableStateOf<String?>(null) }
    var periodEndError by remember { mutableStateOf<String?>(null) }
    var thresholdError by remember { mutableStateOf<String?>(null) }

    fun resetForm() {
        editingId = null
        limitKwh = "150"
        periodType = "month"
        periodStart = currentMonthStartIso()
        periodEnd = currentMonthEndIso()
        alertsEnabled = true
        threshold = "80"
        limitKwhError = null
        periodStartError = null
        periodEndError = null
        thresholdError = null
    }

    fun loadLimits() {
        scope.launch {
            try {
                val response = ApiClient.apiService.getLimits(authHeader)

                if (response.isSuccessful) {
                    val loadedLimits = response.body().orEmpty()
                    limits = loadedLimits

                    val map = mutableMapOf<Int, LimitProgressDto>()

                    loadedLimits.forEach { limit ->
                        val progressResponse = ApiClient.apiService.getLimitProgress(
                            token = authHeader,
                            id = limit.id
                        )

                        if (progressResponse.isSuccessful && progressResponse.body() != null) {
                            map[limit.id] = progressResponse.body()!!
                        }
                    }

                    progresses = map
                } else {
                    val error = response.errorBody()?.string()
                    showMessage(backendErrorText(response.code(), error))
                }
            } catch (e: Exception) {
                showMessage("Помилка завантаження лімітів: ${e.message}")
            }
        }
    }

    LaunchedEffect(Unit) {
        loadLimits()
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            ScreenHeader(
                title = "Ліміти",
                subtitle = "Контролюйте пороги, перевищення та поточний стан",
                onBack = onBack
            )

            AppCard(
                title = if (editingId == null) "Новий ліміт" else "Редагування ліміту"
            ) {
                OutlinedTextField(
                    value = limitKwh,
                    onValueChange = {
                        limitKwh = it
                        limitKwhError = null
                    },
                    label = { Text("Ліміт, кВт·год") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = limitKwhError != null,
                    supportingText = { limitKwhError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Тип періоду")

                OutlinedButton(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { periodMenuExpanded = true }
                ) {
                    Text(periodType)
                }

                DropdownMenu(
                    expanded = periodMenuExpanded,
                    onDismissRequest = { periodMenuExpanded = false }
                ) {
                    listOf("week", "month", "year", "custom").forEach { type ->
                        DropdownMenuItem(
                            text = { Text(type) },
                            onClick = {
                                periodType = type
                                periodMenuExpanded = false
                            }
                        )
                    }
                }

                OutlinedTextField(
                    value = periodStart,
                    onValueChange = {
                        periodStart = it
                        periodStartError = null
                    },
                    label = { Text("Початок YYYY-MM-DD") },
                    isError = periodStartError != null,
                    supportingText = { periodStartError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                if (periodType == "custom") {
                    OutlinedTextField(
                        value = periodEnd,
                        onValueChange = {
                            periodEnd = it
                            periodEndError = null
                        },
                        label = { Text("Кінець YYYY-MM-DD") },
                        isError = periodEndError != null,
                        supportingText = { periodEndError?.let { Text(it) } },
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    Text("Для week/month/year кінець періоду розраховується автоматично.")
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = threshold,
                    onValueChange = {
                        threshold = it
                        thresholdError = null
                    },
                    label = { Text("Поріг попередження, %") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = thresholdError != null,
                    supportingText = { thresholdError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Сповіщення на головній")
                    Spacer(modifier = Modifier.weight(1f))
                    Switch(
                        checked = alertsEnabled,
                        onCheckedChange = { alertsEnabled = it }
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryActionButton(
                        text = if (editingId == null) "Додати" else "Зберегти",
                        modifier = Modifier.weight(1f),
                        onClick = {
                            limitKwhError = validatePositiveDouble(limitKwh, "Ліміт")
                            periodStartError = validateIsoDateField(periodStart, "Початок")
                            thresholdError = validatePercent(threshold)
                            periodEndError = null

                            if (periodType == "custom") {
                                periodEndError = validateIsoDateField(periodEnd, "Кінець")

                                if (
                                    periodStartError == null &&
                                    periodEndError == null &&
                                    periodStart > periodEnd
                                ) {
                                    periodEndError = "Кінець не може бути раніше початку"
                                }
                            }

                            if (
                                listOf(
                                    limitKwhError,
                                    periodStartError,
                                    periodEndError,
                                    thresholdError
                                ).any { it != null }
                            ) {
                                showMessage("Виправте помилки у формі ліміту")
                                return@PrimaryActionButton
                            }

                            scope.launch {
                                try {
                                    val id = editingId

                                    val response = if (id == null) {
                                        ApiClient.apiService.createLimit(
                                            token = authHeader,
                                            request = CreateLimitRequest(
                                                limit_kwh = parsePositiveDouble(limitKwh)!!,
                                                period_type = periodType,
                                                period_start = periodStart,
                                                period_end = if (periodType == "custom") periodEnd else null,
                                                alert_enabled = alertsEnabled,
                                                alert_threshold_percent = threshold.toInt()
                                            )
                                        )
                                    } else {
                                        ApiClient.apiService.updateLimit(
                                            token = authHeader,
                                            id = id,
                                            request = UpdateLimitRequest(
                                                limit_kwh = parsePositiveDouble(limitKwh)!!,
                                                period_type = periodType,
                                                period_start = periodStart,
                                                period_end = if (periodType == "custom") periodEnd else null,
                                                alert_enabled = alertsEnabled,
                                                alert_threshold_percent = threshold.toInt()
                                            )
                                        )
                                    }

                                    if (response.isSuccessful) {
                                        showMessage(
                                            if (id == null) {
                                                "Ліміт створено"
                                            } else {
                                                "Ліміт оновлено"
                                            }
                                        )
                                        resetForm()
                                        loadLimits()
                                    } else {
                                        val error = response.errorBody()?.string()
                                        showMessage(backendErrorText(response.code(), error))
                                    }
                                } catch (e: Exception) {
                                    showMessage("Помилка збереження ліміту: ${e.message}")
                                }
                            }
                        }
                    )

                    OutlinedButton(
                        modifier = Modifier.weight(1f),
                        onClick = { resetForm() }
                    ) {
                        Text("Очистити")
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "Стан лімітів") {
                if (limits.isEmpty()) {
                    Text("Даних немає")
                } else {
                    limits.forEachIndexed { index, limit ->
                        val progress = progresses[limit.id]

                        Text("${index + 1}. ${limit.period_type}: ${limit.period_start} - ${limit.period_end}")
                        Text("Ліміт: ${limit.limit_kwh} кВт·год")
                        Text("Поріг: ${limit.alert_threshold_percent}%")

                        if (progress == null) {
                            Text("Прогрес не завантажено")
                        } else {
                            Text("Використано: ${progress.used_kwh} / ${progress.limit_kwh} кВт·год")
                            Text("Відсоток: ${progress.percent_used ?: 0.0}%")

                            val percentUsed = progress.percent_used ?: 0.0
                            val thresholdPercent = limit.alert_threshold_percent

                            val statusText = when {
                                percentUsed >= 100.0 -> "ліміт перевищено"
                                percentUsed >= thresholdPercent -> "досягнуто поріг попередження"
                                else -> "у межах норми"
                            }

                            Text("Статус: $statusText")

                            if (!limit.alert_enabled && percentUsed >= thresholdPercent) {
                                Text("Сповіщення вимкнені.")
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    editingId = limit.id
                                    limitKwh = limit.limit_kwh
                                    periodType = limit.period_type
                                    periodStart = limit.period_start
                                    periodEnd = limit.period_end
                                    alertsEnabled = limit.alert_enabled
                                    threshold = limit.alert_threshold_percent.toString()
                                }
                            ) {
                                Text("Редаг.")
                            }

                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    scope.launch {
                                        try {
                                            val response = ApiClient.apiService.deleteLimit(
                                                token = authHeader,
                                                id = limit.id
                                            )

                                            if (response.isSuccessful) {
                                                showMessage("Ліміт видалено")
                                                loadLimits()
                                            } else {
                                                val error = response.errorBody()?.string()
                                                showMessage(backendErrorText(response.code(), error))
                                            }
                                        } catch (e: Exception) {
                                            showMessage("Помилка видалення ліміту: ${e.message}")
                                        }
                                    }
                                }
                            ) {
                                Text("Видал.")
                            }
                        }

                        if (index != limits.lastIndex) {
                            Divider(modifier = Modifier.padding(vertical = 10.dp))
                        }
                    }
                }
            }
        }
    }
}