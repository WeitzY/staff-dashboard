'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Edit3, Languages, Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

type Hotel = Database['public']['Tables']['hotels']['Row']

interface LanguagesSectionProps {
  hotel: Hotel
  isUpdating: boolean
  onUpdate: (updates: { languages: string[]; default_language: string }) => Promise<Hotel | null>
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'he', name: 'Hebrew' },
]

const MAX_LANGUAGES = 3

export function LanguagesSection({ hotel, isUpdating, onUpdate }: LanguagesSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingLanguages, setEditingLanguages] = useState<string[]>([])
  const [defaultLanguage, setDefaultLanguage] = useState('')

  const startEditing = () => {
    setIsEditing(true)
    setEditingLanguages([...hotel.languages || []])
    setDefaultLanguage(hotel.default_language || 'en')
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingLanguages([])
    setDefaultLanguage('')
  }

  const saveChanges = async () => {
    try {
      await onUpdate({
        languages: editingLanguages,
        default_language: defaultLanguage
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving languages:', error)
    }
  }

  const toggleLanguage = (languageCode: string) => {
    if (editingLanguages.includes(languageCode)) {
      // Don't allow removing the default language
      if (languageCode === defaultLanguage) {
        toast.error("Cannot remove the default language - please select a different default language first")
        return
      }
      setEditingLanguages(editingLanguages.filter(l => l !== languageCode))
    } else {
      // Check if we've reached the maximum number of languages
      if (editingLanguages.length >= MAX_LANGUAGES) {
        toast.error(`Maximum ${MAX_LANGUAGES} languages allowed - please remove a language before adding another`)
        return
      }
      setEditingLanguages([...editingLanguages, languageCode])
    }
  }

  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Languages className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl font-semibold">Languages</CardTitle>
            </div>
          </div>
          {!isEditing ? (
            <Button 
              onClick={startEditing} 
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-6 gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button onClick={cancelEdit} variant="outline">
                Cancel
              </Button>
              <Button onClick={saveChanges} disabled={isUpdating}>
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {hotel.languages?.map((langCode) => {
                const isDefault = langCode === hotel.default_language
                return (
                  <Badge
                    key={langCode}
                    variant="outline"
                    className={cn(
                      "text-sm px-3 py-1 bg-muted/40",
                      isDefault && "bg-primary/10 text-primary border-primary/30 font-semibold"
                    )}
                  >
                    {AVAILABLE_LANGUAGES.find(lang => lang.code === langCode)?.name || langCode}
                    {isDefault && <span className="sr-only"> (default)</span>}
                  </Badge>
                )
              }) || <p className="text-sm text-muted-foreground">No languages configured</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-language" className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Default Language
              </Label>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default language" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_LANGUAGES.filter(lang => editingLanguages.includes(lang.code)).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Supported Languages ({editingLanguages.length} out of {MAX_LANGUAGES} selected)
              </Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <label key={lang.code} className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={editingLanguages.includes(lang.code)}
                      onChange={() => toggleLanguage(lang.code)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
