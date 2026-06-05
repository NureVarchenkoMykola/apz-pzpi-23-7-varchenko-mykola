package com.example.mobile.ui.screens

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

@Composable
fun AuthorizedApp(
    token: String,
    snackbarHostState: SnackbarHostState,
    showMessage: (String) -> Unit,
    onLogout: () -> Unit
) {
    var currentScreen by remember {
        mutableStateOf(AppScreen.Home)
    }

    val authHeader = remember(token) {
        "Bearer $token"
    }

    when (currentScreen) {
        AppScreen.Home -> HomeScreen(
            authHeader = authHeader,
            snackbarHostState = snackbarHostState,
            showMessage = showMessage,
            onOpenTariffs = { currentScreen = AppScreen.Tariffs },
            onOpenAppliances = { currentScreen = AppScreen.Appliances },
            onOpenConsumption = { currentScreen = AppScreen.Consumption },
            onOpenLimits = { currentScreen = AppScreen.Limits },
            onOpenReports = { currentScreen = AppScreen.Reports },
            onLogout = onLogout
        )

        AppScreen.Tariffs -> TariffsScreen(
            authHeader = authHeader,
            snackbarHostState = snackbarHostState,
            showMessage = showMessage,
            onBack = { currentScreen = AppScreen.Home }
        )

        AppScreen.Appliances -> AppliancesScreen(
            authHeader = authHeader,
            snackbarHostState = snackbarHostState,
            showMessage = showMessage,
            onBack = { currentScreen = AppScreen.Home }
        )

        AppScreen.Consumption -> ConsumptionScreen(
            authHeader = authHeader,
            snackbarHostState = snackbarHostState,
            showMessage = showMessage,
            onBack = { currentScreen = AppScreen.Home }
        )

        AppScreen.Limits -> LimitsScreen(
            authHeader = authHeader,
            snackbarHostState = snackbarHostState,
            showMessage = showMessage,
            onBack = { currentScreen = AppScreen.Home }
        )

        AppScreen.Reports -> ReportsScreen(
            authHeader = authHeader,
            snackbarHostState = snackbarHostState,
            showMessage = showMessage,
            onBack = { currentScreen = AppScreen.Home }
        )
    }
}