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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.mobile.data.api.ApiClient
import com.example.mobile.data.model.ApplianceDto
import com.example.mobile.data.model.ConsumptionRecordDto
import com.example.mobile.data.model.CreateConsumptionRequest
import com.example.mobile.data.model.UpdateConsumptionRequest
import com.example.mobile.ui.components.AppCard
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.utils.backendErrorText
import com.example.mobile.ui.utils.parsePositiveDouble
import com.example.mobile.ui.utils.todayIso
import com.example.mobile.ui.utils.validateIsoDateField
import com.example.mobile.ui.utils.validatePositiveDouble
import kotlinx.coroutines.launch

@Composable
fun ConsumptionScreen(
    authHeader: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()

    var appliances by remember { mutableStateOf<List<ApplianceDto>>(emptyList()) }
    var records by remember { mutableStateOf<List<ConsumptionRecordDto>>(emptyList()) }
    var editingId by remember { mutableStateOf<Int?>(null) }

    var selectedApplianceId by remember { mutableStateOf<Int?>(null) }
    var applianceMenuExpanded by remember { mutableStateOf(false) }
    var mode by remember { mutableStateOf("manual") }
    var recordDate by remember { mutableStateOf(todayIso()) }
    var consumptionKwh by remember { mutableStateOf("3.5") }
    var usageHours by remember { mutableStateOf("2.0") }
    var notes by remember { mutableStateOf("") }

    var dateError by remember { mutableStateOf<String?>(null) }
    var kwhError by remember { mutableStateOf<String?>(null) }
    var hoursError by remember { mutableStateOf<String?>(null) }
    var applianceError by remember { mutableStateOf<String?>(null) }

    val selectedApplianceName = appliances.firstOrNull {
        it.id == selectedApplianceId
    }?.name ?: "Без приладу"

    fun resetForm() {
        editingId = null
        selectedApplianceId = null
        mode = "manual"
        recordDate = todayIso()
        consumptionKwh = "3.5"
        usageHours = "2.0"
        notes = ""
        dateError = null
        kwhError = null
        hoursError = null
        applianceError = null
    }

    fun loadData() {
        scope.launch {
            try {
                val appliancesResponse = ApiClient.apiService.getAppliances(authHeader)
                if (appliancesResponse.isSuccessful) {
                    appliances = appliancesResponse.body().orEmpty()
                }

                val recordsResponse = ApiClient.apiService.getConsumption(authHeader)
                if (recordsResponse.isSuccessful) {
                    records = recordsResponse.body().orEmpty()
                } else {
                    val error = recordsResponse.errorBody()?.string()
                    showMessage(backendErrorText(recordsResponse.code(), error))
                }
            } catch (e: Exception) {
                showMessage("Помилка завантаження споживання: ${e.message}")
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
                title = "Споживання",
                subtitle = "Додавайте записи вручну або розраховуйте за часом роботи",
                onBack = onBack
            )

            AppCard(
                title = if (editingId == null) "Новий запис" else "Редагування запису"
            ) {
                Text("Прилад")

                OutlinedButton(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { applianceMenuExpanded = true }
                ) {
                    Text(selectedApplianceName)
                }

                if (applianceError != null) {
                    Text(applianceError!!)
                }

                DropdownMenu(
                    expanded = applianceMenuExpanded,
                    onDismissRequest = { applianceMenuExpanded = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Без приладу") },
                        onClick = {
                            selectedApplianceId = null
                            applianceError = null
                            applianceMenuExpanded = false
                        }
                    )

                    appliances.forEach { appliance ->
                        DropdownMenuItem(
                            text = {
                                Text("${appliance.name} (${appliance.estimated_power ?: "-"} кВт)")
                            },
                            onClick = {
                                selectedApplianceId = appliance.id
                                applianceError = null
                                applianceMenuExpanded = false
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text("Спосіб розрахунку")

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = { mode = "manual" }) {
                        Text("Вручну")
                    }

                    Button(onClick = { mode = "hours" }) {
                        Text("За часом")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = recordDate,
                    onValueChange = {
                        recordDate = it
                        dateError = null
                    },
                    label = { Text("Дата YYYY-MM-DD") },
                    isError = dateError != null,
                    supportingText = { dateError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                if (mode == "manual") {
                    OutlinedTextField(
                        value = consumptionKwh,
                        onValueChange = {
                            consumptionKwh = it
                            kwhError = null
                        },
                        label = { Text("Споживання, кВт·год") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        isError = kwhError != null,
                        supportingText = { kwhError?.let { Text(it) } },
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    OutlinedTextField(
                        value = usageHours,
                        onValueChange = {
                            usageHours = it
                            hoursError = null
                        },
                        label = { Text("Час роботи, год") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        isError = hoursError != null,
                        supportingText = { hoursError?.let { Text(it) } },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text("Для розрахунку за часом треба вибрати прилад із заданою потужністю.")
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Нотатки") },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryActionButton(
                        text = if (editingId == null) "Додати" else "Зберегти",
                        modifier = Modifier.weight(1f),
                        onClick = {
                            dateError = validateIsoDateField(recordDate, "Дата")
                            kwhError = null
                            hoursError = null
                            applianceError = null

                            val isManualMode = mode == "manual"

                            if (isManualMode) {
                                kwhError = validatePositiveDouble(consumptionKwh, "Споживання")
                            } else {
                                hoursError = validatePositiveDouble(usageHours, "Час роботи")

                                if (selectedApplianceId == null) {
                                    applianceError = "Оберіть прилад"
                                }

                                val appliance = appliances.firstOrNull { it.id == selectedApplianceId }
                                if (appliance != null && appliance.estimated_power.isNullOrBlank()) {
                                    applianceError = "У приладу не задана потужність"
                                }
                            }

                            if (listOf(dateError, kwhError, hoursError, applianceError).any { it != null }) {
                                showMessage("Виправте помилки у формі споживання")
                                return@PrimaryActionButton
                            }

                            scope.launch {
                                try {
                                    val id = editingId

                                    val response = if (id == null) {
                                        ApiClient.apiService.createConsumption(
                                            token = authHeader,
                                            request = CreateConsumptionRequest(
                                                appliance_id = selectedApplianceId,
                                                consumption_kwh = if (isManualMode) {
                                                    parsePositiveDouble(consumptionKwh)
                                                } else {
                                                    null
                                                },
                                                usage_hours = if (!isManualMode) {
                                                    parsePositiveDouble(usageHours)
                                                } else {
                                                    null
                                                },
                                                record_date = recordDate,
                                                notes = notes.ifBlank { null }
                                            )
                                        )
                                    } else {
                                        ApiClient.apiService.updateConsumption(
                                            token = authHeader,
                                            id = id,
                                            request = UpdateConsumptionRequest(
                                                appliance_id = selectedApplianceId,
                                                consumption_kwh = if (isManualMode) {
                                                    parsePositiveDouble(consumptionKwh)
                                                } else {
                                                    null
                                                },
                                                usage_hours = if (!isManualMode) {
                                                    parsePositiveDouble(usageHours)
                                                } else {
                                                    null
                                                },
                                                record_date = recordDate,
                                                notes = notes.ifBlank { null }
                                            )
                                        )
                                    }

                                    if (response.isSuccessful) {
                                        showMessage(
                                            if (id == null) {
                                                "Запис створено"
                                            } else {
                                                "Запис оновлено"
                                            }
                                        )
                                        resetForm()
                                        loadData()
                                    } else {
                                        val error = response.errorBody()?.string()
                                        showMessage(backendErrorText(response.code(), error))
                                    }
                                } catch (e: Exception) {
                                    showMessage("Помилка збереження запису: ${e.message}")
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

            AppCard(title = "Історія споживання") {
                if (records.isEmpty()) {
                    Text("Даних немає")
                } else {
                    records.forEachIndexed { index, record ->
                        val applianceName = appliances.firstOrNull {
                            it.id == record.appliance_id
                        }?.name ?: "без приладу"

                        Text("${index + 1}. ${record.record_date}")
                        Text("${record.consumption_kwh} кВт·год, ${record.cost} грн")
                        Text("Прилад: $applianceName")
                        Text("Нотатки: ${record.notes ?: "-"}")

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    editingId = record.id
                                    selectedApplianceId = record.appliance_id
                                    mode = "manual"
                                    recordDate = record.record_date
                                    consumptionKwh = record.consumption_kwh
                                    notes = record.notes ?: ""
                                }
                            ) {
                                Text("Редаг.")
                            }

                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    scope.launch {
                                        try {
                                            val response = ApiClient.apiService.deleteConsumption(
                                                token = authHeader,
                                                id = record.id
                                            )

                                            if (response.isSuccessful) {
                                                showMessage("Запис видалено")
                                                loadData()
                                            } else {
                                                val error = response.errorBody()?.string()
                                                showMessage(backendErrorText(response.code(), error))
                                            }
                                        } catch (e: Exception) {
                                            showMessage("Помилка видалення запису: ${e.message}")
                                        }
                                    }
                                }
                            ) {
                                Text("Видал.")
                            }
                        }

                        if (index != records.lastIndex) {
                            Divider(modifier = Modifier.padding(vertical = 10.dp))
                        }
                    }
                }
            }
        }
    }
}