package com.example.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedButton
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
import com.example.mobile.data.model.ApplianceDto
import com.example.mobile.data.model.ConsumptionRecordDto
import com.example.mobile.data.model.LimitDto
import com.example.mobile.data.model.LimitProgressDto
import com.example.mobile.data.model.SummaryResponse
import com.example.mobile.data.model.TariffDto
import com.example.mobile.ui.components.AppCard
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.components.SimpleList
import com.example.mobile.ui.components.StatGrid
import com.example.mobile.ui.utils.currentMonthEndIso
import com.example.mobile.ui.utils.currentMonthStartIso
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    authHeader: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onOpenTariffs: () -> Unit,
    onOpenAppliances: () -> Unit,
    onOpenConsumption: () -> Unit,
    onOpenLimits: () -> Unit,
    onOpenReports: () -> Unit,
    onLogout: () -> Unit
) {
    val scope = rememberCoroutineScope()

    var isLoading by remember { mutableStateOf(false) }
    var summary by remember { mutableStateOf<SummaryResponse?>(null) }
    var appliances by remember { mutableStateOf<List<ApplianceDto>>(emptyList()) }
    var tariffs by remember { mutableStateOf<List<TariffDto>>(emptyList()) }
    var records by remember { mutableStateOf<List<ConsumptionRecordDto>>(emptyList()) }
    var limits by remember { mutableStateOf<List<LimitDto>>(emptyList()) }
    var progresses by remember { mutableStateOf<List<LimitProgressDto>>(emptyList()) }

    fun loadData() {
        scope.launch {
            isLoading = true

            try {
                tariffs = ApiClient.apiService.getTariffs(authHeader).body().orEmpty()
                appliances = ApiClient.apiService.getAppliances(authHeader).body().orEmpty()
                records = ApiClient.apiService.getConsumption(authHeader).body().orEmpty()

                val loadedLimits = ApiClient.apiService.getLimits(authHeader).body().orEmpty()
                limits = loadedLimits

                val loadedProgresses = mutableListOf<LimitProgressDto>()

                loadedLimits.forEach { limit ->
                    val response = ApiClient.apiService.getLimitProgress(
                        token = authHeader,
                        id = limit.id
                    )

                    if (response.isSuccessful && response.body() != null) {
                        loadedProgresses.add(response.body()!!)
                    }
                }

                progresses = loadedProgresses

                val summaryResponse = ApiClient.apiService.getSummary(
                    token = authHeader,
                    dateFrom = currentMonthStartIso(),
                    dateTo = currentMonthEndIso()
                )

                if (summaryResponse.isSuccessful) {
                    summary = summaryResponse.body()
                }

                showMessage("Дані оновлено")
            } catch (e: Exception) {
                showMessage("Помилка завантаження: ${e.message}")
            } finally {
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadData()
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
                title = "Вітаємо!",
                subtitle = "Огляд енергоспоживання за поточний місяць",
                trailing = {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        PrimaryActionButton(
                            text = "Оновити",
                            onClick = { loadData() },
                            modifier = Modifier.weight(1f),
                            enabled = !isLoading
                        )

                        OutlinedButton(
                            modifier = Modifier.weight(1f),
                            onClick = onLogout
                        ) {
                            Text("Вийти")
                        }
                    }
                }
            )

            SummaryBlock(summary)

            Spacer(modifier = Modifier.height(16.dp))

            AlertsBlock(progresses)

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "Розділи") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryActionButton(
                        text = "Тарифи",
                        onClick = onOpenTariffs,
                        modifier = Modifier.weight(1f)
                    )

                    PrimaryActionButton(
                        text = "Прилади",
                        onClick = onOpenAppliances,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryActionButton(
                        text = "Споживання",
                        onClick = onOpenConsumption,
                        modifier = Modifier.weight(1f)
                    )

                    PrimaryActionButton(
                        text = "Ліміти",
                        onClick = onOpenLimits,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                PrimaryActionButton(
                    text = "Звіти",
                    onClick = onOpenReports
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            AppCard(title = "Статистика") {
                StatGrid(
                    items = listOf(
                        "Тарифи" to tariffs.size.toString(),
                        "Активні" to tariffs.count { it.is_active }.toString(),
                        "Прилади" to appliances.size.toString(),
                        "Записи" to records.size.toString(),
                        "Ліміти" to limits.size.toString()
                    )
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            SimpleList(
                title = "Останні записи",
                items = records.take(5).map {
                    "${it.record_date}: ${it.consumption_kwh} кВт·год, ${it.cost} грн"
                }
            )
        }
    }
}

@Composable
fun SummaryBlock(summary: SummaryResponse?) {
    AppCard(title = "Поточний місяць") {
        if (summary == null) {
            Text("Звіт ще не завантажено")
        } else {
            StatGrid(
                items = listOf(
                    "кВт·год" to summary.totals.total_kwh.toString(),
                    "Вартість" to "${summary.totals.total_cost} грн",
                    "Записи" to summary.totals.records_count.toString(),
                    "За день" to summary.averages.kwh_per_day.toString()
                )
            )
        }
    }
}

@Composable
fun AlertsBlock(progresses: List<LimitProgressDto>) {
    val warnings = progresses.filter {
        it.threshold_reached || it.limit_exceeded
    }

    AppCard(title = "Оповіщення") {
        if (progresses.isEmpty()) {
            Text("Ліміти ще не створені.")
        } else if (warnings.isEmpty()) {
            Text("Перевищень і попереджень немає.")
        } else {
            warnings.forEach { progress ->
                Text(
                    if (progress.limit_exceeded) {
                        "Ліміт перевищено"
                    } else {
                        "Досягнуто поріг ${progress.alert_threshold_percent}%"
                    }
                )

                Text("${progress.used_kwh} / ${progress.limit_kwh} кВт·год, ${progress.percent_used ?: 0.0}%")

                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}