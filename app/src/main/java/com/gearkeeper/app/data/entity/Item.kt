package com.gearkeeper.app.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "items")
data class Item(
    @PrimaryKey val id: UUID = UUID.randomUUID(),
    val name: String,
    val brand: String,
    val model: String,
    val sn: String,
    val purchasePrice: Double,
    val purchaseDate: Long,
    val warrantyMonths: Int,
    val warrantyDeadline: Long,
    val location: String,
    val notes: String,
    val isMaster: Boolean,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
