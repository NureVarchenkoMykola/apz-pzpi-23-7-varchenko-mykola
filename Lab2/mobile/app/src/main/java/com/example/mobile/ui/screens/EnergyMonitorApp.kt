package com.example.mobile.ui.screens

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import com.example.mobile.data.storage.TokenManager

enum class AppScreen {
    Home,
    Tariffs,
    Appliances,
    Consumption,
    Limits,
    Reports
}

@Composable
fun EnergyMonitorApp() {
    val context = LocalContext.current
    val tokenManager = remember {
        TokenManager(context.applicationContext)
    }

    val snackbarHostState = remember {
        SnackbarHostState()
    }

    var token by remember {
        mutableStateOf(tokenManager.getToken())
    }

    var snackbarMessage by remember {
        mutableStateOf<String?>(null)
    }

    LaunchedEffect(snackbarMessage) {
        val message = snackbarMessage

        if (message != null) {
            snackbarHostState.showSnackbar(message)
            snackbarMessage = null
        }
    }

    if (token == null) {
        AuthScreen(
            snackbarHostState = snackbarHostState,
            showMessage = { snackbarMessage = it },
            onTokenReceived = { newToken ->
                tokenManager.saveToken(newToken)
                token = newToken
            }
        )
    } else {
        AuthorizedApp(
            token = token!!,
            snackbarHostState = snackbarHostState,
            showMessage = { snackbarMessage = it },
            onLogout = {
                tokenManager.clearToken()
                token = null
            }
        )
    }
}