export type Language = 'es' | 'en';

export interface Translations {
  // Common
  common: {
    loading: string;
    saving: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    done: string;
    skip: string;
    next: string;
    previous: string;
    close: string;
      total: string;
      current: string;
      step: string;
      of: string;
      remaining: string;
    };
  
  // Navigation
  nav: {
    overview: string;
    buckets: string;
    savings: string;
    insights: string;
    settings: string;
    profile: string;
  };

  // Overview Page
  overview: {
    title: string;
    currentMonthExpenses: string;
    bills: string;
    planned: string;
    recurringPayments: string;
    fromPreviousPeriod: string;
    unpaidFromPreviousPeriod: string;
    noPaymentsFromPreviousPeriod: string;
    bucketPaymentsEmptyHint: string;
    addExpense: string;
    expense: string;
    amount: string;
    category: string;
    spendingByCategory: string;
    noExpensesYet: string;
    summary: string;
    expensesByBucket: string;
    paidBills: string;
    totalExpenses: string;
    moneyLeft: string;
    availableForSavings: string;
    monthlySalary: string;
    noSalarySet: string;
    setSalaryDescription: string;
    setSalary: string;
    left: string;
    over: string;
    percentUsed: string;
    suggestedSavings: string;
    noSavingsGoalsYet: string;
    addSavingsGoalDescription: string;
    addGoal: string;
    previousGoal: string;
    nextGoal: string;
    complete: string;
    completeWithCheck: string;
    viewAllGoals: string;
  };

  // Settings Page
    settings: {
      title: string;
      subtitle: string;
      periodConfiguration: string;
      periodStartDay: string;
      periodStartDayDescription: string;
      dayOfMonth: string;
      currentSetting: string;
      yourPeriodsRun: string;
      saveSettings: string;
      resetToDefault: string;
      settingsSaved: string;
      settingsReset: string;
      failedToSave: string;
      expenseCategories: string;
      manageCategories: string;
      addCustomCategory: string;
      categoryName: string;
      allCategories: string;
      default: string;
      noCategoriesFound: string;
      aboutPeriods: string;
      whyCustomPeriods: string;
      whyCustomPeriodsDescription: string;
      example: string;
      periodExample: string;
      note: string;
      periodNote: string;
      selectLanguage: string;
      periodStartDayValidation: string;
      deleteCategoryConfirm: string;
      toDay: string;
      ofNextMonth: string;
      categoryColor: string;
      dataMaintenance: string;
      cleanupBucketPaymentsDescription: string;
      runCleanup: string;
      cleanupSuccess: string;
      cleanupNoDuplicates: string;
    };

  // Buckets Page
  buckets: {
    title: string;
    subtitle: string;
    bucketManagement: string;
    configureBuckets: string;
    noBucketsConfigured: string;
    addFirstBucket: string;
    bucketName: string;
    bucketType: string;
    cash: string;
    creditCard: string;
    paymentDay: string;
    reorderBuckets: string;
    dragAndDrop: string;
    useArrows: string;
    yourBuckets: string;
    addBucket: string;
    addNewBucket: string;
    type: string;
    paymentDayLabel: string;
    dayPlaceholder: string;
    bucketNamePlaceholder: string;
    paymentDayText: string;
    cannotDeleteBucket: string;
  };

  // Profile Page
  profile: {
    title: string;
    accountInformation: string;
    name: string;
    email: string;
    notAvailable: string;
    security: string;
    loginMethod: string;
    password: string;
    changePassword: string;
    preferences: string;
    appearance: string;
    language: string;
    change: string;
    dangerZone: string;
    signOut: string;
    signOutDescription: string;
    deleteAccount: string;
    deleteAccountDescription: string;
    areYouSure: string;
  };

  // Insights Page
  insights: {
    title: string;
    spendingByCategory: string;
    categoryBreakdown: string;
    ofTotal: string;
    noExpensesYet: string;
    noExpensesForPeriod: string;
    addExpensesToSeeInsights: string;
    loadingSpendingData: string;
    failedToFetchData: string;
    totalSpending: string;
  };

