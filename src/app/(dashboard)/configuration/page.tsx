'use client'

import { useState, useEffect } from 'react'
import { Package, HelpCircle } from 'lucide-react'
import { useItems } from '@/hooks/useItems'
import { useFAQs } from '@/hooks/useFAQs'
import { ItemsSection } from '@/components/configuration/items/items-section'
import { FAQsSection } from '@/components/configuration/faqs/faqs-section'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import type { Item, FAQ } from '@//types/configuration'

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState('items')
  const [initialized, setInitialized] = useState(false)
  
  // Only load the data for the active tab to improve performance
  const shouldLoadItems = activeTab === 'items' || initialized
  const shouldLoadFAQs = activeTab === 'faqs' || initialized
  
  const { 
    items, 
    isLoading: itemsLoading, 
    createItem, 
    updateItem, 
    deleteItem, 
    toggleItemActive 
  } = useItems({ enabled: shouldLoadItems })
  
  const { 
    faqs, 
    isLoading: faqsLoading, 
    createFaq, 
    updateFaq, 
    deleteFaq, 
    toggleFaqActive 
  } = useFAQs({ enabled: shouldLoadFAQs })

  // Mark as initialized after first tab interaction
  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        setInitialized(true)
      }, 1000) // Preload other tab after 1 second
      return () => clearTimeout(timer)
    }
  }, [initialized])

  const handleSaveItem = (item: Item) => {
    if (!item.id) {
      createItem(item)
    } else {
      updateItem(item)
    }
  }

  const handleSaveFaq = (faq: FAQ) => {
    if (!faq.id) {
      createFaq(faq)
    } else {
      updateFaq(faq)
    }
  }

  // Only show loading if the current active tab is loading
  const isLoading = (activeTab === 'items' && itemsLoading) || (activeTab === 'faqs' && faqsLoading)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 md:h-14 rounded-2xl bg-transparent gap-x-3">
          <TabsTrigger value="items" className="flex items-center gap-2 md:gap-3 h-10 md:h-12 px-3 md:px-4 rounded-xl font-semibold text-sm md:text-base">
            <Package className="h-4 w-4 md:h-5 md:w-5" />
            <span>Items</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2 md:gap-3 h-10 md:h-12 px-3 md:px-4 rounded-xl font-semibold text-sm md:text-base">
            <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
            <span>FAQs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-8 mt-8">
          <ItemsSection
            items={items}
            onEdit={handleSaveItem}
            onDelete={deleteItem}
            onCreate={handleSaveItem}
            onToggleActive={toggleItemActive}
          />
        </TabsContent>

        <TabsContent value="faqs" className="space-y-8 mt-8">
          <FAQsSection
            faqs={faqs}
            onEdit={handleSaveFaq}
            onDelete={deleteFaq}
            onCreate={handleSaveFaq}
            onToggleActive={toggleFaqActive}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 