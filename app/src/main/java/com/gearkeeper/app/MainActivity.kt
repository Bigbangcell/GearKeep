package com.gearkeeper.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.gearkeeper.app.data.db.AppDatabase
import com.gearkeeper.app.data.repository.ItemRepository
import com.gearkeeper.app.ui.component.BottomNavigationBar
import com.gearkeeper.app.ui.screen.AddItemScreen
import com.gearkeeper.app.ui.screen.DashboardScreen
import com.gearkeeper.app.ui.screen.InventoryScreen
import com.gearkeeper.app.ui.screen.ItemDetailScreen
import com.gearkeeper.app.ui.screen.SettingsScreen
import com.gearkeeper.app.ui.viewmodel.AddItemViewModel
import com.gearkeeper.app.ui.viewmodel.DashboardViewModel
import com.gearkeeper.app.ui.viewmodel.InventoryViewModel
import com.gearkeeper.app.ui.viewmodel.ItemDetailViewModel
import com.gearkeeper.app.ui.viewmodel.SettingsViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 初始化数据库和Repository
        val database = AppDatabase.getDatabase(this)
        val itemDao = database.itemDao()
        val relationshipDao = database.relationshipDao()
        val repository = ItemRepository(itemDao, relationshipDao)

        // 初始化ViewModel
        val dashboardViewModel = DashboardViewModel(repository)
        val inventoryViewModel = InventoryViewModel(repository)
        val addItemViewModel = AddItemViewModel(repository)
        val itemDetailViewModel = ItemDetailViewModel(repository)
        val settingsViewModel = SettingsViewModel(repository)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    AppNavigation(
                        navController = navController,
                        dashboardViewModel = dashboardViewModel,
                        inventoryViewModel = inventoryViewModel,
                        addItemViewModel = addItemViewModel,
                        itemDetailViewModel = itemDetailViewModel,
                        settingsViewModel = settingsViewModel
                    )
                }
            }
        }
    }
}

@Composable
fun AppNavigation(
    navController: NavHostController,
    dashboardViewModel: DashboardViewModel,
    inventoryViewModel: InventoryViewModel,
    addItemViewModel: AddItemViewModel,
    itemDetailViewModel: ItemDetailViewModel,
    settingsViewModel: SettingsViewModel
) {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        NavHost(
            navController = navController,
            startDestination = "dashboard"
        ) {
            composable("dashboard") {
                DashboardScreen(
                    viewModel = dashboardViewModel,
                    navController = navController
                )
            }
            composable("inventory") {
                InventoryScreen(
                    viewModel = inventoryViewModel,
                    navController = navController
                )
            }
            composable("addItem") {
                AddItemScreen(
                    viewModel = addItemViewModel,
                    navController = navController
                )
            }
            composable("itemDetail/{itemId}") {backStackEntry ->
                val itemId = backStackEntry.arguments?.getString("itemId")
                itemId?.let {
                    ItemDetailScreen(
                        viewModel = itemDetailViewModel,
                        itemId = java.util.UUID.fromString(it),
                        navController = navController
                    )
                }
            }
            composable("settings") {
                SettingsScreen(
                    viewModel = settingsViewModel,
                    navController = navController
                )
            }
        }
        BottomNavigationBar(navController = navController)
    }
}
