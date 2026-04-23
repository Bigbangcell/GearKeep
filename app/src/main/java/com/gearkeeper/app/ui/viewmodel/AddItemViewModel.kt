package com.gearkeeper.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gearkeeper.app.data.entity.Item
import com.gearkeeper.app.data.repository.ItemRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class AddItemViewModel(private val repository: ItemRepository) : ViewModel() {
    private val _name = MutableStateFlow("")
    val name: StateFlow<String> = _name

    private val _brand = MutableStateFlow("")
    val brand: StateFlow<String> = _brand

    private val _model = MutableStateFlow("")
    val model: StateFlow<String> = _model

    private val _sn = MutableStateFlow("")
    val sn: StateFlow<String> = _sn

    private val _purchasePrice = MutableStateFlow("")
    val purchasePrice: StateFlow<String> = _purchasePrice

    private val _purchaseDate = MutableStateFlow(System.currentTimeMillis())
    val purchaseDate: StateFlow<Long> = _purchaseDate

    private val _warrantyMonths = MutableStateFlow(12)
    val warrantyMonths: StateFlow<Int> = _warrantyMonths

    private val _location = MutableStateFlow("")
    val location: StateFlow<String> = _location

    private val _notes = MutableStateFlow("")
    val notes: StateFlow<String> = _notes

    private val _isMaster = MutableStateFlow(false)
    val isMaster: StateFlow<Boolean> = _isMaster

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _isSuccess = MutableStateFlow(false)
    val isSuccess: StateFlow<Boolean> = _isSuccess

    fun setName(value: String) { _name.value = value }
    fun setBrand(value: String) { _brand.value = value }
    fun setModel(value: String) { _model.value = value }
    fun setSn(value: String) { _sn.value = value }
    fun setPurchasePrice(value: String) { _purchasePrice.value = value }
    fun setPurchaseDate(value: Long) { _purchaseDate.value = value }
    fun setWarrantyMonths(value: Int) { _warrantyMonths.value = value }
    fun setLocation(value: String) { _location.value = value }
    fun setNotes(value: String) { _notes.value = value }
    fun setIsMaster(value: Boolean) { _isMaster.value = value }

    fun loadItem(itemId: UUID) {
        viewModelScope.launch {
            val item = repository.getItemById(itemId)
            item?.let {
                _name.value = it.name
                _brand.value = it.brand
                _model.value = it.model
                _sn.value = it.sn
                _purchasePrice.value = it.purchasePrice.toString()
                _purchaseDate.value = it.purchaseDate
                _warrantyMonths.value = it.warrantyMonths
                _location.value = it.location
                _notes.value = it.notes
                _isMaster.value = it.isMaster
            }
        }
    }

    fun saveItem(itemId: UUID? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val purchasePriceValue = _purchasePrice.value.toDoubleOrNull() ?: 0.0
                val warrantyDeadline = calculateWarrantyDeadline()
                
                val item = if (itemId != null) {
                    Item(
                        id = itemId,
                        name = _name.value,
                        brand = _brand.value,
                        model = _model.value,
                        sn = _sn.value,
                        purchasePrice = purchasePriceValue,
                        purchaseDate = _purchaseDate.value,
                        warrantyMonths = _warrantyMonths.value,
                        warrantyDeadline = warrantyDeadline,
                        location = _location.value,
                        notes = _notes.value,
                        isMaster = _isMaster.value
                    )
                } else {
                    Item(
                        name = _name.value,
                        brand = _brand.value,
                        model = _model.value,
                        sn = _sn.value,
                        purchasePrice = purchasePriceValue,
                        purchaseDate = _purchaseDate.value,
                        warrantyMonths = _warrantyMonths.value,
                        warrantyDeadline = warrantyDeadline,
                        location = _location.value,
                        notes = _notes.value,
                        isMaster = _isMaster.value
                    )
                }

                if (itemId != null) {
                    repository.updateItem(item)
                } else {
                    repository.insertItem(item)
                }
                _isSuccess.value = true
            } catch (e: Exception) {
                // 处理错误
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun resetState() {
        _name.value = ""
        _brand.value = ""
        _model.value = ""
        _sn.value = ""
        _purchasePrice.value = ""
        _purchaseDate.value = System.currentTimeMillis()
        _warrantyMonths.value = 12
        _location.value = ""
        _notes.value = ""
        _isMaster.value = false
        _isLoading.value = false
        _isSuccess.value = false
    }

    private fun calculateWarrantyDeadline(): Long {
        return _purchaseDate.value + (_warrantyMonths.value * 30L * 24L * 60L * 60L * 1000L)
    }

    fun parsePastedText(text: String) {
        // 简单的正则表达式解析，识别品牌、型号、价格
        val brandPattern = Regex("品牌[:：]\s*(\\w+)")
        val modelPattern = Regex("型号[:：]\s*(.+?)(?=价格|$)")
        val pricePattern = Regex("价格[:：]\s*([\\d.]+)")

        brandPattern.find(text)?.let { setBrand(it.groupValues[1]) }
        modelPattern.find(text)?.let { setModel(it.groupValues[1].trim()) }
        pricePattern.find(text)?.let { setPurchasePrice(it.groupValues[1]) }
    }
}
