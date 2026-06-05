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
import com.example.mobile.data.model.CreateTariffRequest
import com.example.mobile.data.model.TariffDto
import com.example.mobile.data.model.UpdateTariffRequest
import com.example.mobile.ui.components.AppCard
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.utils.backendErrorText
import com.example.mobile.ui.utils.parsePositiveDouble
import com.example.mobile.ui.utils.todayIso
import com.example.mobile.ui.utils.validateIsoDateField
import com.example.mobile.ui.utils.validatePositiveDouble
import com.example.mobile.ui.utils.validateRequired
import kotlinx.coroutines.launch

@Composable
fun TariffsScreen(
    authHeader: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()

    var tariffs by remember { mutableStateOf<List<TariffDto>>(emptyList()) }
    var editingId by remember { mutableStateOf<Int?>(null) }

    var tariffName by remember { mutableStateOf("Basic tariff") }
    var tariffPrice by remember { mutableStateOf("4.32") }
    var validFrom by remember { mutableStateOf(todayIso()) }
    var validTo by remember { mutableStateOf("") }
    var isActive by remember { mutableStateOf(true) }

    var tariffNameError by remember { mutableStateOf<String?>(null) }
    var tariffPriceError by remember { mutableStateOf<String?>(null) }
    var validFromError by remember { mutableStateOf<String?>(null) }
    var validToError by remember { mutableStateOf<String?>(null) }

    fun resetForm() {
        editingId = null
        tariffName = "Basic tariff"
        tariffPrice = "4.32"
        validFrom = todayIso()
        validTo = ""
        isActive = true
        tariffNameError = null
        tariffPriceError = null
        validFromError = null
        validToError = null
    }

    fun loadTariffs() {
        scope.launch {
            try {
                val response = ApiClient.apiService.getTariffs(authHeader)

                if (response.isSuccessful) {
                    tariffs = response.body().orEmpty()
                } else {
                    val error = response.errorBody()?.string()
                    showMessage(backendErrorText(response.code(), error))
                }
            } catch (e: Exception) {
                showMessage("Помилка завантаження тарифів: ${e.message}")
            }
        }
    }

    LaunchedEffect(Unit) {
        loadTariffs()
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
                title = "Тарифи",
                subtitle = "Керуйте тарифами та активною ціною для розрахунків",
                onBack = onBack
            )

            AppCard(
                title = if (editingId == null) "Новий тариф" else "Редагування тарифу"
            ) {
                OutlinedTextField(
                    value = tariffName,
                    onValueChange = {
                        tariffName = it
                        tariffNameError = null
                    },
                    label = { Text("Назва тарифу") },
                    isError = tariffNameError != null,
                    supportingText = { tariffNameError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = tariffPrice,
                    onValueChange = {
                        tariffPrice = it
                        tariffPriceError = null
                    },
                    label = { Text("Ціна за кВт·год") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = tariffPriceError != null,
                    supportingText = { tariffPriceError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = validFrom,
                    onValueChange = {
                        validFrom = it
                        validFromError = null
                    },
                    label = { Text("Діє з YYYY-MM-DD") },
                    isError = validFromError != null,
                    supportingText = { validFromError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = validTo,
                    onValueChange = {
                        validTo = it
                        validToError = null
                    },
                    label = { Text("Діє до YYYY-MM-DD, необов'язково") },
                    isError = validToError != null,
                    supportingText = { validToError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Зробити активним")
                    Spacer(modifier = Modifier.weight(1f))
                    Switch(
                        checked = isActive,
                        onCheckedChange = { isActive = it }
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryActionButton(
                        text = if (editingId == null) "Додати" else "Зберегти",
                        modifier = Modifier.weight(1f),
                        onClick = {
                            tariffNameError = validateRequired(tariffName, "Назва тарифу")
                            tariffPriceError = validatePositiveDouble(tariffPrice, "Ціна")
                            validFromError = validateIsoDateField(validFrom, "Дата початку")
                            validToError = if (validTo.isBlank()) {
                                null
                            } else {
                                validateIsoDateField(validTo, "Дата завершення")
                            }

                            if (
                                validFromError == null &&
                                validToError == null &&
                                validTo.isNotBlank() &&
                                validFrom > validTo
                            ) {
                                validToError = "Дата завершення не може бути раніше дати початку"
                            }

                            if (
                                listOf(
                                    tariffNameError,
                                    tariffPriceError,
                                    validFromError,
                                    validToError
                                ).any { it != null }
                            ) {
                                showMessage("Виправте помилки у формі тарифу")
                                return@PrimaryActionButton
                            }

                            scope.launch {
                                try {
                                    val id = editingId

                                    val response = if (id == null) {
                                        ApiClient.apiService.createTariff(
                                            token = authHeader,
                                            request = CreateTariffRequest(
                                                tariff_name = tariffName.trim(),
                                                price_per_kwh = parsePositiveDouble(tariffPrice)!!,
                                                valid_from = validFrom,
                                                valid_to = validTo.ifBlank { null },
                                                is_active = isActive
                                            )
                                        )
                                    } else {
                                        ApiClient.apiService.updateTariff(
                                            token = authHeader,
                                            id = id,
                                            request = UpdateTariffRequest(
                                                tariff_name = tariffName.trim(),
                                                price_per_kwh = parsePositiveDouble(tariffPrice)!!,
                                                valid_from = validFrom,
                                                valid_to = validTo.ifBlank { null },
                                                is_active = isActive
                                            )
                                        )
                                    }

                                    if (response.isSuccessful) {
                                        showMessage(
                                            if (id == null) {
                                                "Тариф створено"
                                            } else {
                                                "Тариф оновлено"
                                            }
                                        )
                                        resetForm()
                                        loadTariffs()
                                    } else {
                                        val error = response.errorBody()?.string()
                                        showMessage(backendErrorText(response.code(), error))
                                    }
                                } catch (e: Exception) {
                                    showMessage("Помилка збереження тарифу: ${e.message}")
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

            AppCard(title = "Список тарифів") {
                if (tariffs.isEmpty()) {
                    Text("Даних немає")
                } else {
                    tariffs.forEachIndexed { index, tariff ->
                        Text("${index + 1}. ${tariff.tariff_name}")
                        Text("Ціна: ${tariff.price_per_kwh} грн/кВт·год")
                        Text("Період: ${tariff.valid_from} - ${tariff.valid_to ?: "без кінця"}")
                        Text("Активний: ${if (tariff.is_active) "так" else "ні"}")

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    editingId = tariff.id
                                    tariffName = tariff.tariff_name
                                    tariffPrice = tariff.price_per_kwh
                                    validFrom = tariff.valid_from
                                    validTo = tariff.valid_to ?: ""
                                    isActive = tariff.is_active
                                }
                            ) {
                                Text("Редаг.")
                            }

                            Button(
                                modifier = Modifier.weight(1f),
                                enabled = !tariff.is_active,
                                onClick = {
                                    scope.launch {
                                        try {
                                            val response = ApiClient.apiService.activateTariff(
                                                token = authHeader,
                                                id = tariff.id
                                            )

                                            if (response.isSuccessful) {
                                                showMessage("Тариф активовано")
                                                loadTariffs()
                                            } else {
                                                val error = response.errorBody()?.string()
                                                showMessage(backendErrorText(response.code(), error))
                                            }
                                        } catch (e: Exception) {
                                            showMessage("Помилка активації тарифу: ${e.message}")
                                        }
                                    }
                                }
                            ) {
                                Text("Актив.")
                            }

                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    scope.launch {
                                        try {
                                            val response = ApiClient.apiService.deleteTariff(
                                                token = authHeader,
                                                id = tariff.id
                                            )

                                            if (response.isSuccessful) {
                                                showMessage("Тариф видалено")
                                                loadTariffs()
                                            } else {
                                                val error = response.errorBody()?.string()
                                                showMessage(backendErrorText(response.code(), error))
                                            }
                                        } catch (e: Exception) {
                                            showMessage("Помилка видалення тарифу: ${e.message}")
                                        }
                                    }
                                }
                            ) {
                                Text("Видал.")
                            }
                        }

                        if (index != tariffs.lastIndex) {
                            Divider(modifier = Modifier.padding(vertical = 10.dp))
                        }
                    }
                }
            }
        }
    }
}