package com.example.mobile.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Divider
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.mobile.data.api.ApiClient
import com.example.mobile.data.model.DailyReportDto
import com.example.mobile.data.model.LimitsReportResponse
import com.example.mobile.data.model.ReportByApplianceDto
import com.example.mobile.data.model.SummaryResponse
import com.example.mobile.ui.components.AppCard
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.utils.backendErrorText
import com.example.mobile.ui.utils.currentMonthEndIso
import com.example.mobile.ui.utils.currentMonthStartIso
import com.example.mobile.ui.utils.validateIsoDateField
import kotlinx.coroutines.launch

@Composable
fun ReportsScreen(
    authHeader: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()

    var dateFrom by remember { mutableStateOf(currentMonthStartIso()) }
    var dateTo by remember { mutableStateOf(currentMonthEndIso()) }

    var fromError by remember { mutableStateOf<String?>(null) }
    var toError by remember { mutableStateOf<String?>(null) }

    var summary by remember { mutableStateOf<SummaryResponse?>(null) }
    var daily by remember { mutableStateOf<List<DailyReportDto>>(emptyList()) }
    var byAppliance by remember { mutableStateOf<List<ReportByApplianceDto>>(emptyList()) }
    var limitsReport by remember { mutableStateOf<LimitsReportResponse?>(null) }

    fun loadReports() {
        fromError = validateIsoDateField(dateFrom, "Дата початку")
        toError = validateIsoDateField(dateTo, "Дата завершення")

        if (fromError == null && toError == null && dateFrom > dateTo) {
            toError = "Дата завершення не може бути раніше початку"
        }

        if (fromError != null || toError != null) {
            showMessage("Виправте період звіту")
            return
        }

        scope.launch {
            try {
                val summaryResponse = ApiClient.apiService.getSummary(
                    token = authHeader,
                    dateFrom = dateFrom,
                    dateTo = dateTo
                )

                if (summaryResponse.isSuccessful) {
                    summary = summaryResponse.body()
                } else {
                    val error = summaryResponse.errorBody()?.string()
                    showMessage(backendErrorText(summaryResponse.code(), error))
                }

                val dailyResponse = ApiClient.apiService.getDailyReport(
                    token = authHeader,
                    dateFrom = dateFrom,
                    dateTo = dateTo
                )

                if (dailyResponse.isSuccessful) {
                    daily = dailyResponse.body().orEmpty()
                }

                val applianceResponse = ApiClient.apiService.getByApplianceReport(
                    token = authHeader,
                    dateFrom = dateFrom,
                    dateTo = dateTo
                )

                if (applianceResponse.isSuccessful) {
                    byAppliance = applianceResponse.body().orEmpty()
                }

                val limitsResponse = ApiClient.apiService.getLimitsReport(
                    token = authHeader,
                    dateFrom = dateFrom,
                    dateTo = dateTo
                )

                if (limitsResponse.isSuccessful) {
                    limitsReport = limitsResponse.body()
                }

                showMessage("Звіти оновлено")
            } catch (e: Exception) {
                showMessage("Помилка завантаження звітів: ${e.message}")
            }
        }
    }

    LaunchedEffect(Unit) {
        loadReports()
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
                title = "Звіти",
                subtitle = "Аналітика за періодом, днями, приладами та лімітами",
                onBack = onBack
            )

            AppCard(title = "Період звіту") {
                OutlinedTextField(
                    value = dateFrom,
                    onValueChange = {
                        dateFrom = it
                        fromError = null
                    },
                    label = { Text("З YYYY-MM-DD") },
                    isError = fromError != null,
                    supportingText = { fromError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = dateTo,
                    onValueChange = {
                        dateTo = it
                        toError = null
                    },
                    label = { Text("До YYYY-MM-DD") },
                    isError = toError != null,
                    supportingText = { toError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                PrimaryActionButton(
                    text = "Сформувати звіти",
                    onClick = { loadReports() }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "Зведення") {
                if (summary == null) {
                    Text("Даних немає")
                } else {
                    Text("Період: ${summary!!.period.date_from} - ${summary!!.period.date_to}")
                    Text("Споживання: ${summary!!.totals.total_kwh} кВт·год")
                    Text("Вартість: ${summary!!.totals.total_cost} грн")
                    Text("Записів: ${summary!!.totals.records_count}")
                    Text("Середнє за день: ${summary!!.averages.kwh_per_day} кВт·год")

                    summary!!.max_day?.let {
                        Text("Максимальний день: ${it.date}, ${it.kwh} кВт·год")
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "Щоденний звіт") {
                if (daily.isEmpty()) {
                    Text("Даних немає")
                } else {
                    daily.forEachIndexed { index, item ->
                        Text("${index + 1}. ${item.record_date}")
                        Text("${item.total_kwh} кВт·год, ${item.total_cost} грн")
                        Text("Записів: ${item.records_count}")

                        if (index != daily.lastIndex) {
                            Divider(modifier = Modifier.padding(vertical = 8.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "За приладами") {
                if (byAppliance.isEmpty()) {
                    Text("Даних немає")
                } else {
                    byAppliance.forEachIndexed { index, item ->
                        Text("${index + 1}. ${item.appliance_name ?: "Без приладу"}")
                        Text("${item.total_kwh} кВт·год, ${item.total_cost} грн")
                        Text("Записів: ${item.records_count}")

                        if (index != byAppliance.lastIndex) {
                            Divider(modifier = Modifier.padding(vertical = 8.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "Звіт за лімітами") {
                val report = limitsReport

                if (report == null) {
                    Text("Даних немає")
                } else {
                    Text("Лімітів: ${report.totals.limits_count}")
                    Text("У нормі: ${report.totals.ok_count}")
                    Text("Досягнуто поріг: ${report.totals.threshold_reached_count}")
                    Text("Перевищено: ${report.totals.limit_exceeded_count}")
                    Text("Використано: ${report.totals.total_used_kwh} / ${report.totals.total_limit_kwh} кВт·год")

                    if (report.items.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))

                        report.items.forEachIndexed { index, item ->
                            Text("${index + 1}. ${item.period_type}: ${item.period_start} - ${item.period_end}")
                            Text("Статус: ${limitStatusText(item.status)}")
                            Text("${item.used_kwh} / ${item.limit_kwh} кВт·год")

                            if (index != report.items.lastIndex) {
                                Divider(modifier = Modifier.padding(vertical = 8.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

fun limitStatusText(status: String): String {
    return when (status) {
        "ok" -> "у межах норми"
        "threshold_reached" -> "досягнуто поріг попередження"
        "limit_exceeded" -> "ліміт перевищено"
        else -> status
    }
}