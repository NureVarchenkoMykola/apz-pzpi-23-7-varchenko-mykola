const LANGUAGE_KEY = "energy_monitor_language";

const dictionaries = {
    uk: {
        appName: "Energy Monitor",
        appSubtitle: "Контроль споживання електроенергії",
        featureTariffsTitle: "Тарифи",
        featureTariffsText: "Активна ціна за кВт·год для розрахунків.",
        featureAppliancesTitle: "Прилади",
        featureAppliancesText: "Облік пристроїв та їх орієнтовної потужності.",
        featureLimitsTitle: "Ліміти",
        featureLimitsText: "Пороги, попередження та контроль перевищень.",
        featureReportsTitle: "Звіти",
        featureReportsText: "Аналітика за днями, приладами та періодами.",

        language: "Мова",
        uk: "Українська",
        en: "English",

        loginTitle: "Вхід у систему",
        registerTitle: "Реєстрація",
        email: "Email",
        password: "Пароль",
        login: "Увійти",
        register: "Зареєструватися",
        noAccount: "Немає акаунта? Зареєструватися",
        hasAccount: "Вже є акаунт? Увійти",

        requiredEmail: "Email не може бути порожнім",
        invalidEmail: "Некоректний формат email",
        requiredPassword: "Пароль не може бути порожнім",
        shortPassword: "Пароль має містити не менше 6 символів",
        fixErrors: "Виправте помилки у формі",
        loginSuccess: "Вхід виконано успішно",
        registerSuccess: "Реєстрація успішна. Тепер увійдіть у систему.",
        connectionError: "Помилка з'єднання із сервером",

        userCabinet: "Кабінет користувача",
        personalCabinet: "Особистий кабінет",
        overview: "Огляд",
        tariffs: "Тарифи",
        appliances: "Прилади",
        consumption: "Споживання",
        limits: "Ліміти",
        reports: "Звіти",
        refresh: "Оновити",
        logout: "Вийти",

        currentMonth: "Поточний місяць",
        overviewTitle: "Огляд енергоспоживання",
        overviewDescription: "Тут відображається зведення за тарифами, приладами, споживанням і лімітами.",
        records: "Записи",
        summaryForMonth: "Звіт за місяць",
        alerts: "Оповіщення",
        loadingData: "Дані завантажуються...",
        noData: "Дані відсутні.",
        noLimits: "Ліміти ще не створені.",
        noActiveAlerts: "Активних попереджень немає.",
        limitExceeded: "Ліміт перевищено",
        thresholdReached: "Досягнуто поріг",
        period: "Період",
        cost: "Вартість",
        totalConsumption: "Споживання",
        kwh: "кВт·год",
        currency: "грн",
        dataUpdated: "Дані оновлено",
        overviewLoadError: "Помилка завантаження огляду",

        yes: "так",
        no: "ні",
        withoutEnd: "без кінця",
        withoutAppliance: "без приладу",
        actions: "Дії",
        edit: "Редагувати",
        delete: "Видалити",
        activate: "Активувати",
        save: "Зберегти",
        clear: "Очистити",
        create: "Створити",
        cancel: "Скасувати",

        statusOk: "у межах норми",
        statusThreshold: "досягнуто поріг попередження",
        statusExceeded: "ліміт перевищено",
        enabled: "увімкнені",
        disabled: "вимкнені",

        tariffNew: "Новий тариф",
        tariffEdit: "Редагування тарифу",
        tariffAdd: "Додати тариф",
        tariffSave: "Зберегти тариф",
        tariffList: "Список тарифів",
        tariffName: "Назва тарифу",
        tariffPrice: "Ціна за кВт·год",
        validFrom: "Діє з",
        validTo: "Діє до",
        makeActive: "Зробити активним",
        active: "Активний",
        price: "Ціна",
        tariffCreated: "Тариф створено",
        tariffUpdated: "Тариф оновлено",
        tariffDeleted: "Тариф видалено",
        tariffActivated: "Тариф активовано",
        tariffsEmpty: "Тарифи ще не створені.",
        deleteTariffConfirm: "Видалити тариф",
        tariffNameRequired: "Назва тарифу не може бути порожньою",
        priceRequired: "Ціна не може бути порожньою",
        priceInvalid: "Ціна має бути числом більше 0",
        dateFromRequired: "Дата початку не може бути порожньою",
        dateInvalid: "Дата має бути у форматі YYYY-MM-DD",
        dateToBeforeFrom: "Дата завершення не може бути раніше дати початку",
        tariffFormError: "Виправте помилки у формі тарифу",
        tariffLoadError: "Помилка завантаження тарифів",
        tariffSaveError: "Помилка збереження тарифу",
        tariffDeleteError: "Помилка видалення тарифу",
        tariffActivateError: "Помилка активації тарифу",

        applianceNew: "Новий прилад",
        applianceEdit: "Редагування приладу",
        applianceAdd: "Додати прилад",
        applianceSave: "Зберегти прилад",
        applianceList: "Список приладів",
        applianceName: "Назва приладу",
        description: "Опис",
        estimatedPower: "Орієнтовна потужність, кВт",
        createdAt: "Дата створення",
        appliancesEmpty: "Прилади ще не створені.",
        applianceCreated: "Прилад створено",
        applianceUpdated: "Прилад оновлено",
        applianceDeleted: "Прилад видалено",
        deleteApplianceConfirm: "Видалити прилад",
        applianceNameRequired: "Назва приладу не може бути порожньою",
        powerInvalid: "Потужність має бути числом більше 0",
        applianceFormError: "Виправте помилки у формі приладу",
        applianceLoadError: "Помилка завантаження приладів",
        applianceSaveError: "Помилка збереження приладу",
        applianceDeleteError: "Помилка видалення приладу",
        kw: "кВт",

        consumptionNew: "Новий запис",
        consumptionEdit: "Редагування запису",
        consumptionAdd: "Додати запис",
        consumptionSave: "Зберегти запис",
        consumptionHistory: "Історія споживання",
        calculationMode: "Спосіб розрахунку",
        manualKwh: "Вручну, кВт·год",
        byApplianceHours: "За часом роботи приладу",
        recordDate: "Дата запису",
        consumptionKwh: "Споживання, кВт·год",
        usageHours: "Час роботи, год",
        notes: "Нотатки",
        appliance: "Прилад",
        tariff: "Тариф",
        updatedAt: "Оновлено",
        consumptionEmpty: "Записи споживання ще не створені.",
        consumptionCreated: "Запис створено",
        consumptionUpdated: "Запис оновлено",
        consumptionDeleted: "Запис видалено",
        deleteConsumptionConfirm: "Видалити запис за",
        dateRequired: "Дата не може бути порожньою",
        kwhRequired: "Споживання не може бути порожнім",
        kwhInvalid: "Споживання має бути числом більше 0",
        hoursRequired: "Час роботи не може бути порожнім",
        hoursInvalid: "Час роботи має бути числом більше 0",
        applianceRequiredForHours: "Для розрахунку за часом потрібно вибрати прилад",
        appliancePowerRequired: "У вибраного приладу не задана потужність",
        consumptionFormError: "Виправте помилки у формі споживання",
        consumptionLoadError: "Помилка завантаження споживання",
        consumptionSaveError: "Помилка збереження запису",
        consumptionDeleteError: "Помилка видалення запису",

        limitNew: "Новий ліміт",
        limitEdit: "Редагування ліміту",
        limitAdd: "Додати ліміт",
        limitSave: "Зберегти ліміт",
        limitState: "Стан лімітів",
        limitKwh: "Ліміт, кВт·год",
        periodType: "Тип періоду",
        week: "Тиждень",
        month: "Місяць",
        year: "Рік",
        customPeriod: "Власний період",
        periodStart: "Початок періоду",
        periodEnd: "Кінець періоду",
        periodEndAutoHint: "Для тижня, місяця та року кінець періоду розраховується сервером автоматично.",
        alertThreshold: "Поріг попередження, %",
        showOnHome: "Показувати попередження на головній",
        progress: "Прогрес",
        threshold: "Поріг",
        status: "Статус",
        notifications: "Сповіщення",
        used: "Використано",
        limitsEmpty: "Ліміти ще не створені.",
        limitProgressNotLoaded: "прогрес не завантажено",
        limitCreated: "Ліміт створено",
        limitUpdated: "Ліміт оновлено",
        limitDeleted: "Ліміт видалено",
        deleteLimitConfirm: "Видалити ліміт",
        limitRequired: "Ліміт не може бути порожнім",
        limitInvalid: "Ліміт має бути числом більше 0",
        periodStartRequired: "Початок періоду не може бути порожнім",
        periodEndRequired: "Кінець періоду не може бути порожнім для custom",
        periodEndBeforeStart: "Кінець періоду не може бути раніше початку",
        thresholdRequired: "Поріг не може бути порожнім",
        thresholdInvalid: "Поріг має бути цілим числом від 1 до 100",
        limitFormError: "Виправте помилки у формі ліміту",
        limitLoadError: "Помилка завантаження лімітів",
        limitSaveError: "Помилка збереження ліміту",
        limitDeleteError: "Помилка видалення ліміту",

        reportPeriod: "Період звіту",
        dateFrom: "Дата початку",
        dateTo: "Дата завершення",
        generateReports: "Сформувати звіти",
        loading: "Завантаження...",
        summary: "Зведення",
        dailyReport: "Щоденний звіт",
        reportByAppliances: "Звіт за приладами",
        reportByLimits: "Звіт за лімітами",
        summaryReportNotLoaded: "Зведений звіт не завантажено.",
        dailyReportEmpty: "Щоденний звіт порожній.",
        applianceReportEmpty: "Звіт за приладами порожній.",
        limitsReportNotLoaded: "Звіт за лімітами не завантажено.",
        limitsReportEmpty: "Ліміти за вибраними фільтрами відсутні.",
        days: "днів",
        averagePerDay: "Середнє за день",
        averageCostPerDay: "Середня вартість за день",
        averageKwhPerRecord: "Середнє споживання на запис",
        averageCostPerRecord: "Середня вартість на запис",
        maxDay: "Максимальний день",
        totalLimit: "Загальний ліміт",
        totalUsed: "Загальне використання",
        remaining: "Залишок",
        reportUpdated: "Звіти оновлено",
        reportPeriodError: "Виправте період звіту",
        reportLoadError: "Помилка завантаження звітів",

        adminPanel: "Панель адміністратора",
        adminDashboard: "Адміністрування системи",
        adminOverview: "Огляд",
        adminUsers: "Користувачі",
        adminAudit: "Журнал аудиту",
        adminData: "Дані системи",
        adminDescription: "Керування користувачами, аудитом та адміністративними даними системи.",
        accountsTotal: "Усього акаунтів",
        accountsBlocked: "Заблоковані акаунти",
        usersTotal: "Користувачі",
        usersBlocked: "Заблоковані користувачі",
        adminsTotal: "Адміністратори",
        adminsBlocked: "Заблоковані адміністратори",
        adminStatsLoadError: "Помилка завантаження статистики",
        adminStatsUpdated: "Статистику оновлено",
        role: "Роль",
        blocked: "Заблокований",
        notBlocked: "Активний",
        user: "Користувач",
        admin: "Адміністратор",
        search: "Пошук",
        allRoles: "Усі ролі",
        allStatuses: "Усі статуси",
        filter: "Фільтрувати",
        changeRole: "Змінити роль",
        block: "Заблокувати",
        unblock: "Розблокувати",
        adminUsersLoadError: "Помилка завантаження користувачів",
        adminUserUpdated: "Користувача оновлено",
        adminUserUpdateError: "Помилка оновлення користувача",
        adminAuditLoadError: "Помилка завантаження журналу аудиту",
        auditAction: "Дія",
        auditAdmin: "Адміністратор",
        auditTarget: "Цільовий користувач",
        auditDetails: "Деталі",
        auditCreatedAt: "Дата створення",
        noAuditLogs: "Записи аудиту відсутні.",
        noUsersFound: "Користувачів не знайдено.",
        systemDataDescription: "У цьому розділі буде розміщено експорт, імпорт і резервне копіювання даних системи.",

        id: "ID",
        emailAddress: "Email",
        createdAtShort: "Створено",
        currentRole: "Поточна роль",
        newRole: "Нова роль",
        statusFilter: "Статус",
        showAll: "Показати всі",
        onlyBlocked: "Тільки заблоковані",
        onlyActive: "Тільки активні",
        applyFilters: "Застосувати",
        resetFilters: "Скинути",
        makeUser: "Зробити користувачем",
        makeAdmin: "Зробити адміністратором",
        roleChanged: "Роль змінено",
        userBlocked: "Користувача заблоковано",
        userUnblocked: "Користувача розблоковано",
        confirmBlockUser: "Заблокувати користувача",
        confirmUnblockUser: "Розблокувати користувача",
        confirmRoleChange: "Змінити роль користувача",
        auditLog: "Журнал аудиту",
        adminId: "ID адміністратора",
        targetUser: "Цільовий користувач",
        details: "Деталі",
        loadMore: "Завантажити ще",
        adminUsersUpdated: "Список користувачів оновлено",
        adminAuditUpdated: "Журнал аудиту оновлено",
        unknown: "невідомо",

        systemSettings: "Налаштування системи",
        siteName: "Назва сайту",
        defaultLanguage: "Мова за замовчуванням",
        defaultCurrency: "Валюта за замовчуванням",
        allowRegistration: "Дозволити реєстрацію",
        backupRetentionDays: "Зберігати резервні копії, днів",
        saveSettings: "Зберегти налаштування",
        settingsSaved: "Налаштування збережено",
        settingsLoadError: "Помилка завантаження налаштувань",
        settingsSaveError: "Помилка збереження налаштувань",

        dataExport: "Експорт даних",
        dataExportDescription: "Експорт створює JSON-файл з налаштуваннями та даними системи.",
        exportJson: "Експортувати JSON",
        exportCompleted: "Експорт виконано",

        dataImport: "Імпорт даних",
        dataImportDescription: "Імпорт приймає JSON-файл, який був створений через експорт або резервну копію.",
        importMode: "Режим імпорту",
        mergeMode: "Об'єднати з поточними даними",
        replaceMode: "Замінити поточні дані",
        selectJsonFile: "Виберіть JSON-файл",
        importJson: "Імпортувати JSON",
        importCompleted: "Імпорт виконано",
        importWarning: "Режим заміни видаляє поточні дані перед імпортом. Використовуйте обережно.",
        importFileRequired: "Потрібно вибрати JSON-файл",
        importLoadError: "Помилка читання файлу імпорту",
        importError: "Помилка імпорту даних",

        backups: "Резервні копії",
        createBackup: "Створити резервну копію",
        backupCreated: "Резервну копію створено",
        backupListEmpty: "Резервні копії ще не створені.",
        backupLoadError: "Помилка завантаження резервних копій",
        backupCreateError: "Помилка створення резервної копії",
        download: "Завантажити",
        fileName: "Файл",
        fileSize: "Розмір",
        created: "Створено",
        bytes: "байт"
    },

    en: {
        appName: "Energy Monitor",
        appSubtitle: "Electricity consumption control",
        featureTariffsTitle: "Tariffs",
        featureTariffsText: "Active price per kWh for calculations.",
        featureAppliancesTitle: "Appliances",
        featureAppliancesText: "Track devices and their estimated power.",
        featureLimitsTitle: "Limits",
        featureLimitsText: "Thresholds, alerts and overuse control.",
        featureReportsTitle: "Reports",
        featureReportsText: "Analytics by days, appliances and periods.",

        language: "Language",
        uk: "Українська",
        en: "English",

        loginTitle: "Sign in",
        registerTitle: "Registration",
        email: "Email",
        password: "Password",
        login: "Sign in",
        register: "Register",
        noAccount: "No account? Register",
        hasAccount: "Already have an account? Sign in",

        requiredEmail: "Email is required",
        invalidEmail: "Invalid email format",
        requiredPassword: "Password is required",
        shortPassword: "Password must contain at least 6 characters",
        fixErrors: "Fix form errors",
        loginSuccess: "Login successful",
        registerSuccess: "Registration successful. Now sign in.",
        connectionError: "Server connection error",

        userCabinet: "User dashboard",
        personalCabinet: "Personal dashboard",
        overview: "Overview",
        tariffs: "Tariffs",
        appliances: "Appliances",
        consumption: "Consumption",
        limits: "Limits",
        reports: "Reports",
        refresh: "Refresh",
        logout: "Logout",

        currentMonth: "Current month",
        overviewTitle: "Energy consumption overview",
        overviewDescription: "This section shows a summary of tariffs, appliances, consumption records and limits.",
        records: "Records",
        summaryForMonth: "Monthly report",
        alerts: "Alerts",
        loadingData: "Loading data...",
        noData: "No data available.",
        noLimits: "No limits have been created yet.",
        noActiveAlerts: "There are no active alerts.",
        limitExceeded: "Limit exceeded",
        thresholdReached: "Threshold reached",
        period: "Period",
        cost: "Cost",
        totalConsumption: "Consumption",
        kwh: "kWh",
        currency: "UAH",
        dataUpdated: "Data updated",
        overviewLoadError: "Failed to load overview",

        yes: "yes",
        no: "no",
        withoutEnd: "without end",
        withoutAppliance: "without appliance",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        activate: "Activate",
        save: "Save",
        clear: "Clear",
        create: "Create",
        cancel: "Cancel",

        statusOk: "within limit",
        statusThreshold: "warning threshold reached",
        statusExceeded: "limit exceeded",
        enabled: "enabled",
        disabled: "disabled",

        tariffNew: "New tariff",
        tariffEdit: "Edit tariff",
        tariffAdd: "Add tariff",
        tariffSave: "Save tariff",
        tariffList: "Tariff list",
        tariffName: "Tariff name",
        tariffPrice: "Price per kWh",
        validFrom: "Valid from",
        validTo: "Valid to",
        makeActive: "Make active",
        active: "Active",
        price: "Price",
        tariffCreated: "Tariff created",
        tariffUpdated: "Tariff updated",
        tariffDeleted: "Tariff deleted",
        tariffActivated: "Tariff activated",
        tariffsEmpty: "No tariffs have been created yet.",
        deleteTariffConfirm: "Delete tariff",
        tariffNameRequired: "Tariff name is required",
        priceRequired: "Price is required",
        priceInvalid: "Price must be a number greater than 0",
        dateFromRequired: "Start date is required",
        dateInvalid: "Date must use YYYY-MM-DD format",
        dateToBeforeFrom: "End date cannot be earlier than start date",
        tariffFormError: "Fix tariff form errors",
        tariffLoadError: "Failed to load tariffs",
        tariffSaveError: "Failed to save tariff",
        tariffDeleteError: "Failed to delete tariff",
        tariffActivateError: "Failed to activate tariff",

        applianceNew: "New appliance",
        applianceEdit: "Edit appliance",
        applianceAdd: "Add appliance",
        applianceSave: "Save appliance",
        applianceList: "Appliance list",
        applianceName: "Appliance name",
        description: "Description",
        estimatedPower: "Estimated power, kW",
        createdAt: "Created at",
        appliancesEmpty: "No appliances have been created yet.",
        applianceCreated: "Appliance created",
        applianceUpdated: "Appliance updated",
        applianceDeleted: "Appliance deleted",
        deleteApplianceConfirm: "Delete appliance",
        applianceNameRequired: "Appliance name is required",
        powerInvalid: "Power must be a number greater than 0",
        applianceFormError: "Fix appliance form errors",
        applianceLoadError: "Failed to load appliances",
        applianceSaveError: "Failed to save appliance",
        applianceDeleteError: "Failed to delete appliance",
        kw: "kW",

        consumptionNew: "New record",
        consumptionEdit: "Edit record",
        consumptionAdd: "Add record",
        consumptionSave: "Save record",
        consumptionHistory: "Consumption history",
        calculationMode: "Calculation mode",
        manualKwh: "Manual, kWh",
        byApplianceHours: "By appliance operating time",
        recordDate: "Record date",
        consumptionKwh: "Consumption, kWh",
        usageHours: "Operating time, hours",
        notes: "Notes",
        appliance: "Appliance",
        tariff: "Tariff",
        updatedAt: "Updated at",
        consumptionEmpty: "No consumption records have been created yet.",
        consumptionCreated: "Record created",
        consumptionUpdated: "Record updated",
        consumptionDeleted: "Record deleted",
        deleteConsumptionConfirm: "Delete record for",
        dateRequired: "Date is required",
        kwhRequired: "Consumption is required",
        kwhInvalid: "Consumption must be a number greater than 0",
        hoursRequired: "Operating time is required",
        hoursInvalid: "Operating time must be a number greater than 0",
        applianceRequiredForHours: "Select an appliance to calculate by operating time",
        appliancePowerRequired: "Selected appliance does not have estimated power",
        consumptionFormError: "Fix consumption form errors",
        consumptionLoadError: "Failed to load consumption records",
        consumptionSaveError: "Failed to save record",
        consumptionDeleteError: "Failed to delete record",

        limitNew: "New limit",
        limitEdit: "Edit limit",
        limitAdd: "Add limit",
        limitSave: "Save limit",
        limitState: "Limit state",
        limitKwh: "Limit, kWh",
        periodType: "Period type",
        week: "Week",
        month: "Month",
        year: "Year",
        customPeriod: "Custom period",
        periodStart: "Period start",
        periodEnd: "Period end",
        periodEndAutoHint: "For week, month and year, the period end is calculated by the server automatically.",
        alertThreshold: "Warning threshold, %",
        showOnHome: "Show warning on home page",
        progress: "Progress",
        threshold: "Threshold",
        status: "Status",
        notifications: "Notifications",
        used: "Used",
        limitsEmpty: "No limits have been created yet.",
        limitProgressNotLoaded: "progress not loaded",
        limitCreated: "Limit created",
        limitUpdated: "Limit updated",
        limitDeleted: "Limit deleted",
        deleteLimitConfirm: "Delete limit",
        limitRequired: "Limit is required",
        limitInvalid: "Limit must be a number greater than 0",
        periodStartRequired: "Period start is required",
        periodEndRequired: "Period end is required for custom",
        periodEndBeforeStart: "Period end cannot be earlier than start",
        thresholdRequired: "Threshold is required",
        thresholdInvalid: "Threshold must be an integer from 1 to 100",
        limitFormError: "Fix limit form errors",
        limitLoadError: "Failed to load limits",
        limitSaveError: "Failed to save limit",
        limitDeleteError: "Failed to delete limit",

        reportPeriod: "Report period",
        dateFrom: "Start date",
        dateTo: "End date",
        generateReports: "Generate reports",
        loading: "Loading...",
        summary: "Summary",
        dailyReport: "Daily report",
        reportByAppliances: "Report by appliances",
        reportByLimits: "Report by limits",
        summaryReportNotLoaded: "Summary report has not been loaded.",
        dailyReportEmpty: "Daily report is empty.",
        applianceReportEmpty: "Appliance report is empty.",
        limitsReportNotLoaded: "Limits report has not been loaded.",
        limitsReportEmpty: "No limits match the selected filters.",
        days: "days",
        averagePerDay: "Average per day",
        averageCostPerDay: "Average cost per day",
        averageKwhPerRecord: "Average consumption per record",
        averageCostPerRecord: "Average cost per record",
        maxDay: "Maximum day",
        totalLimit: "Total limit",
        totalUsed: "Total used",
        remaining: "Remaining",
        reportUpdated: "Reports updated",
        reportPeriodError: "Fix report period",
        reportLoadError: "Failed to load reports",

        adminPanel: "Admin panel",
        adminDashboard: "System administration",
        adminOverview: "Overview",
        adminUsers: "Users",
        adminAudit: "Audit log",
        adminData: "System data",
        adminDescription: "Manage users, audit logs and administrative system data.",
        accountsTotal: "Total accounts",
        accountsBlocked: "Blocked accounts",
        usersTotal: "Users",
        usersBlocked: "Blocked users",
        adminsTotal: "Administrators",
        adminsBlocked: "Blocked administrators",
        adminStatsLoadError: "Failed to load statistics",
        adminStatsUpdated: "Statistics updated",
        role: "Role",
        blocked: "Blocked",
        notBlocked: "Active",
        user: "User",
        admin: "Administrator",
        search: "Search",
        allRoles: "All roles",
        allStatuses: "All statuses",
        filter: "Filter",
        changeRole: "Change role",
        block: "Block",
        unblock: "Unblock",
        adminUsersLoadError: "Failed to load users",
        adminUserUpdated: "User updated",
        adminUserUpdateError: "Failed to update user",
        adminAuditLoadError: "Failed to load audit log",
        auditAction: "Action",
        auditAdmin: "Administrator",
        auditTarget: "Target user",
        auditDetails: "Details",
        auditCreatedAt: "Created at",
        noAuditLogs: "No audit logs found.",
        noUsersFound: "No users found.",
        systemDataDescription: "This section will contain export, import and backup of system data.",

        id: "ID",
        emailAddress: "Email",
        createdAtShort: "Created",
        currentRole: "Current role",
        newRole: "New role",
        statusFilter: "Status",
        showAll: "Show all",
        onlyBlocked: "Only blocked",
        onlyActive: "Only active",
        applyFilters: "Apply",
        resetFilters: "Reset",
        makeUser: "Make user",
        makeAdmin: "Make administrator",
        roleChanged: "Role changed",
        userBlocked: "User blocked",
        userUnblocked: "User unblocked",
        confirmBlockUser: "Block user",
        confirmUnblockUser: "Unblock user",
        confirmRoleChange: "Change user role",
        auditLog: "Audit log",
        adminId: "Administrator ID",
        targetUser: "Target user",
        details: "Details",
        loadMore: "Load more",
        adminUsersUpdated: "User list updated",
        adminAuditUpdated: "Audit log updated",
        unknown: "unknown",

        systemSettings: "System settings",
        siteName: "Site name",
        defaultLanguage: "Default language",
        defaultCurrency: "Default currency",
        allowRegistration: "Allow registration",
        backupRetentionDays: "Backup retention, days",
        saveSettings: "Save settings",
        settingsSaved: "Settings saved",
        settingsLoadError: "Failed to load settings",
        settingsSaveError: "Failed to save settings",

        dataExport: "Data export",
        dataExportDescription: "Export creates a JSON file with system settings and data.",
        exportJson: "Export JSON",
        exportCompleted: "Export completed",

        dataImport: "Data import",
        dataImportDescription: "Import accepts a JSON file created by export or backup.",
        importMode: "Import mode",
        mergeMode: "Merge with current data",
        replaceMode: "Replace current data",
        selectJsonFile: "Select JSON file",
        importJson: "Import JSON",
        importCompleted: "Import completed",
        importWarning: "Replace mode deletes current data before import. Use carefully.",
        importFileRequired: "Select a JSON file",
        importLoadError: "Failed to read import file",
        importError: "Failed to import data",

        backups: "Backups",
        createBackup: "Create backup",
        backupCreated: "Backup created",
        backupListEmpty: "No backups have been created yet.",
        backupLoadError: "Failed to load backups",
        backupCreateError: "Failed to create backup",
        download: "Download",
        fileName: "File",
        fileSize: "Size",
        created: "Created",
        bytes: "bytes"
    }
};

