package com.example.mobile.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.mobile.data.api.ApiClient
import com.example.mobile.data.model.LoginRequest
import com.example.mobile.data.model.RegisterRequest
import com.example.mobile.ui.components.PrimaryActionButton
import com.example.mobile.ui.components.ScreenHeader
import com.example.mobile.ui.utils.backendErrorText
import com.example.mobile.ui.utils.validateEmail
import com.example.mobile.ui.utils.validatePassword
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onTokenReceived: (String) -> Unit
) {
    val scope = rememberCoroutineScope()

    var isRegisterMode by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }

    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(20.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            ScreenHeader(
                title = "Energy Monitor",
                subtitle = "Персональний контроль енергоспоживання"
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = if (isRegisterMode) {
                            "Створення акаунта"
                        } else {
                            "Вхід у систему"
                        },
                        style = MaterialTheme.typography.headlineSmall
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = email,
                        onValueChange = {
                            email = it
                            emailError = null
                        },
                        label = { Text("Email") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        isError = emailError != null,
                        supportingText = { emailError?.let { Text(it) } },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = password,
                        onValueChange = {
                            password = it
                            passwordError = null
                        },
                        label = { Text("Пароль") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        isError = passwordError != null,
                        supportingText = { passwordError?.let { Text(it) } },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    PrimaryActionButton(
                        text = if (isRegisterMode) "Зареєструватися" else "Увійти",
                        enabled = !isLoading,
                        onClick = {
                            emailError = validateEmail(email)
                            passwordError = validatePassword(password)

                            if (emailError != null || passwordError != null) {
                                showMessage("Виправте помилки у формі")
                                return@PrimaryActionButton
                            }

                            scope.launch {
                                isLoading = true

                                try {
                                    if (isRegisterMode) {
                                        val response = ApiClient.apiService.register(
                                            RegisterRequest(
                                                email = email.trim(),
                                                password = password
                                            )
                                        )

                                        if (response.isSuccessful) {
                                            isRegisterMode = false
                                            password = ""
                                            showMessage("Реєстрація успішна. Тепер увійдіть.")
                                        } else {
                                            val error = response.errorBody()?.string()
                                            showMessage(backendErrorText(response.code(), error))
                                        }
                                    } else {
                                        val response = ApiClient.apiService.login(
                                            LoginRequest(
                                                email = email.trim(),
                                                password = password
                                            )
                                        )

                                        val body = response.body()

                                        if (response.isSuccessful && body != null) {
                                            onTokenReceived(body.token)
                                        } else {
                                            val error = response.errorBody()?.string()
                                            showMessage(backendErrorText(response.code(), error))
                                        }
                                    }
                                } catch (e: Exception) {
                                    showMessage("Помилка з'єднання: ${e.message}")
                                } finally {
                                    isLoading = false
                                }
                            }
                        }
                    )

                    TextButton(
                        onClick = {
                            isRegisterMode = !isRegisterMode
                        }
                    ) {
                        Text(
                            if (isRegisterMode) {
                                "Вже є акаунт? Увійти"
                            } else {
                                "Немає акаунта? Зареєструватися"
                            }
                        )
                    }
                }
            }
        }
    }
}