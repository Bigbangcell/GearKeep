package com.gearkeeper.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.gearkeeper.app.data.entity.Item
import com.gearkeeper.app.data.entity.Relationship
import com.gearkeeper.app.data.repository.ItemRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class SettingsViewModel(private val repository: ItemRepository) : ViewModel() {
    private val _isExporting = MutableStateFlow(false)
    val isExporting: StateFlow<Boolean> = _isExporting

    private val _isImporting = MutableStateFlow(false)
    val isImporting: StateFlow<Boolean> = _isImporting

    private val _exportSuccess = MutableStateFlow(false)
    val exportSuccess: StateFlow<Boolean> = _exportSuccess

    private val _importSuccess = MutableStateFlow(false)
    val importSuccess: StateFlow<Boolean> = _importSuccess

    private val _errorMessage = MutableStateFlow("")
    val errorMessage: StateFlow<String> = _errorMessage

    fun exportData(outputFile: File) {
        viewModelScope.launch {
            _isExporting.value = true
            _exportSuccess.value = false
            _errorMessage.value = ""
            try {
                // 加载所有物品和关系
                val items = repository.getAllItems()
                val relationships = repository.getAllRelationships()

                // 创建JSON对象
                val jsonObject = JSONObject()
                val itemsArray = JSONArray()
                val relationshipsArray = JSONArray()

                // 转换物品数据
                items.forEach { item ->
                    val itemJson = JSONObject()
                    itemJson.put("id", item.id.toString())
                    itemJson.put("name", item.name)
                    itemJson.put("brand", item.brand)
                    itemJson.put("model", item.model)
                    itemJson.put("sn", item.sn)
                    itemJson.put("purchasePrice", item.purchasePrice)
                    itemJson.put("purchaseDate", item.purchaseDate)
                    itemJson.put("warrantyMonths", item.warrantyMonths)
                    itemJson.put("warrantyDeadline", item.warrantyDeadline)
                    itemJson.put("location", item.location)
                    itemJson.put("notes", item.notes)
                    itemJson.put("isMaster", item.isMaster)
                    itemJson.put("createdAt", item.createdAt)
                    itemJson.put("updatedAt", item.updatedAt)
                    itemsArray.put(itemJson)
                }

                // 转换关系数据
                relationships.forEach { relationship ->
                    val relationshipJson = JSONObject()
                    relationshipJson.put("parentId", relationship.parentId.toString())
                    relationshipJson.put("childId", relationship.childId.toString())
                    relationshipJson.put("createdAt", relationship.createdAt)
                    relationshipsArray.put(relationshipJson)
                }

                jsonObject.put("items", itemsArray)
                jsonObject.put("relationships", relationshipsArray)

                // 创建ZIP文件
                ZipOutputStream(FileOutputStream(outputFile)).use { zipOut ->
                    // 添加data.json文件
                    val dataEntry = ZipEntry("data.json")
                    zipOut.putNextEntry(dataEntry)
                    zipOut.write(jsonObject.toString(2).toByteArray())
                    zipOut.closeEntry()
                }

                _exportSuccess.value = true
            } catch (e: Exception) {
                _errorMessage.value = "导出失败: ${e.message}"
            } finally {
                _isExporting.value = false
            }
        }
    }

    fun importData(inputFile: File) {
        viewModelScope.launch {
            _isImporting.value = true
            _importSuccess.value = false
            _errorMessage.value = ""
            try {
                // 解压ZIP文件
                ZipInputStream(FileInputStream(inputFile)).use { zipIn ->
                    var entry: ZipEntry?
                    while (zipIn.nextEntry.also { entry = it } != null) {
                        if (entry?.name == "data.json") {
                            // 读取data.json文件
                            val jsonContent = zipIn.bufferedReader().readText()
                            val jsonObject = JSONObject(jsonContent)

                            // 处理物品数据
                            val itemsArray = jsonObject.getJSONArray("items")
                            val relationshipsArray = jsonObject.getJSONArray("relationships")

                            // 导入物品
                            val importedItems = mutableListOf<Item>()
                            for (i in 0 until itemsArray.length()) {
                                val itemJson = itemsArray.getJSONObject(i)
                                val item = Item(
                                    id = java.util.UUID.fromString(itemJson.getString("id")),
                                    name = itemJson.getString("name"),
                                    brand = itemJson.getString("brand"),
                                    model = itemJson.getString("model"),
                                    sn = itemJson.getString("sn"),
                                    purchasePrice = itemJson.getDouble("purchasePrice"),
                                    purchaseDate = itemJson.getLong("purchaseDate"),
                                    warrantyMonths = itemJson.getInt("warrantyMonths"),
                                    warrantyDeadline = itemJson.getLong("warrantyDeadline"),
                                    location = itemJson.getString("location"),
                                    notes = itemJson.getString("notes"),
                                    isMaster = itemJson.getBoolean("isMaster"),
                                    createdAt = itemJson.getLong("createdAt"),
                                    updatedAt = itemJson.getLong("updatedAt")
                                )
                                importedItems.add(item)
                            }

                            // 导入关系
                            val importedRelationships = mutableListOf<Relationship>()
                            for (i in 0 until relationshipsArray.length()) {
                                val relationshipJson = relationshipsArray.getJSONObject(i)
                                val relationship = Relationship(
                                    parentId = java.util.UUID.fromString(relationshipJson.getString("parentId")),
                                    childId = java.util.UUID.fromString(relationshipJson.getString("childId")),
                                    createdAt = relationshipJson.getLong("createdAt")
                                )
                                importedRelationships.add(relationship)
                            }

                            // TODO: 处理冲突逻辑
                            // 这里需要实现冲突检测和处理，根据用户选择进行覆盖、保留或新增

                            _importSuccess.value = true
                        }
                        zipIn.closeEntry()
                    }
                }
            } catch (e: Exception) {
                _errorMessage.value = "导入失败: ${e.message}"
            } finally {
                _isImporting.value = false
            }
        }
    }

    fun clearData() {
        viewModelScope.launch {
            try {
                // TODO: 实现清除数据的逻辑
                // 这里需要删除所有物品和关系
            } catch (e: Exception) {
                _errorMessage.value = "清除数据失败: ${e.message}"
            }
        }
    }
}
