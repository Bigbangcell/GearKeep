package com.gearkeeper.app.ui.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.gearkeeper.app.ui.viewmodel.ItemDetailViewModel
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemDetailScreen(
    viewModel: ItemDetailViewModel,
    itemId: UUID,
    navController: NavController
) {
    val item by viewModel.item.collectAsState()
    val accessories by viewModel.accessories.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    // 加载物品详情
    remember {
        viewModel.loadItem(itemId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("物品详情") }
            )
        }
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(it),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item?.let {
                // 基本信息
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = it.name,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${it.brand} ${it.model}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "序列号: ${it.sn}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                text = "购入价格: ¥${String.format("%.2f", it.purchasePrice)}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "存放位置: ${it.location}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            if (it.notes.isNotEmpty()) {
                                Text(
                                    text = "备注: ${it.notes}",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                    }
                }

                // 保修信息
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = "保修信息",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "保修月数: ${it.warrantyMonths}个月",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                text = "保修截止日: ${it.warrantyDeadline}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            // TODO: 实现保修倒计时条
                        }
                    }
                }

                // 配件列表
                item {
                    Text(
                        text = "配件",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                if (accessories.isNotEmpty()) {
                    items(accessories) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Text(
                                    text = it.name,
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "${it.brand} ${it.model}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Button(
                                    modifier = Modifier.padding(top = 8.dp),
                                    onClick = {
                                        viewModel.removeAccessory(itemId, it.id)
                                    }
                                ) {
                                    Text("解绑")
                                }
                            }
                        }
                    }
                } else {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "无配件",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                // 操作按钮
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Button(
                            modifier = Modifier.weight(1f),
                            onClick = {
                                navController.navigate("addItem")
                            }
                        ) {
                            Text("添加配件")
                        }
                        Button(
                            modifier = Modifier.weight(1f),
                            onClick = {
                                navController.navigate("addItem")
                            }
                        ) {
                            Text("编辑")
                        }
                        Button(
                            modifier = Modifier.weight(1f),
                            onClick = {
                                viewModel.deleteItem(itemId)
                                navController.popBackStack()
                            }
                        ) {
                            Text("删除")
                        }
                    }
                }
            }
        }
    }
}
