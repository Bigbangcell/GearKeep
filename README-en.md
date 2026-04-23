# GearKeep

🌐 **Language**
- [English](README-en.md)
- [中文 (Chinese)](README.md)



## Project Overview

GearKeep is a privacy-focused, local-first equipment management app designed specifically for photographers and digital enthusiasts.

- **Local-First**：All data is stored locally on your device, no cloud syncing, ensuring privacy and security
- **Privacy Priority**：No ads, no data collection, fully controlled by the user
- **Equipment Ecosystem**：Supports association management between main devices and accessories
- **Warranty Tracking**：Automatically calculates and reminds you of warranty expirations
- **Local Data Migration**：Supports complete data backup and restoration with attachments

## Core Features

### 1. Intelligent Entry
- **Manual Entry**：Standard form filling
- **Text Paste Recognition**：Automatically parses text containing brand, model, and price
- **Serial Number OCR**：Quickly scans and recognizes serial numbers using the camera

### 2. Asset and Warranty Management
- **Warranty Dashboard**：Displays equipment approaching warranty expiration (within 30 days) and expired items
- **Value Statistics**：Automatically summarizes the total value of all items
- **Local Notifications**：Sends system notifications 7 days before warranty expiration

### 3. Equipment Ecosystem View
- Displays the list of accessories associated with a device on the item detail page
- Supports "add existing item as accessory" and "quick unbind"

### 4. Enhanced Local Sync
- **Export**：Packages data as `.gearbak` (Zip format), including structured data and images
- **Import**：Supports conflict resolution with options to overwrite, keep, or add as new

## Technology Stack

- **Language**：Kotlin
- **UI Framework**：Jetpack Compose (Material 3)
- **Database**：Room Persistence Library (SQLite)
- **Image Processing**：Coil, Scoped Storage
- **OCR Library**：Google ML Kit
- **Background Tasks**：WorkManager
- **Data Exchange**：JSON + Zip

## Project Structure

```
app/
├── src/main/
│   ├── java/com/gearkeeper/app/
│   │   ├── data/            # Data layer
│   │   │   ├── dao/         # Data access objects
│   │   │   ├── db/          # Database configuration
│   │   │   ├── entity/      # Data entities
│   │   │   └── repository/  # Repository pattern
│   │   ├── ui/              # UI layer
│   │   │   ├── component/   # Reusable components
│   │   │   ├── screen/      # Pages
│   │   │   └── viewmodel/   # View models
│   │   ├── work/            # Background tasks
│   │   └── MainActivity.kt  # Main activity
│   ├── res/                 # Resource files
│   └── AndroidManifest.xml  # App configuration
└── build.gradle.kts         # Module configuration
```

## Installation

### Build from Source

1. Clone this repository：
   ```bash
   git clone https://github.com/Bigbangcell/GearKeep.git
   cd GearKeep
   ```

2. Open the project in Android Studio

3. Sync Gradle dependencies

4. Build and run the app on your device or emulator

## Usage Guide

### Basic Operations

1. **Add Item**：Click the "+" button on the home page, fill in item information or use OCR functionality

2. **View Details**：Click an item in the inventory to enter the detail page, view detailed information and associated accessories

3. **Export Data**：Select "Export Data" in the settings page to generate a `.gearbak` backup file

4. **Import Data**：Select "Import Data" in the settings page, select the `.gearbak` file and handle conflicts

### Data Security

- All data is stored in a local SQLite database
- Exported `.gearbak` files contain complete data and images
- Regularly export backups to secure locations

## Development Contribution

1. Fork this repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) file for details

## Contact

For questions or suggestions, please contact：
- Email: bigbangcelllzz@gmail.com
- GitHub Issues: [Submit Issue](https://github.com/Bigbangcell/GearKeep/issues)

---

**GearKeep - Make equipment management easier**