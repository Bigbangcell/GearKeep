package com.gearkeeper.app.work

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.gearkeeper.app.data.db.AppDatabase
import com.gearkeeper.app.data.entity.Item
import java.util.concurrent.TimeUnit

class WarrantyCheckWorker(appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams) {

    companion object {
        const val CHANNEL_ID = "warranty_notifications"
        const val CHANNEL_NAME = "保修提醒"
        const val CHANNEL_DESCRIPTION = "提醒您设备的保修状态"
    }

    override suspend fun doWork(): Result {
        try {
            // 初始化通知渠道
            createNotificationChannel()

            // 检查即将过保的设备
            checkWarrantyStatus()

            return Result.success()
        } catch (e: Exception) {
            return Result.retry()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = CHANNEL_DESCRIPTION
            }
            val notificationManager: NotificationManager = 
                applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private suspend fun checkWarrantyStatus() {
        val database = AppDatabase.getDatabase(applicationContext)
        val itemDao = database.itemDao()

        val now = System.currentTimeMillis()
        val sevenDaysLater = now + TimeUnit.DAYS.toMillis(7)

        // 获取7天内即将过保的设备
        val expiringItems = itemDao.getItemsWithWarrantyExpiringSoon(now, sevenDaysLater)

        if (expiringItems.isNotEmpty()) {
            sendWarrantyNotification(expiringItems)
        }
    }

    private fun sendWarrantyNotification(items: List<Item>) {
        val notificationBuilder = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("保修提醒")
            .setContentText("您有${items.size}个设备即将过保，请及时处理")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)

        with(NotificationManagerCompat.from(applicationContext)) {
            notify(1, notificationBuilder.build())
        }
    }
}
