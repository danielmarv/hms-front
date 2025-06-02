// Design System Constants
export const designSystem = {
  // Color Palette
  colors: {
    primary: {
      50: "hsl(210, 40%, 98%)",
      100: "hsl(210, 40%, 96%)",
      200: "hsl(214, 32%, 91%)",
      300: "hsl(213, 27%, 84%)",
      400: "hsl(215, 20%, 65%)",
      500: "hsl(215, 16%, 47%)",
      600: "hsl(215, 19%, 35%)",
      700: "hsl(215, 25%, 27%)",
      800: "hsl(217, 33%, 17%)",
      900: "hsl(222, 84%, 5%)",
    },
    // Module-specific accent colors
    modules: {
      admin: "hsl(221, 83%, 53%)", // Blue
      hotel: "hsl(142, 76%, 36%)", // Green
      restaurant: "hsl(25, 95%, 53%)", // Orange
      kitchen: "hsl(0, 84%, 60%)", // Red
      frontdesk: "hsl(262, 83%, 58%)", // Purple
      accounts: "hsl(173, 58%, 39%)", // Teal
    },
    // Status colors
    status: {
      success: "hsl(142, 76%, 36%)",
      warning: "hsl(48, 96%, 53%)",
      error: "hsl(0, 84%, 60%)",
      info: "hsl(221, 83%, 53%)",
      neutral: "hsl(215, 16%, 47%)",
    },
    // Order/Table status colors
    orderStatus: {
      pending: { bg: "hsl(221, 83%, 95%)", text: "hsl(221, 83%, 53%)" },
      preparing: { bg: "hsl(48, 96%, 95%)", text: "hsl(48, 96%, 45%)" },
      ready: { bg: "hsl(142, 76%, 95%)", text: "hsl(142, 76%, 36%)" },
      served: { bg: "hsl(262, 83%, 95%)", text: "hsl(262, 83%, 58%)" },
      completed: { bg: "hsl(215, 16%, 95%)", text: "hsl(215, 16%, 47%)" },
      cancelled: { bg: "hsl(0, 84%, 95%)", text: "hsl(0, 84%, 60%)" },
    },
    tableStatus: {
      available: { bg: "hsl(142, 76%, 95%)", text: "hsl(142, 76%, 36%)" },
      occupied: { bg: "hsl(0, 84%, 95%)", text: "hsl(0, 84%, 60%)" },
      reserved: { bg: "hsl(221, 83%, 95%)", text: "hsl(221, 83%, 53%)" },
      cleaning: { bg: "hsl(48, 96%, 95%)", text: "hsl(48, 96%, 45%)" },
      maintenance: { bg: "hsl(215, 16%, 95%)", text: "hsl(215, 16%, 47%)" },
    },
  },

  // Typography Scale
  typography: {
    // Page headers
    pageTitle: "text-3xl font-bold tracking-tight",
    pageDescription: "text-muted-foreground",

    // Section headers
    sectionTitle: "text-xl font-semibold",
    sectionDescription: "text-sm text-muted-foreground",

    // Card headers
    cardTitle: "text-lg font-semibold",
    cardDescription: "text-sm text-muted-foreground",

    // Content
    body: "text-sm",
    bodyLarge: "text-base",
    caption: "text-xs text-muted-foreground",

    // Stats
    statValue: "text-2xl font-bold",
    statLabel: "text-sm text-muted-foreground",
  },

  // Spacing Scale
  spacing: {
    // Page layout
    pageContainer: "p-6 space-y-6",
    sectionSpacing: "space-y-4",

    // Card spacing
    cardPadding: "p-6",
    cardContentPadding: "p-4",
    cardSpacing: "space-y-4",

    // Form spacing
    formSpacing: "space-y-4",
    fieldSpacing: "space-y-2",

    // Grid spacing
    gridGap: "gap-4",
    gridGapLarge: "gap-6",
  },

  // Component Variants
  components: {
    // Button sizes
    button: {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-4 py-2",
      lg: "h-11 px-8",
    },

    // Card variants
    card: {
      default: "border bg-card text-card-foreground shadow-sm",
      interactive: "border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer",
      stat: "border bg-card text-card-foreground shadow-sm",
    },

    // Badge variants for consistent status display
    badge: {
      status: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      priority: "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
    },
  },

  // Layout patterns
  layouts: {
    // Standard page header
    pageHeader: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",

    // Filter bar
    filterBar: "flex flex-col gap-4 md:flex-row md:items-center",

    // Stats grid
    statsGrid: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",

    // Content grid
    contentGrid: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    contentGridLarge: "grid gap-6 lg:grid-cols-2",

    // Empty state
    emptyState: "text-center py-12",
  },
} as const

// Helper functions for consistent styling
export const getModuleColor = (module: keyof typeof designSystem.colors.modules) => {
  return designSystem.colors.modules[module]
}

export const getStatusBadgeClasses = (status: string, type: "order" | "table" = "order") => {
  const statusColors = type === "order" ? designSystem.colors.orderStatus : designSystem.colors.tableStatus
  const colors = statusColors[status as keyof typeof statusColors]

  if (!colors) {
    return `${designSystem.components.badge.status} bg-gray-100 text-gray-800`
  }

  return `${designSystem.components.badge.status} bg-[${colors.bg}] text-[${colors.text}]`
}

export const getPriorityBadgeClasses = (priority: string) => {
  const priorityColors = {
    high: { bg: "hsl(0, 84%, 95%)", text: "hsl(0, 84%, 60%)" },
    medium: { bg: "hsl(48, 96%, 95%)", text: "hsl(48, 96%, 45%)" },
    low: { bg: "hsl(142, 76%, 95%)", text: "hsl(142, 76%, 36%)" },
  }

  const colors = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
  return `${designSystem.components.badge.priority} bg-[${colors.bg}] text-[${colors.text}]`
}
