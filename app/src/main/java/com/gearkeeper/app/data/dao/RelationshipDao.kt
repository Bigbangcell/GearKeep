package com.gearkeeper.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import com.gearkeeper.app.data.entity.Relationship
import java.util.UUID

@Dao
interface RelationshipDao {
    @Insert
    suspend fun insert(relationship: Relationship)

    @Delete
    suspend fun delete(relationship: Relationship)

    @Query("SELECT childId FROM relationships WHERE parentId = :parentId")
    suspend fun getChildIdsByParentId(parentId: UUID): List<UUID>

    @Query("SELECT parentId FROM relationships WHERE childId = :childId")
    suspend fun getParentIdsByChildId(childId: UUID): List<UUID>

    @Query("SELECT * FROM relationships WHERE parentId = :parentId AND childId = :childId")
    suspend fun getRelationship(parentId: UUID, childId: UUID): Relationship?

    @Query("DELETE FROM relationships WHERE parentId = :parentId AND childId = :childId")
    suspend fun deleteRelationship(parentId: UUID, childId: UUID)

    @Query("SELECT * FROM relationships")
    suspend fun getAllRelationships(): List<Relationship>
}
