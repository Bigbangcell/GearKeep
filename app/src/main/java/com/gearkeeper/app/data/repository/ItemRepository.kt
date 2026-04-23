package com.gearkeeper.app.data.repository

import com.gearkeeper.app.data.dao.ItemDao
import com.gearkeeper.app.data.dao.RelationshipDao
import com.gearkeeper.app.data.entity.Item
import com.gearkeeper.app.data.entity.Relationship
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class ItemRepository(
    private val itemDao: ItemDao,
    private val relationshipDao: RelationshipDao
) {
    suspend fun insertItem(item: Item): UUID {
        withContext(Dispatchers.IO) {
            itemDao.insert(item)
        }
        return item.id
    }

    suspend fun updateItem(item: Item) {
        withContext(Dispatchers.IO) {
            val updatedItem = item.copy(updatedAt = System.currentTimeMillis())
            itemDao.update(updatedItem)
        }
    }

    suspend fun deleteItem(item: Item) {
        withContext(Dispatchers.IO) {
            itemDao.delete(item)
        }
    }

    suspend fun getItemById(id: UUID): Item? {
        return withContext(Dispatchers.IO) {
            itemDao.getItemById(id)
        }
    }

    suspend fun getAllItems(): List<Item> {
        return withContext(Dispatchers.IO) {
            itemDao.getAllItems()
        }
    }

    suspend fun searchItems(query: String): List<Item> {
        return withContext(Dispatchers.IO) {
            itemDao.searchItems("%$query%")
        }
    }

    suspend fun getItemsWithWarrantyExpiringSoon(): List<Item> {
        val now = System.currentTimeMillis()
        val thirtyDaysLater = now + (30 * 24 * 60 * 60 * 1000)
        return withContext(Dispatchers.IO) {
            itemDao.getItemsWithWarrantyExpiringSoon(now, thirtyDaysLater)
        }
    }

    suspend fun getItemsWithExpiredWarranty(): List<Item> {
        val now = System.currentTimeMillis()
        return withContext(Dispatchers.IO) {
            itemDao.getItemsWithExpiredWarranty(now)
        }
    }

    suspend fun getTotalValue(): Double {
        return withContext(Dispatchers.IO) {
            itemDao.getTotalValue() ?: 0.0
        }
    }

    suspend fun addAccessory(parentId: UUID, childId: UUID) {
        withContext(Dispatchers.IO) {
            val relationship = Relationship(parentId, childId)
            relationshipDao.insert(relationship)
        }
    }

    suspend fun removeAccessory(parentId: UUID, childId: UUID) {
        withContext(Dispatchers.IO) {
            relationshipDao.deleteRelationship(parentId, childId)
        }
    }

    suspend fun getAccessoriesForItem(itemId: UUID): List<Item> {
        return withContext(Dispatchers.IO) {
            val childIds = relationshipDao.getChildIdsByParentId(itemId)
            if (childIds.isEmpty()) {
                emptyList()
            } else {
                itemDao.getItemsByIds(childIds)
            }
        }
    }

    suspend fun getParentItemsForItem(itemId: UUID): List<Item> {
        return withContext(Dispatchers.IO) {
            val parentIds = relationshipDao.getParentIdsByChildId(itemId)
            if (parentIds.isEmpty()) {
                emptyList()
            } else {
                itemDao.getItemsByIds(parentIds)
            }
        }
    }

    suspend fun getAllRelationships(): List<Relationship> {
        return withContext(Dispatchers.IO) {
            relationshipDao.getAllRelationships()
        }
    }

    suspend fun getItemsByIds(ids: List<UUID>): List<Item> {
        return withContext(Dispatchers.IO) {
            itemDao.getItemsByIds(ids)
        }
    }
}