  // Savings Page
  savings: {
    addNewGoal: string;
    goalName: string;
    goalNamePlaceholder: string;
    targetAmount: string;
    amountPlaceholder: string;
    monthlyTarget: string;
    loadingGoals: string;
    noGoalsYet: string;
    target: string;
    monthly: string;
    add: string;
    amountToAdd: string;
    totalSaved: string;
    progress: string;
    remaining: string;
  };

  // Onboarding
  onboarding: {
    welcome: string;
    step1Title: string;
    step1Description: string;
    whatIsPeriodStartDay: string;
    whatIsPeriodStartDayDescription: string;
    examples: string;
    periodExamples: string;
    goToSettings: string;
    step2Title: string;
    step2Description: string;
    whatAreBuckets: string;
    whatAreBucketsDescription: string;
    creditCardSetup: string;
    creditCardSetupDescription: string;
    goToBuckets: string;
    getStarted: string;
    skipTutorial: string;
  };

  // Login Page
  login: {
    welcome: string;
    signInWithGoogle: string;
    forNowSignInWithGoogle: string;
    needAccess: string;
    contactOwner: string;
    loading: string;
    redirecting: string;
  };

  // Common Actions
  actions: {
    addFixedPayment: string;
    updateFixedPayment: string;
    deleteFixedPayment: string;
    markAsPaid: string;
    markAsUnpaid: string;
    addExpense: string;
    updateExpense: string;
    deleteExpense: string;
    addBucket: string;
    updateBucket: string;
    deleteBucket: string;
  };

  // Messages
  messages: {
    saved: string;
    deleted: string;
    updated: string;
    error: string;
    unauthorized: string;
    notFound: string;
  };

  // Month Selector
  monthSelector: {
    previousMonth: string;
    nextMonth: string;
    current: string;
    selectMonth: string;
    goToCurrentMonth: string;
    goToCurrentMonthTitle: string;
  };

  // Period Selector
  periodSelector: {
    previousPeriod: string;
    nextPeriod: string;
    current: string;
    goToCurrentPeriod: string;
  };
}