export function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || "uk";
}

export function setLanguage(language) {
    const nextLanguage = dictionaries[language] ? language : "uk";
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = getDirection(nextLanguage);
}

export function getDirection(language = getLanguage()) {
    if (language === "ar" || language === "he" || language === "fa") {
        return "rtl";
    }

    return "ltr";
}

export function getLocale() {
    return getLanguage() === "en" ? "en-US" : "uk-UA";
}

export function t(key) {
    const language = getLanguage();
    return dictionaries[language]?.[key] || dictionaries.uk[key] || key;
}

export function applyTranslations(root = document) {
    document.documentElement.lang = getLanguage();
    document.documentElement.dir = getDirection();

    root.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    root.querySelectorAll("[data-i18n-title]").forEach((element) => {
        element.title = t(element.dataset.i18nTitle);
    });

    applyInputDirection(root);
}

export function applyInputDirection(root = document) {
    root.querySelectorAll("input[type='text'], input[type='search'], textarea").forEach((element) => {
        element.setAttribute("dir", "auto");
    });

    root.querySelectorAll("input[type='email'], input[type='password'], input[type='date'], input[type='number']").forEach((element) => {
        element.setAttribute("dir", "ltr");
    });
}

function parseDateValue(value) {
    if (!value) {
        return null;
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

export function formatDate(value) {
    const date = parseDateValue(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(getLocale(), {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

export function formatDateTime(value) {
    const date = parseDateValue(value);

    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat(getLocale(), {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

export function formatNumber(value, options = {}) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return new Intl.NumberFormat(getLocale(), options).format(number);
}

export function compareText(a, b) {
    return String(a || "").localeCompare(String(b || ""), getLocale(), {
        sensitivity: "base"
    });
}