package com.example.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = EnergyGreen,
    secondary = EnergyBlue,
    tertiary = EnergyOrange,
    background = EnergyBg,
    surface = EnergyCard,
    error = EnergyRed,
    onPrimary = EnergyCard,
    onSecondary = EnergyCard,
    onBackground = EnergyText,
    onSurface = EnergyText
)

@Composable
fun MobileTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = Typography,
        content = content
    )
}