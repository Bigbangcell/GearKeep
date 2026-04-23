package com.gearkeeper.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gearkeeper.app.data.entity.Item
import com.gearkeeper.app.data.repository.ItemRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class DashboardViewModel(private val repository: ItemRepository) : ViewModel() {
    private val _totalValue = MutableStateFlow(0.0)
    val totalValue: StateFlow<Double> = _totalValue

    private val _expiringItems = MutableStateFlow<List<Item>>(emptyList())
    val expiringItems: StateFlow<List<Item>> = _expiringItems

    private val _expiredItems = MutableStateFlow<List<Item>>(emptyList())
    val expiredItems: StateFlow<List<Item>> = _expiredItems

    private val _recentItems = MutableStateFlow<List<Item>>(emptyList())
    val recentItems: StateFlow<List<Item>> = _recentItems

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            // 加载总资产
            _totalValue.value = repository.getTotalValue()

            // 加载即将过保的物品
            _expiringItems.value = repository.getItemsWithWarrantyExpiringSoon()

            // 加载已过保的物品
            _expiredItems.value = repository.getItemsWithExpiredWarranty()

            // 加载最近添加的物品（取前5个）
            _recentItems.value = repository.getAllItems().take(5)
        }
    }
}
