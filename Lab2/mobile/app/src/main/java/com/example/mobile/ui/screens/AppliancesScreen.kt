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
import com.example.mobile.data.model.CreateApplianceRequest
import com.example.mobile.data.model.UpdateApplianceRequest
import com.example.mobile.ui.components.AppCard
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.utils.backendErrorText
import com.example.mobile.ui.utils.parsePositiveDouble
import com.example.mobile.ui.utils.validatePositiveDouble
import com.example.mobile.ui.utils.validateRequired
import kotlinx.coroutines.launch

@Composable
fun AppliancesScreen(
    authHeader: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()

    var appliances by remember { mutableStateOf<List<ApplianceDto>>(emptyList()) }
    var editingId by remember { mutableStateOf<Int?>(null) }

    var applianceName by remember { mutableStateOf("Boiler") }
    var description by remember { mutableStateOf("") }
    var appliancePower by remember { mutableStateOf("2.0") }

    var applianceNameError by remember { mutableStateOf<String?>(null) }
    var appliancePowerError by remember { mutableStateOf<String?>(null) }

    fun resetForm() {
        editingId = null
        applianceName = "Boiler"
        description = ""
        appliancePower = "2.0"
        applianceNameError = null
        appliancePowerError = null
    }

    fun loadAppliances() {
        scope.launch {
            try {
                val response = ApiClient.apiService.getAppliances(authHeader)

                if (response.isSuccessful) {
                    appliances = response.body().orEmpty()
                } else {
                    val error = response.errorBody()?.string()
                    showMessage(backendErrorText(response.code(), error))
                }
            } catch (e: Exception) {
                showMessage("Помилка завантаження приладів: ${e.message}")
            }
        }
    }

    LaunchedEffect(Unit) {
        loadAppliances()
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
                title = "Прилади",
                subtitle = "Керуйте електроприладами та їх потужністю",
                onBack = onBack
            )

            AppCard(
                title = if (editingId == null) "Новий прилад" else "Редагування приладу"
            ) {
                OutlinedTextField(
                    value = applianceName,
                    onValueChange = {
                        applianceName = it
                        applianceNameError = null
                    },
                    label = { Text("Назва приладу") },
                    isError = applianceNameError != null,
                    supportingText = { applianceNameError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Опис") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = appliancePower,
                    onValueChange = {
                        appliancePower = it
                        appliancePowerError = null
                    },
                    label = { Text("Потужність, кВт") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    isError = appliancePowerError != null,
                    supportingText = { appliancePowerError?.let { Text(it) } },
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryActionButton(
                        text = if (editingId == null) "Додати" else "Зберегти",
                        modifier = Modifier.weight(1f),
                        onClick = {
                            applianceNameError = validateRequired(applianceName, "Назва приладу")
                            appliancePowerError = if (appliancePower.isBlank()) {
                                null
                            } else {
                                validatePositiveDouble(appliancePower, "Потужність")
                            }

                            if (applianceNameError != null || appliancePowerError != null) {
                                showMessage("Виправте помилки у формі приладу")
                                return@PrimaryActionButton
                            }

                            scope.launch {
                                try {
                                    val id = editingId

                                    val response = if (id == null) {
                                        ApiClient.apiService.createAppliance(
                                            token = authHeader,
                                            request = CreateApplianceRequest(
                                                name = applianceName.trim(),
                                                description = description.ifBlank { null },
                                                estimated_power = parsePositiveDouble(appliancePower)
                                            )
                                        )
                                    } else {
                                        ApiClient.apiService.updateAppliance(
                                            token = authHeader,
                                            id = id,
                                            request = UpdateApplianceRequest(
                                                name = applianceName.trim(),
                                                description = description.ifBlank { null },
                                                estimated_power = parsePositiveDouble(appliancePower)
                                            )
                                        )
                                    }

                                    if (response.isSuccessful) {
                                        showMessage(
                                            if (id == null) {
                                                "Прилад створено"
                                            } else {
                                                "Прилад оновлено"
                                            }
                                        )
                                        resetForm()
                                        loadAppliances()
                                    } else {
                                        val error = response.errorBody()?.string()
                                        showMessage(backendErrorText(response.code(), error))
                                    }
                                } catch (e: Exception) {
                                    showMessage("Помилка збереження приладу: ${e.message}")
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

            AppCard(title = "Список приладів") {
                if (appliances.isEmpty()) {
                    Text("Даних немає")
                } else {
                    appliances.forEachIndexed { index, appliance ->
                        Text("${index + 1}. ${appliance.name}")
                        Text("Опис: ${appliance.description ?: "-"}")
                        Text("Потужність: ${appliance.estimated_power ?: "-"} кВт")

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    editingId = appliance.id
                                    applianceName = appliance.name
                                    description = appliance.description ?: ""
                                    appliancePower = appliance.estimated_power ?: ""
                                }
                            ) {
                                Text("Редаг.")
                            }

                            Button(
                                modifier = Modifier.weight(1f),
                                onClick = {
                                    scope.launch {
                                        try {
                                            val response = ApiClient.apiService.deleteAppliance(
                                                token = authHeader,
                                                id = appliance.id
                                            )

                                            if (response.isSuccessful) {
                                                showMessage("Прилад видалено")
                                                loadAppliances()
                                            } else {
                                                val error = response.errorBody()?.string()
                                                showMessage(backendErrorText(response.code(), error))
                                            }
                                        } catch (e: Exception) {
                                            showMessage("Помилка видалення приладу: ${e.message}")
                                        }
                                    }
                                }
                            ) {
                                Text("Видал.")
                            }
                        }

                        if (index != appliances.lastIndex) {
                            Divider(modifier = Modifier.padding(vertical = 10.dp))
                        }
                    }
                }
            }
        }
    }
}