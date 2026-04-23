package com.gearkeeper.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gearkeeper.app.data.entity.Item
import com.gearkeeper.app.data.repository.ItemRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class ItemDetailViewModel(private val repository: ItemRepository) : ViewModel() {
    private val _item = MutableStateFlow<Item?>(null)
    val item: StateFlow<Item?> = _item

    private val _accessories = MutableStateFlow<List<Item>>(emptyList())
    val accessories: StateFlow<List<Item>> = _accessories

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    fun loadItem(itemId: UUID) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _item.value = repository.getItemById(itemId)
                _accessories.value = repository.getAccessoriesForItem(itemId)
            } catch (e: Exception) {
                // 处理错误
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun addAccessory(parentId: UUID, childId: UUID) {
        viewModelScope.launch {
            try {
                repository.addAccessory(parentId, childId)
                _accessories.value = repository.getAccessoriesForItem(parentId)
            } catch (e: Exception) {
                // 处理错误
            }
        }
    }

    fun removeAccessory(parentId: UUID, childId: UUID) {
        viewModelScope.launch {
            try {
                repository.removeAccessory(parentId, childId)
                _accessories.value = repository.getAccessoriesForItem(parentId)
            } catch (e: Exception) {
                // 处理错误
            }
        }
    }

    fun deleteItem(itemId: UUID) {
        viewModelScope.launch {
            try {
                val item = _item.value
                item?.let {
                    repository.deleteItem(it)
                }
            } catch (e: Exception) {
                // 处理错误
            }
        }
    }
}
