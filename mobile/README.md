# ReconX Mobile Companion (Flutter Android Notification Sync Agent)

A lightweight, enterprise-grade Flutter application designed for **real-time interception and automated synchronization of banking, e-wallet, e-commerce, and investment transaction notifications** directly to the **ReconX Payment Clearing & Ledger Platform**.

---

## 🚀 Key Capabilities

1. **Native Android `NotificationListenerService` (`ReconXNotificationListener.kt`):**
   - Intercepts incoming push notifications directly from Android system level without polling.
   - Zero battery drain: dormant until a push notification is posted by monitored apps.
2. **7 Major Financial & Commercial Channels Supported:**
   - **blu by BCA Digital** (`id.co.bcadigital.blu`): QRIS transactions, BI-FAST transfers, debit mutasi.
   - **SeaBank Indonesia** (`com.searpm.bank`): ShopeePay auto-debits, QRIS, transfers.
   - **Superbank Indonesia** (`id.superbank.app`): Grab transactions & BI-FAST disbursements.
   - **ShopeePay** (`com.shopee.id`): Merchant checkout, QRIS & wallet deductions.
   - **Tokopedia** (`com.tokopedia.tkpd`): Verified checkout receipts & GoPay transactions.
   - **OVO** (`ovo.id`): Merchant payments & Alfamart/Indomaret QRIS.
   - **Bibit / Ajaib / Stockbit** (`com.bibit.id`): Mutual funds (Reksa Dana) & Stock purchase settlements.
3. **Smart Regex & Currency Extractor:**
   - Automatically extracts transaction nominal (`Rp XX.XXX`), recipient/merchant name, and transaction channel.
4. **Google OAuth 2.0 Single Sign-On:**
   - Unified authentication matching the ReconX Web Dashboard.
5. **Interactive Notification Simulator:**
   - Allows instant test-firing of incoming payment notifications from inside the app without needing to execute a real purchase.

---

## 🛠️ Getting Started & Installation

### Prerequisites
- Flutter SDK `>=3.0.0`
- Android SDK (API level 24+)
- ReconX Backend running on `http://<your-ip>:5000`

### 1. Configure Backend URL
In `lib/services/api_sync_service.dart` or inside the **Settings** screen in the app:
- For Android Emulator: `http://10.0.2.2:5000/api/v1`
- For Physical Android Phone: `http://192.168.1.X:5000/api/v1` (replace with your laptop's local LAN IP)

### 2. Run the App
```bash
cd mobile
flutter pub get
flutter run
```

### 3. Grant Android Notification Access
1. Open the app on your Android device.
2. Go to **Settings** -> tap **"Buka Pengaturan Izin Android"**.
3. Toggle ON **"ReconX Companion"** under **Device & App Notifications**.
4. Now, every payment notification received on your smartphone will be automatically captured, parsed, and recorded into your ReconX internal ledger in under 50ms!
