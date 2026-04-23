# GearKeep

![GearKeep Logo](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20logo%20for%20GearKeep%20app%2C%20camera%20equipment%20management%2C%20clean%20design%2C%20blue%20and%20gray%20colors&image_size=square)

## 项目概述

GearKeep 是一款专为摄影师和数码爱好者设计的纯本地、隐私安全的器材管理应用。

- **纯本地运行**：数据完全存储在本地设备，无云端同步，确保隐私安全
- **隐私优先**：无广告、无数据收集，完全由用户控制
- **器材配套逻辑**：支持主设备与配件的关联管理
- **保修追踪**：自动计算并提醒保修到期
- **本地数据迁移**：支持带附件的完整数据备份与恢复

## 核心功能

### 1. 智能录入
- **手动录入**：标准表单填写
- **文本粘贴识别**：自动解析包含品牌、型号、价格的文本
- **序列号 OCR 识别**：利用摄像头快速扫描识别序列号

### 2. 资产与保修管理
- **保修看板**：显示即将过保和已过保的器材
- **价值统计**：自动汇总所有物品的总价值
- **本地通知**：保修到期前 7 天发送系统通知

### 3. 器材配套视图
- 在物品详情页展示设备的配套附件列表
- 支持添加现有物品为附件和快捷解绑

### 4. 增强型本地同步
- **导出**：将数据打包为 `.gearbak` (Zip格式)，包含结构化数据和图片
- **导入**：支持冲突处理，提供覆盖、保留或新增选项

## 技术栈

- **语言**：Kotlin
- **UI 框架**：Jetpack Compose (Material 3)
- **数据库**：Room Persistence Library (SQLite)
- **图片处理**：Coil, Scoped Storage
- **OCR 库**：Google ML Kit
- **后台任务**：WorkManager
- **数据交换**：JSON + Zip

## 项目结构

```
app/
├── src/main/
│   ├── java/com/gearkeeper/app/
│   │   ├── data/            # 数据层
│   │   │   ├── dao/         # 数据访问对象
│   │   │   ├── db/          # 数据库配置
│   │   │   ├── entity/      # 数据实体
│   │   │   └── repository/  # 仓库模式
│   │   ├── ui/              # 界面层
│   │   │   ├── component/   # 可复用组件
│   │   │   ├── screen/      # 页面
│   │   │   └── viewmodel/   # 视图模型
│   │   ├── work/            # 后台任务
│   │   └── MainActivity.kt  # 主活动
│   ├── res/                 # 资源文件
│   └── AndroidManifest.xml  # 应用配置
└── build.gradle.kts         # 模块配置
```

## 安装说明

### 从源码构建

1. 克隆本仓库：
   ```bash
   git clone https://github.com/Bigbangcell/GearKeep.git
   cd GearKeep
   ```

2. 使用 Android Studio 打开项目

3. 同步 Gradle 依赖

4. 构建并运行应用到您的设备或模拟器

## 使用指南

### 基本操作

1. **添加物品**：点击首页的 "+" 按钮，填写物品信息或使用 OCR 功能

2. **查看详情**：在器材库中点击物品进入详情页，查看详细信息和配套附件

3. **导出数据**：在设置页选择 "导出数据"，生成 `.gearbak` 备份文件

4. **导入数据**：在设置页选择 "导入数据"，选择 `.gearbak` 文件并处理冲突

### 数据安全

- 所有数据存储在本地 SQLite 数据库中
- 导出的 `.gearbak` 文件包含完整数据和图片
- 建议定期导出备份到安全位置

## 开发贡献

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系我们

如有问题或建议，请通过以下方式联系：
- Email: bigbangcell@gmail.com
- GitHub Issues: [提交问题](https://github.com/Bigbangcell/GearKeep/issues)

---

**GearKeep - 让器材管理更简单**