const translations: Record<Language, Translations> = {
  es: {
    common: {
      loading: 'Cargando...',
      saving: 'Guardando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      done: 'Hecho',
      skip: 'Omitir',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      total: 'Total',
      current: 'Actual',
      step: 'Paso',
      of: 'de',
      remaining: 'Restante',
    },
    nav: {
      overview: 'Resumen',
      buckets: 'Bolsillos',
      savings: 'Ahorros',
      insights: 'Análisis',
      settings: 'Configuración',
      profile: 'Perfil',
    },
    overview: {
      title: 'Resumen',
      currentMonthExpenses: 'Gastos del Mes Actual',
      bills: 'Facturas',
      planned: 'Planificadas',
      recurringPayments: 'Pagos Recurrentes',
      fromPreviousPeriod: 'Del Período Anterior',
      unpaidFromPreviousPeriod: 'Sin pagar del período anterior:',
      noPaymentsFromPreviousPeriod: 'No hay pagos del período anterior',
      bucketPaymentsEmptyHint: 'Aparecerán aquí cuando tengas gastos en el período anterior (p. ej. saldo de tarjeta).',
      addExpense: 'Agregar Gasto',
      expense: 'Gasto',
      amount: 'Monto',
      category: 'Categoría',
      spendingByCategory: 'Gastos por Categoría',
      noExpensesYet: 'Aún no hay gastos',
      summary: 'Resumen',
      expensesByBucket: 'Gastos por bolsillo:',
      paidBills: 'Facturas pagadas:',
      totalExpenses: 'Total de gastos:',
      moneyLeft: 'Dinero restante:',
      availableForSavings: 'Disponible para ahorros o próximo período',
      monthlySalary: 'Salario Mensual',
      noSalarySet: 'Aún no has configurado tu salario',
      setSalaryDescription: 'Configura tu salario mensual para hacer seguimiento de tus gastos',
      setSalary: 'Configurar Salario',
      left: 'Restante: ',
      over: 'Excedido: ',
      percentUsed: '% usado',
      suggestedSavings: 'Ahorros Sugeridos',
      noSavingsGoalsYet: 'Aún no hay metas de ahorro',
      addSavingsGoalDescription: 'Agrega una meta de ahorro con un objetivo mensual',
      addGoal: 'Agregar Meta',
      previousGoal: 'Meta anterior',
      nextGoal: 'Siguiente meta',
      complete: 'Completar',
      completeWithCheck: '✓ Completado',
      viewAllGoals: 'Ver todas las metas',
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Configura tus preferencias de seguimiento financiero',
      periodConfiguration: 'Configuración de Período',
      periodStartDay: 'Día de Inicio del Período',
      periodStartDayDescription: 'Establece el día en que comienza tu período financiero. Por ejemplo, si recibes tu pago el día 15, establece esto en 15 para hacer seguimiento del 15 de un mes al 14 del siguiente.',
      dayOfMonth: '(Día del mes: 1-31)',
      currentSetting: 'Configuración actual:',
      yourPeriodsRun: 'Tus períodos van del día',
      saveSettings: 'Guardar Configuración',
      resetToDefault: 'Restablecer al Predeterminado (Día 1)',
      settingsSaved: '¡Configuración guardada exitosamente!',
      settingsReset: 'Configuración restablecida al predeterminado',
      failedToSave: 'Error al guardar la configuración',
      expenseCategories: 'Categorías de Gastos',
      manageCategories: 'Administra tus categorías de gastos. Agrega categorías personalizadas o usa las predeterminadas.',
      addCustomCategory: 'Agregar Categoría Personalizada',
      categoryName: 'Nombre de la categoría',
      allCategories: 'Todas las Categorías',
      default: 'Predeterminada',
      noCategoriesFound: 'No se encontraron categorías. Agrega tu primera categoría arriba.',
      aboutPeriods: 'Acerca de los Períodos',
      whyCustomPeriods: '¿Por qué períodos personalizados?',
      whyCustomPeriodsDescription: 'Muchas personas reciben su pago en un día específico cada mes (como el día 15). Usar períodos personalizados te permite hacer seguimiento de tus finanzas de día de pago a día de pago, lo que a menudo tiene más sentido que los meses calendario.',
      example: 'Ejemplo:',
      periodExample: 'Si estableces el día de inicio del período en 15, tus períodos serán: 15 ene - 14 feb, 2026, 15 feb - 14 mar, 2026, 15 mar - 14 abr, 2026, y así sucesivamente...',
      note: 'Nota:',
      periodNote: 'Cambiar el día de inicio del período afectará cómo se organizan tus datos. Los datos existentes se migrarán automáticamente a la nueva estructura de período.',
      selectLanguage: 'Seleccionar Idioma',
      periodStartDayValidation: 'El día de inicio del período debe estar entre 1 y 31',
      deleteCategoryConfirm: '¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer si la categoría tiene gastos.',
      toDay: 'al día',
      ofNextMonth: 'del mes siguiente',
      categoryColor: 'Color de la categoría',
      dataMaintenance: 'Mantenimiento de datos',
      cleanupBucketPaymentsDescription: 'Si ves totales incorrectos en "Del período anterior" (p. ej. 1.188.000 en vez de 198.000), es posible que haya registros duplicados. Este botón elimina los duplicados y deja un registro por bolsillo por período.',
      runCleanup: 'Eliminar duplicados de pagos por bolsillo',
      cleanupSuccess: 'Se eliminaron {count} registro(s) duplicado(s). Actualiza la página para ver los totales correctos.',
      cleanupNoDuplicates: 'No se encontraron duplicados.',
    },
    buckets: {
      title: 'Gestión de Bolsillos',
      subtitle: 'Configura tus bolsillos de gastos (efectivo o tarjetas de crédito)',
      bucketManagement: 'Gestión de Bolsillos',
      configureBuckets: 'Configura tus bolsillos de gastos (efectivo o tarjetas de crédito)',
      noBucketsConfigured: 'No hay bolsillos configurados. Ve a Bolsillos para agregar tu primer bolsillo.',
      addFirstBucket: 'No hay bolsillos configurados. Agrega tu primer bolsillo para comenzar.',
      bucketName: 'Nombre del Bolsillo',
      bucketType: 'Tipo',
      cash: 'Efectivo',
      creditCard: 'Tarjeta de Crédito',
      paymentDay: 'Día de Pago',
      reorderBuckets: 'Reordenar bolsillos',
      dragAndDrop: 'Arrastra y suelta para reordenar bolsillos',
      useArrows: 'Usa ↑ ↓ para reordenar bolsillos',
      yourBuckets: 'Tus Bolsillos',
      addBucket: 'Agregar Bolsillo',
      addNewBucket: 'Agregar Nuevo Bolsillo',
      type: 'Tipo',
      paymentDayLabel: 'Día de Pago (1-31)',
      dayPlaceholder: 'Día',
      bucketNamePlaceholder: 'ej., Tarjeta Visa',
      paymentDayText: 'Día de pago:',
      cannotDeleteBucket: 'No se puede eliminar el bolsillo con gastos existentes',
    },
    profile: {
      title: 'Perfil',
      accountInformation: 'Información de la Cuenta',
      name: 'Nombre',
      email: 'Correo Electrónico',
      notAvailable: 'No disponible',
      security: 'Seguridad',
      loginMethod: 'Método de Inicio de Sesión',
      password: 'Contraseña',
      changePassword: 'Cambiar Contraseña',
      preferences: 'Preferencias',
      appearance: 'Apariencia',
      language: 'Idioma',
      change: 'Cambiar',
      dangerZone: 'Zona de Peligro',
      signOut: 'Cerrar Sesión',
      signOutDescription: 'Cerrar sesión de tu cuenta',
      deleteAccount: 'Eliminar Cuenta',
      deleteAccountDescription: 'Eliminar permanentemente tu cuenta y todos los datos',
      areYouSure: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
    },
    insights: {
      title: 'Análisis',
      spendingByCategory: 'Gastos por Categoría',
      categoryBreakdown: 'Desglose por Categoría',
      ofTotal: 'del total',
      noExpensesYet: 'Aún no hay gastos',
      noExpensesForPeriod: 'Aún no hay gastos para este período',
      addExpensesToSeeInsights: 'Agrega gastos en el Resumen para ver análisis',
      loadingSpendingData: 'Cargando datos de gastos...',
      failedToFetchData: 'Error al cargar datos de gastos',
      totalSpending: 'Gasto Total:',
    },
    savings: {
      addNewGoal: 'Agregar Nueva Meta',
      goalName: 'Nombre de la meta',
      goalNamePlaceholder: 'ej., Apto, Viaje',
      targetAmount: 'Monto objetivo',
      amountPlaceholder: 'Monto',
      monthlyTarget: 'Objetivo mensual (opcional)',
      loadingGoals: 'Cargando metas de ahorro...',
      noGoalsYet: 'Aún no hay metas de ahorro. Toca "Agregar Nueva Meta" para comenzar.',
      target: 'Objetivo:',
      monthly: 'Mensual:',
      add: 'Agregar',
      amountToAdd: 'Monto a agregar',
      totalSaved: 'Total ahorrado:',
      progress: 'Progreso',
      remaining: 'Restante:',
    },
    onboarding: {
      welcome: '¡Bienvenido a Flowly!',
      step1Title: 'Establece el Día de Inicio del Período',
      step1Description: 'Configura cuándo comienza tu período financiero (día 1-31 del mes). Esto ayuda a organizar tus gastos por período.',
      whatIsPeriodStartDay: '¿Qué es un día de inicio de período?',
      whatIsPeriodStartDayDescription: 'Elige un día entre 1-31 cuando comienza tu período financiero. La mayoría de las personas usan el día 1 (períodos mensuales estándar) o su día de pago (por ejemplo, día 15).',
      examples: 'Ejemplos',
      periodExamples: 'Día 1: Períodos mensuales estándar (1-31 ene, 1-28 feb, etc.)\nDía 15: Períodos personalizados (15 ene - 14 feb, 15 feb - 14 mar, etc.)',
      goToSettings: 'Ir a Configuración para Configurar',
      step2Title: 'Configura tus Bolsillos',
      step2Description: 'Configura tus bolsillos de gastos para que coincidan con tus métodos de pago (efectivo, cuentas bancarias, tarjetas de crédito).',
      whatAreBuckets: '¿Qué son los bolsillos?',
      whatAreBucketsDescription: 'Los bolsillos representan de dónde viene tu dinero o dónde lo gastas. Ejemplos: Efectivo, Cuenta Bancaria, Tarjetas de Crédito.',
      creditCardSetup: 'Configuración de Tarjeta de Crédito',
      creditCardSetupDescription: 'Para tarjetas de crédito, establece el día de pago (cuando vence la factura) para hacer seguimiento de los pagos correctamente.',
      goToBuckets: 'Ir a Bolsillos para Configurar',
      getStarted: 'Comenzar',
      skipTutorial: 'Omitir Tutorial',
    },
    login: {
      welcome: 'Bienvenido a Flowly',
      signInWithGoogle: 'Iniciar sesión con Google',
      forNowSignInWithGoogle: 'Por ahora, inicia sesión con Google. Correo/contraseña próximamente.',
      needAccess: '¿Necesitas acceso?',
      contactOwner: 'Contactar al propietario',
      loading: 'Cargando...',
      redirecting: 'Redirigiendo...',
    },
    actions: {
      addFixedPayment: 'Agregar',
      updateFixedPayment: 'Actualizar',
      deleteFixedPayment: 'Eliminar',
      markAsPaid: 'Marcar como Pagado',
      markAsUnpaid: 'Marcar como No Pagado',
      addExpense: 'Agregar Gasto',
      updateExpense: 'Actualizar',
      deleteExpense: 'Eliminar',
      addBucket: 'Agregar',
      updateBucket: 'Actualizar',
      deleteBucket: 'Eliminar',
    },
    messages: {
      saved: 'Guardado exitosamente',
      deleted: 'Eliminado exitosamente',
      updated: 'Actualizado exitosamente',
      error: 'Error',
      unauthorized: 'No autorizado',
      notFound: 'No encontrado',
    },
    monthSelector: {
      previousMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      current: 'Actual',
      selectMonth: 'Seleccionar Mes',
      goToCurrentMonth: 'Ir al Mes Actual',
      goToCurrentMonthTitle: 'Ir al mes actual',
    },
    periodSelector: {
      previousPeriod: 'Período anterior',
      nextPeriod: 'Período siguiente',
      current: 'Actual',
      goToCurrentPeriod: 'Ir al período actual',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      saving: 'Saving...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      done: 'Done',
      skip: 'Skip',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      total: 'Total',
      current: 'Current',
      step: 'Step',
      of: 'of',
      remaining: 'Remaining',
    },
    nav: {
      overview: 'Overview',
      buckets: 'Buckets',
      savings: 'Savings',
      insights: 'Insights',
      settings: 'Settings',
      profile: 'Profile',
    },
    overview: {
      title: 'Overview',
      currentMonthExpenses: 'Current Month Expenses',
      bills: 'Bills',
      planned: 'Planned',
      recurringPayments: 'Recurring Payments',
      fromPreviousPeriod: 'From Previous Period',
      unpaidFromPreviousPeriod: 'Unpaid from previous period:',
      noPaymentsFromPreviousPeriod: 'No payments from previous period',
      bucketPaymentsEmptyHint: 'They will appear here when you have expenses in the previous period (e.g. credit card balance).',
      addExpense: 'Add Expense',
      expense: 'Expense',
      amount: 'Amount',
      category: 'Category',
      spendingByCategory: 'Spending by Category',
      noExpensesYet: 'No expenses yet',
      summary: 'Summary',
      expensesByBucket: 'Expenses by bucket:',
      paidBills: 'Paid bills:',
      totalExpenses: 'Total expenses:',
      moneyLeft: 'Money Left:',
      availableForSavings: 'Available for savings or next period',
      monthlySalary: 'Monthly Salary',
      noSalarySet: 'No salary set yet',
      setSalaryDescription: 'Set your monthly salary to track spending',
      setSalary: 'Set Salary',
      left: 'Left: ',
      over: 'Over: ',
      percentUsed: '% used',
      suggestedSavings: 'Suggested savings',
      noSavingsGoalsYet: 'No savings goals yet',
      addSavingsGoalDescription: 'Add a savings goal with a monthly target',
      addGoal: 'Add goal',
      previousGoal: 'Previous goal',
      nextGoal: 'Next goal',
      complete: 'Complete',
      completeWithCheck: '✓ Complete',
      viewAllGoals: 'View all goals',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure your finance tracking preferences',
      periodConfiguration: 'Period Configuration',
      periodStartDay: 'Period Start Day',
      periodStartDayDescription: 'Set the day when your financial period starts. For example, if you get paid on the 15th, set this to 15 to track from the 15th of one month to the 14th of the next.',
      dayOfMonth: '(Day of month: 1-31)',
      currentSetting: 'Current setting:',
      yourPeriodsRun: 'Your periods run from day',
      saveSettings: 'Save Settings',
      resetToDefault: 'Reset to Default (Day 1)',
      settingsSaved: 'Settings saved successfully!',
      settingsReset: 'Settings reset to default',
      failedToSave: 'Failed to save settings',
      expenseCategories: 'Expense Categories',
      manageCategories: 'Manage your expense categories. Add custom categories or use the default ones.',
      addCustomCategory: 'Add Custom Category',
      categoryName: 'Category name',
      allCategories: 'All Categories',
      default: 'Default',
      noCategoriesFound: 'No categories found. Add your first category above.',
      aboutPeriods: 'About Periods',
      whyCustomPeriods: 'Why custom periods?',
      whyCustomPeriodsDescription: 'Many people get paid on a specific day each month (like the 15th). Using custom periods allows you to track your finances from payday to payday, which often makes more sense than calendar months.',
      example: 'Example:',
      periodExample: 'If you set period start day to 15, your periods will be: Jan 15 - Feb 14, 2026, Feb 15 - Mar 14, 2026, Mar 15 - Apr 14, 2026, And so on...',
      note: 'Note:',
      periodNote: 'Changing the period start day will affect how your data is organized. Existing data will be migrated automatically to the new period structure.',
      selectLanguage: 'Select Language',
      periodStartDayValidation: 'Period start day must be between 1 and 31',
      deleteCategoryConfirm: 'Are you sure you want to delete this category? This action cannot be undone if the category has expenses.',
      toDay: 'to day',
      ofNextMonth: 'of the next month',
      categoryColor: 'Category color',
      dataMaintenance: 'Data maintenance',
      cleanupBucketPaymentsDescription: 'If you see wrong totals in "From previous period" (e.g. 1,188,000 instead of 198,000), there may be duplicate records. This button removes duplicates and keeps one record per bucket per period.',
      runCleanup: 'Remove duplicate bucket payments',
      cleanupSuccess: 'Removed {count} duplicate record(s). Refresh the page to see correct totals.',
      cleanupNoDuplicates: 'No duplicates found.',
    },
    buckets: {
      title: 'Bucket Management',
      subtitle: 'Configure your expense buckets (cash or credit cards)',
      bucketManagement: 'Bucket Management',
      configureBuckets: 'Configure your expense buckets (cash or credit cards)',
      noBucketsConfigured: 'No buckets configured. Go to Buckets to add your first bucket.',
      addFirstBucket: 'No buckets configured. Add your first bucket to get started.',
      bucketName: 'Bucket Name',
      bucketType: 'Type',
      cash: 'Cash',
      creditCard: 'Credit Card',
      paymentDay: 'Payment Day',
      reorderBuckets: 'Reorder buckets',
      dragAndDrop: 'Drag and drop to reorder buckets',
      useArrows: 'Use ↑ ↓ to reorder buckets',
      yourBuckets: 'Your Buckets',
      addBucket: 'Add Bucket',
      addNewBucket: 'Add New Bucket',
      type: 'Type',
      paymentDayLabel: 'Payment Day (1-31)',
      dayPlaceholder: 'Day',
      bucketNamePlaceholder: 'e.g., Visa Card',
      paymentDayText: 'Payment day:',
      cannotDeleteBucket: 'Cannot delete bucket with existing expenses',
    },
    profile: {
      title: 'Profile',
      accountInformation: 'Account Information',
      name: 'Name',
      email: 'Email',
      notAvailable: 'Not available',
      security: 'Security',
      loginMethod: 'Login Method',
      password: 'Password',
      changePassword: 'Change Password',
      preferences: 'Preferences',
      appearance: 'Appearance',
      language: 'Language',
      change: 'Change',
      dangerZone: 'Danger Zone',
      signOut: 'Sign Out',
      signOutDescription: 'Sign out of your account',
      deleteAccount: 'Delete Account',
      deleteAccountDescription: 'Permanently delete your account and all data',
      areYouSure: 'Are you sure you want to delete your account? This action cannot be undone.',
    },
    insights: {
      title: 'Insights',
      spendingByCategory: 'Spending by Category',
      categoryBreakdown: 'Category Breakdown',
      ofTotal: 'of total',
      noExpensesYet: 'No expenses yet',
      noExpensesForPeriod: 'No expenses yet for this period',
      addExpensesToSeeInsights: 'Add expenses in the Overview to see insights',
      loadingSpendingData: 'Loading spending data...',
      failedToFetchData: 'Failed to fetch spending data',
      totalSpending: 'Total Spending:',
    },
    savings: {
      addNewGoal: 'Add New Goal',
      goalName: 'Goal name',
      goalNamePlaceholder: 'e.g., Apto, Trip',
      targetAmount: 'Target amount',
      amountPlaceholder: 'Amount',
      monthlyTarget: 'Monthly target (optional)',
      loadingGoals: 'Loading savings goals...',
      noGoalsYet: 'No savings goals yet. Tap "Add New Goal" to get started.',
      target: 'Target:',
      monthly: 'Monthly:',
      add: 'Add',
      amountToAdd: 'Amount to add',
      totalSaved: 'Total saved:',
      progress: 'Progress',
      remaining: 'Remaining:',
    },
    onboarding: {
      welcome: 'Welcome to Flowly!',
      step1Title: 'Set Your Period Start Day',
      step1Description: 'Configure when your financial period starts (day 1-31 of the month). This helps organize your expenses by period.',
      whatIsPeriodStartDay: 'What is a period start day?',
      whatIsPeriodStartDayDescription: 'Choose a day between 1-31 when your financial period begins. Most people use day 1 (standard monthly periods) or their payday (e.g., day 15).',
      examples: 'Examples',
      periodExamples: 'Day 1: Standard monthly periods (Jan 1-31, Feb 1-28, etc.)\nDay 15: Custom periods (Jan 15 - Feb 14, Feb 15 - Mar 14, etc.)',
      goToSettings: 'Go to Settings to Configure',
      step2Title: 'Set Up Your Buckets',
      step2Description: 'Configure your expense buckets to match your payment methods (cash, bank accounts, credit cards).',
      whatAreBuckets: 'What are buckets?',
      whatAreBucketsDescription: 'Buckets represent where your money comes from or where you spend it. Examples: Cash, Bank Account, Credit Cards.',
      creditCardSetup: 'Credit Card Setup',
      creditCardSetupDescription: 'For credit cards, set the payment day (when the bill is due) to track payments properly.',
      goToBuckets: 'Go to Buckets to Configure',
      getStarted: 'Get Started',
      skipTutorial: 'Skip Tutorial',
    },
    login: {
      welcome: 'Welcome to Flowly',
      signInWithGoogle: 'Sign in with Google',
      forNowSignInWithGoogle: 'For now, sign in with Google. Email/password coming later.',
      needAccess: 'Need access?',
      contactOwner: 'Contact the owner',
      loading: 'Loading...',
      redirecting: 'Redirecting...',
    },
    actions: {
      addFixedPayment: 'Add',
      updateFixedPayment: 'Update',
      deleteFixedPayment: 'Delete',
      markAsPaid: 'Mark as Paid',
      markAsUnpaid: 'Mark as Unpaid',
      addExpense: 'Add Expense',
      updateExpense: 'Update',
      deleteExpense: 'Delete',
      addBucket: 'Add',
      updateBucket: 'Update',
      deleteBucket: 'Delete',
    },
    messages: {
      saved: 'Saved successfully',
      deleted: 'Deleted successfully',
      updated: 'Updated successfully',
      error: 'Error',
      unauthorized: 'Unauthorized',
      notFound: 'Not found',
    },
    monthSelector: {
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      current: 'Current',
      selectMonth: 'Select Month',
      goToCurrentMonth: 'Go to Current Month',
      goToCurrentMonthTitle: 'Go to current month',
    },
    periodSelector: {
      previousPeriod: 'Previous period',
      nextPeriod: 'Next period',
      current: 'Current',
      goToCurrentPeriod: 'Go to current period',
    },
  },
};

export function getTranslations(language: Language = 'es'): Translations {
  return translations[language] || translations.es;
}

export function t(key: string, language: Language = 'es'): string {
  const keys = key.split('.');
  let value: any = translations[language] || translations.es;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Spanish if key not found
      value = translations.es;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
        if (value === undefined) return key;
      }
      return value || key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}
