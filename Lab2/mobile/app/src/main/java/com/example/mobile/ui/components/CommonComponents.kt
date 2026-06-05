package com.example.mobile.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.example.mobile.ui.theme.EnergyBlue
import com.example.mobile.ui.theme.EnergyCard
import com.example.mobile.ui.theme.EnergyGreen
import com.example.mobile.ui.theme.EnergyMint
import com.example.mobile.ui.theme.EnergyMuted

@Composable
fun ScreenHeader(
    title: String,
    subtitle: String? = null,
    onBack: (() -> Unit)? = null,
    trailing: @Composable (() -> Unit)? = null
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(EnergyGreen, EnergyBlue)
                    ),
                    shape = RoundedCornerShape(24.dp)
                )
                .padding(18.dp)
        ) {
            Column {
                Text(
                    text = title,
                    color = EnergyCard,
                    style = MaterialTheme.typography.headlineMedium
                )

                if (!subtitle.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = subtitle,
                        color = EnergyMint,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                if (trailing != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    trailing()
                }
            }
        }

        if (onBack != null) {
            Spacer(modifier = Modifier.height(10.dp))

            OutlinedButton(onClick = onBack) {
                Text("← Назад")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleLarge
    )

    Spacer(modifier = Modifier.height(8.dp))
}

@Composable
fun AppCard(
    title: String,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = EnergyCard),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium
            )

            Spacer(modifier = Modifier.height(10.dp))

            content()
        }
    }
}

@Composable
fun StatGrid(
    items: List<Pair<String, String>>
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items.chunked(2).forEach { rowItems ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rowItems.forEach { item ->
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = EnergyMint),
                        shape = RoundedCornerShape(18.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = item.first,
                                color = EnergyMuted,
                                style = MaterialTheme.typography.bodySmall
                            )

                            Text(
                                text = item.second,
                                style = MaterialTheme.typography.titleLarge
                            )
                        }
                    }
                }

                if (rowItems.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
fun SimpleList(
    title: String,
    items: List<String>
) {
    AppCard(title = title) {
        if (items.isEmpty()) {
            Text("Даних немає")
        } else {
            items.forEachIndexed { index, item ->
                Text("${index + 1}. $item")

                if (index != items.lastIndex) {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                }
            }
        }
    }
}

@Composable
fun PrimaryActionButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = EnergyGreen
        )
    ) {
        Text(text)
    }
}