package com.gearkeeper.app.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.gearkeeper.app.data.dao.ItemDao
import com.gearkeeper.app.data.dao.RelationshipDao
import com.gearkeeper.app.data.entity.Item
import com.gearkeeper.app.data.entity.Relationship

@Database(
    entities = [Item::class, Relationship::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun itemDao(): ItemDao
    abstract fun relationshipDao(): RelationshipDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "gear_keep.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
