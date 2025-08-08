# CLAUDE.md

## Project Overview

**AstroAura** is a production-ready, multi-lingual astrology and wellness mobile app for Android and iOS. Features responsive design from small phones to tablets with complete localization support.

### Core Requirements
- **Production-ready code** - No placeholder implementations
- **Complete localization** - All UI strings use ARB system (11 languages)
- **Responsive design** - Adaptive UI for all device sizes
- **Accessibility compliance** - Full semantic labels and adaptive UI

## Development Commands

### Flutter
- **Build**: `flutter build apk` / `flutter build ios`
- **Run**: `flutter run` (dev) / `flutter run --release` (prod)
- **Test**: `flutter test`
- **Analyze**: `flutter analyze`
- **Format**: `dart format .`
- **Clean**: `flutter clean`
- **Dependencies**: `flutter pub get`
- **Code Generation**: `flutter packages pub run build_runner build`

### Localization
- **Generate**: `flutter gen-l10n`
- **Location**: `lib/l10n/` with template `app_en.arb`
- **Languages**: en, de, fr, hi, zh, bn, ta, te, kn, es, pt
- **Required**: English (primary), Hindi, Kannada for new strings
- **Current Status**: 4460+ localized strings with comprehensive coverage
- **Remove unused**: `dart run remove_unused_localizations_keys:main`

#### Localization Guidelines
- Add all new strings to `app_en.arb` first
- Add Hindi (`app_hi.arb`) and Kannada (`app_kn.arb`) translations
- Use semantic keys describing purpose, not content
- Never hardcode strings in UI
- Use `l10n.conjunctionOr` and `l10n.conjunctionAnd` instead of "or"/"and"

### Assets
- **App Icons**: `flutter packages pub run flutter_launcher_icons:main`
- **Splash Screen**: `flutter packages pub run flutter_native_splash:create`

## Architecture

### Structure
- **Domain Layer** (`lib/domain/`): Business entities and interfaces
- **Data Layer** (`lib/data/`): Repository implementations and data models
- **Presentation Layer** (`lib/presentation/`, `lib/features/*/presentation/`): UI and state management

### Core Features (`lib/features/`)
- **Cosmic Chat** (`cosmic_chat/`): AI-powered astrological guidance with personalized insights
- **Natal Chart** (`natal_chart/`): Interactive birth chart generation with cosmic journey experience
- **Transit Engine** (`transit_engine/`): Real-time planetary transit tracking with cosmic weather dashboard
- **Horoscope** (`horoscope/`): Daily personalized insights and astrological guidance
- **Journal** (`journal/`): Personal wellness journal with mood tracking, astro tags, and analytics
- **Tarot** (`tarot/`): Card readings, interpretations, and personal card collections
- **Astro Match** (`astro_match/`): Compatibility analysis with celebration animations
- **Settings** (`settings/`): App configuration with notification management
- **Onboarding** (`onboarding/`): User setup with enhanced birth data collection and location search

### State Management
- **Provider Pattern**: Primary state management with centralized organization
- **Service Locator**: Dependency injection using `get_it`
- **App Providers** (`lib/providers/app_providers.dart`): Centralized provider management

### Data Storage
- **SQLite**: Primary database using `sqflite`
- **Hive**: High-performance NoSQL caching
- **Secure Storage**: Encrypted sensitive data using `flutter_secure_storage`
- **Shared Preferences**: App settings with migration support

### Core Services (`lib/core/services/`)
- **EphemerisService**: Astronomical calculations and planetary positions
- **NotificationService**: Local notifications with timezone awareness and release build optimization
- **LocationService**: GPS functionality with API fallbacks
- **ConnectivityService**: Network monitoring and offline capabilities
- **AdService**: Advertisement integration with privacy compliance
- **AdHelper**: Ad configuration and helper utilities
- **AdTrackingManager**: iOS ATT compliance and tracking management
- **InterstitialAdManager**: Full-screen ad management
- **PlatformNotificationAdapter**: Cross-platform notification handling

## UI & Design

