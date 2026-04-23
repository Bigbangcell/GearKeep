package com.gearkeeper.app.ui.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.gearkeeper.app.ui.viewmodel.AddItemViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddItemScreen(
    viewModel: AddItemViewModel,
    navController: NavController
) {
    val name by viewModel.name.collectAsState()
    val brand by viewModel.brand.collectAsState()
    val model by viewModel.model.collectAsState()
    val sn by viewModel.sn.collectAsState()
    val purchasePrice by viewModel.purchasePrice.collectAsState()
    val purchaseDate by viewModel.purchaseDate.collectAsState()
    val warrantyMonths by viewModel.warrantyMonths.collectAsState()
    val location by viewModel.location.collectAsState()
    val notes by viewModel.notes.collectAsState()
    val isMaster by viewModel.isMaster.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isSuccess by viewModel.isSuccess.collectAsState()

    var pasteText by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("添加物品") }
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(it)
                .verticalScroll(rememberScrollState())
        ) {
            // 基本信息
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = name,
                        onValueChange = { viewModel.setName(it) },
                        label = { Text("名称") }
                    )
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = brand,
                        onValueChange = { viewModel.setBrand(it) },
                        label = { Text("品牌") }
                    )
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = model,
                        onValueChange = { viewModel.setModel(it) },
                        label = { Text("型号") }
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextField(
                            modifier = Modifier.weight(1f),
                            value = sn,
                            onValueChange = { viewModel.setSn(it) },
                            label = { Text("序列号") }
                        )
                        Button(
                            modifier = Modifier.padding(start = 16.dp),
                            onClick = { /* 实现OCR扫描 */ }
                        ) {
                            Text("扫描")
                        }
                    }
                }
            }

            // 购买信息
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = purchasePrice,
                        onValueChange = { viewModel.setPurchasePrice(it) },
                        label = { Text("购入价格") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                    )
                    // TODO: 实现日期选择器
                    Text("购入日期: ${purchaseDate}")
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = warrantyMonths.toString(),
                        onValueChange = { 
                            val value = it.toIntOrNull() ?: 0
                            viewModel.setWarrantyMonths(value)
                        },
                        label = { Text("保修月数") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
            }

            // 其他信息
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = location,
                        onValueChange = { viewModel.setLocation(it) },
                        label = { Text("存放位置") }
                    )
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = notes,
                        onValueChange = { viewModel.setNotes(it) },
                        label = { Text("备注") },
                        maxLines = 3
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isMaster,
                            onCheckedChange = { viewModel.setIsMaster(it) }
                        )
                        Text("主设备")
                    }
                }
            }

            // 文本粘贴识别
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text("粘贴文本识别")
                    TextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = pasteText,
                        onValueChange = { pasteText = it },
                        label = { Text("粘贴文本") },
                        maxLines = 3
                    )
                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            viewModel.parsePastedText(pasteText)
                        }
                    ) {
                        Text("识别")
                    }
                }
            }

            // 保存按钮
            Button(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                onClick = {
                    viewModel.saveItem()
                    if (isSuccess) {
                        navController.popBackStack()
                    }
                },
                enabled = !isLoading
            ) {
                Text(if (isLoading) "保存中..." else "保存")
            }
        }
    }
}
