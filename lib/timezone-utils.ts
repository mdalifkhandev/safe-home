export type WidgetSettings = {
  firstTimezone: string;
  secondTimezone: string | null;
  use24Hour: boolean;
  widgetEnabled: boolean;
};

export type TimeZoneOption = {
  id: string;
  label: string;
  searchText: string;
};

const FALLBACK_TIMEZONES = [
  "Africa/Cairo",
  "Africa/Johannesburg",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dhaka",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Kolkata",
  "Asia/Seoul",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Melbourne",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
  "UTC",
] as const;

const getTimeZoneIds = () => {
  const supportedValuesOf = (Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  }).supportedValuesOf;

  if (typeof supportedValuesOf === "function") {
    try {
      const values = supportedValuesOf("timeZone");
      if (Array.isArray(values) && values.length > 0) {
        return values;
      }
    } catch {
      // Fallback below.
    }
  }

  return [...FALLBACK_TIMEZONES];
};

export const TIME_ZONE_OPTIONS: TimeZoneOption[] = getTimeZoneIds()
  .map((id) => ({
    id,
    label: getTimeZoneLabel(id),
    searchText: `${id} ${getTimeZoneLabel(id)}`.toLowerCase(),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function getTimeZoneLabel(timeZone: string) {
  if (timeZone === "UTC") {
    return "UTC";
  }

  const leaf = timeZone.split("/").pop() ?? timeZone;
  return leaf.replace(/_/g, " ");
}

export function getTimeZoneDisplayName(timeZone: string) {
  return getTimeZoneLabel(timeZone);
}

export function getDeviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function formatTimeForZone(
  date: Date,
  timeZone: string,
  use24Hour: boolean,
) {
  return new Intl.DateTimeFormat("en-US", {
    hour: use24Hour ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: !use24Hour,
    timeZone,
  }).format(date);
}

export function normalizeWidgetSettings(
  settings: Partial<WidgetSettings>,
): WidgetSettings {
  const firstTimezone = settings.firstTimezone || getDeviceTimeZone();
  const secondTimezone =
    settings.secondTimezone && settings.secondTimezone !== firstTimezone
      ? settings.secondTimezone
      : null;

  return {
    firstTimezone,
    secondTimezone,
    use24Hour: Boolean(settings.use24Hour),
    widgetEnabled: settings.widgetEnabled ?? true,
  };
}

export function getPreviewRows(settings: WidgetSettings) {
  const now = new Date();
  const rows = [
    {
      id: settings.firstTimezone,
      label: getTimeZoneDisplayName(settings.firstTimezone),
      time: formatTimeForZone(now, settings.firstTimezone, settings.use24Hour),
    },
  ];

  if (settings.secondTimezone) {
    rows.push({
      id: settings.secondTimezone,
      label: getTimeZoneDisplayName(settings.secondTimezone),
      time: formatTimeForZone(
        now,
        settings.secondTimezone,
        settings.use24Hour,
      ),
    });
  }

  return rows;
}
