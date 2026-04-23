package com.gearkeeper.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.gearkeeper.app.data.entity.Item
import java.util.UUID

@Dao
interface ItemDao {
    @Insert
    suspend fun insert(item: Item)

    @Update
    suspend fun update(item: Item)

    @Delete
    suspend fun delete(item: Item)

    @Query("SELECT * FROM items WHERE id = :id")
    suspend fun getItemById(id: UUID): Item?

    @Query("SELECT * FROM items ORDER BY createdAt DESC")
    suspend fun getAllItems(): List<Item>

    @Query("SELECT * FROM items WHERE name LIKE :query OR brand LIKE :query OR model LIKE :query OR sn LIKE :query ORDER BY createdAt DESC")
    suspend fun searchItems(query: String): List<Item>

    @Query("SELECT * FROM items WHERE warrantyDeadline BETWEEN :now AND :thirtyDaysLater ORDER BY warrantyDeadline ASC")
    suspend fun getItemsWithWarrantyExpiringSoon(now: Long, thirtyDaysLater: Long): List<Item>

    @Query("SELECT * FROM items WHERE warrantyDeadline < :now ORDER BY warrantyDeadline ASC")
    suspend fun getItemsWithExpiredWarranty(now: Long): List<Item>

    @Query("SELECT SUM(purchasePrice) FROM items")
    suspend fun getTotalValue(): Double

    @Query("SELECT * FROM items WHERE id IN (:ids)")
    suspend fun getItemsByIds(ids: List<UUID>): List<Item>
}