### Theme System
- **Color Palette**: Golden primary (#F0C75E), cosmic purple secondary (#3A2B71)
- **Typography**: Georgia headlines, Arial body text with responsive scaling
- **Gradients**: 15+ specialized gradients for astrological themes

### Responsive Design
- **Screen Categories**: Small (<360px), Medium (360-600px), Large (600-840px), XLarge (>840px)
- **Touch Targets**: Minimum sizes with accessibility compliance

## Development Standards

### Code Quality
- Production-ready implementations only
- Comprehensive null safety and strong typing
- Robust error handling with user-friendly fallbacks
- Performance optimization for various device capabilities

### File Organization
- Feature structure: `presentation/`, `data/`, `domain/` pattern with complete feature modules
- Model generation with `build_runner` for type-safe data models
- Repository pattern with interface segregation and adapter patterns
- Service injection through `get_it` dependency container
- Provider-based state management with centralized app providers

### Testing
- Widget tests in `test/` directory
- Unit tests with proper mocking
- Integration tests for critical flows

## Key Dependencies

### Core
- `flutter_localizations`: Multi-language support
- `provider`: State management (v6.1.1)
- `get_it`: Service locator (v7.6.7)
- `flutter_screenutil`: Responsive scaling (v5.9.0)

### Data & Storage
- `sqflite`: SQLite database (v2.3.2)
- `hive`: NoSQL storage (v2.2.3)
- `flutter_secure_storage`: Encrypted storage (v10.0.0-beta.4)
- `shared_preferences`: Key-value storage (v2.2.2)

### UI & Experience
- `flutter_local_notifications`: Notification system (v19.1.0)
- `google_mobile_ads`: Monetization (v4.0.0)
- `timezone`: Timezone handling (v0.10.1)
- `image_picker`: Media integration (v1.0.7)
- `fl_chart`: Chart widgets (v0.70.2)
- `table_calendar`: Calendar components (v3.0.9)

### Utilities
- `intl`: Internationalization (v0.19.0)
- `url_launcher`: External links (v6.2.5)
- `share_plus`: Content sharing (v10.1.4)
- `connectivity_plus`: Network monitoring (v6.1.3)
- `permission_handler`: System permissions (v11.3.1)
- `app_tracking_transparency`: iOS tracking consent (v2.0.6+1)

## Transit Engine

The core system powering real-time planetary transit tracking and cosmic weather forecasting.

### Key Components
- **Services**: TransitCalculationService, TransitActionService, TransitNotificationService, TransitStorytellingService, TransitThemeService
- **Models**: TransitAction, TransitAlert, TransitStory, LifeTheme, AlertTypes, NotificationPreferences
- **UI**: TransitProvider, CosmicWeatherDashboard, TransitCalendar, ActionCards, DayPlannerDashboard, WeatherImpactMeter

### Features
- **Astronomical Accuracy**: J2000.0 epoch calculations with standardized orb tolerances
- **Smart Notifications**: Anti-spam protection with optimal timing and release build compatibility
- **Personalization**: 5 cosmic archetypes with cultural adaptation
- **Performance**: 3-hour synchronized caching with lazy loading

## Notification System

### Production-Ready Configuration
- **Android**: Release build optimized with proper receivers and timing compensation
- **iOS**: Background modes configured for reliable delivery
- **Dependencies**: flutter_local_notifications v19.1.0+, timezone v0.10.1+
- **Permissions**: Battery optimization exemption for Android, proper iOS permission flow

### Key Features
- **Smart Daily Limiting**: Maximum 5 notifications per day with priority-based scheduling
- **Release Build Support**: 45-second timing compensation for Android release builds
- **Battery Optimization**: Automatic exemption request for reliable Android delivery
- **Background Processing**: iOS fetch mode enabled for background notifications
- **Error Handling**: Comprehensive fallbacks and initialization retry logic
- **Analytics**: Delivery tracking and success rate monitoring
- **Anti-Spam Protection**: Intelligent batching prevents notification overload

### Daily Notification Management
- **Maximum Daily Limit**: 5 notifications per day (configurable)
- **Priority Order**: Horoscope → Journal → Tarot → Daily Weather → Astro Match/Chat
- **Smart Scheduling**: Single notifications for Astro Match and Chat (reduced from 2 each)
- **Proactive Transit Alerts**: Limited to 3 per day to reserve slots for core notifications
- **Configurable Timing**: Individual time settings for each notification type

### Testing Commands
- **Clean Rebuild**: `flutter clean && flutter pub get && flutter build apk --release`
- **Test Notifications**: Use NotificationService.testNotificationSystem()
- **Debug Pending**: Use NotificationService.printPendingNotifications()
- **Force Reschedule**: Use TransitNotificationService.forceRescheduleDailyNotifications() to test new limits

### Common Issues & Solutions
- **Too Many Notifications**: System now limits to 5 per day automatically with priority scheduling
- **Debug works, Release doesn't**: Check Android receiver configuration and timing compensation
- **iOS Background Issues**: Ensure "fetch" background mode is enabled in Info.plist
- **Battery Optimization**: App must request exemption for reliable Android notifications
- **Permission Timing**: iOS requires proper permission flow with delays between requests
- **Notification Overload**: Use forceRescheduleDailyNotifications() to reset and apply new limits