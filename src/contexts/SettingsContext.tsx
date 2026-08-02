import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Settings {
  company_name?: string;
  currency?: string;
  timezone?: string;
  theme?: string;
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    company_name: "X-TREME CORPORATION",
    currency: "USD ($)",
    timezone: "UTC",
    theme: "Light Mode",
  });

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      if (Object.keys(data).length > 0) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Sync document title when company name changes
  useEffect(() => {
    if (settings.company_name) {
      document.title = settings.company_name;
    }
  }, [settings.company_name]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
