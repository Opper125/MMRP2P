"use client"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Language } from "@/lib/i18n"

interface LanguageSwitcherProps {
  onLanguageChange: (lang: Language) => void
  currentLang: Language
}

export function LanguageSwitcher({ onLanguageChange, currentLang }: LanguageSwitcherProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLanguageChange(currentLang === "en" ? "mm" : "en")}
      className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border-2 hover:bg-white/95 transition-all duration-300"
    >
      <Globe className="w-4 h-4 mr-2" />
      {currentLang === "en" ? "မြန်မာ" : "English"}
    </Button>
  )
}
