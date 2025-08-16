'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import KPICard from './KPICard'
import CustomCardModal from './CustomCardModal'
import CardManagerModal from './CardManagerModal'
import { CustomCard, Product } from '../types'
import { calculateCustomValue, formatCardValue } from '../utils/customCardCalculations'

interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

interface KPIConfig {
  refreshRate: number
  alertThreshold: number
  isVisible: boolean
  showTrend: boolean
  showPercentage: boolean
  customLabel?: string
  customIcon?: string
}

interface KPIGridProps {
  kpiMetrics: {
    totalProducts: KPIMetric
    activeProducts: KPIMetric
    draftProducts: KPIMetric
    totalValue: KPIMetric
    averagePrice: KPIMetric
    lowStock: KPIMetric
  }
  products: any[] // Changed from Product[] to any[] to support orders
  onRefresh?: (kpiKey: string) => void
  onConfigure?: (kpiKey: string, config: KPIConfig) => void
}

export default function KPIGrid({ kpiMetrics, products, onRefresh, onConfigure }: KPIGridProps) {
  const [customCards, setCustomCards] = useState<CustomCard[]>([])
  const [showCustomCardModal, setShowCustomCardModal] = useState(false)
  const [showCardManagerModal, setShowCardManagerModal] = useState(false)
  const [showCustomTabInManager, setShowCustomTabInManager] = useState(false)
  const [editingCard, setEditingCard] = useState<CustomCard | null>(null)
  const [editingDefaultCard, setEditingDefaultCard] = useState<string | null>(null)
  const [defaultCardVisibility, setDefaultCardVisibility] = useState<Record<string, boolean>>({
    totalProducts: true,
    activeProducts: true,
    draftProducts: true,
    totalValue: true,
    averagePrice: true,
    lowStock: true
  })

  const [kpiConfigs, setKpiConfigs] = useState<Record<string, KPIConfig>>({
    totalProducts: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    activeProducts: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    draftProducts: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    totalValue: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    averagePrice: {
      refreshRate: 30,
      alertThreshold: 0,
      isVisible: true,
      showTrend: true,
      showPercentage: true
    },
    lowStock: {
      refreshRate: 30,
      alertThreshold: 10, // Default threshold for low stock
      isVisible: true,
      showTrend: true,
      showPercentage: true
    }
  })

  // Load custom cards and visibility settings from localStorage
  useEffect(() => {
    const savedCustomCards = localStorage.getItem('shopify-products-custom-cards')
    const savedDefaultVisibility = localStorage.getItem('shopify-products-default-card-visibility')
    
    if (savedCustomCards) {
      try {
        setCustomCards(JSON.parse(savedCustomCards))
      } catch (error) {
        console.error('Error loading custom cards:', error)
      }
    }
    
    if (savedDefaultVisibility) {
      try {
        setDefaultCardVisibility(JSON.parse(savedDefaultVisibility))
      } catch (error) {
        console.error('Error loading default card visibility:', error)
      }
    }
  }, [])

  // Save custom cards and visibility settings to localStorage
  useEffect(() => {
    localStorage.setItem('shopify-products-custom-cards', JSON.stringify(customCards))
  }, [customCards])

  useEffect(() => {
    localStorage.setItem('shopify-products-default-card-visibility', JSON.stringify(defaultCardVisibility))
  }, [defaultCardVisibility])

  const kpiData = [
    { 
      key: 'totalProducts', 
      label: 'Total Products', 
      metric: kpiMetrics.totalProducts,
      gradient: 'from-blue-500 to-blue-600',
      icon: '📦',
      bgGradient: 'from-blue-50 to-blue-100',
      isCurrency: false
    },
    { 
      key: 'activeProducts', 
      label: 'Active Products', 
      metric: kpiMetrics.activeProducts,
      gradient: 'from-green-500 to-green-600',
      icon: '✅',
      bgGradient: 'from-green-50 to-green-100',
      isCurrency: false
    },
    { 
      key: 'draftProducts', 
      label: 'Draft Products', 
      metric: kpiMetrics.draftProducts,
      gradient: 'from-yellow-500 to-yellow-600',
      icon: '📝',
      bgGradient: 'from-yellow-50 to-yellow-100',
      isCurrency: false
    },
    { 
      key: 'totalValue', 
      label: 'Total Value', 
      metric: kpiMetrics.totalValue,
      gradient: 'from-purple-500 to-purple-600',
      icon: '💰',
      bgGradient: 'from-purple-50 to-purple-100',
      isCurrency: true
    },
    { 
      key: 'averagePrice', 
      label: 'Average Price', 
      metric: kpiMetrics.averagePrice,
      gradient: 'from-indigo-500 to-indigo-600',
      icon: '📊',
      bgGradient: 'from-indigo-50 to-indigo-100',
      isCurrency: true
    },
    { 
      key: 'lowStock', 
      label: 'Low Stock Items', 
      metric: kpiMetrics.lowStock,
      gradient: 'from-red-500 to-red-600',
      icon: '⚠️',
      bgGradient: 'from-red-50 to-red-100',
      isCurrency: false
    }
  ]

  const handleRefresh = (kpiKey: string) => {
    onRefresh?.(kpiKey)
  }

  const handleConfigure = (kpiKey: string, config: KPIConfig) => {
    setKpiConfigs(prev => ({
      ...prev,
      [kpiKey]: config
    }))
    onConfigure?.(kpiKey, config)
  }

  const handleSaveCustomCard = (card: CustomCard) => {
    if (editingCard) {
      // Update existing card
      setCustomCards(prev => prev.map(c => c.id === editingCard.id ? card : c))
      setEditingCard(null)
    } else {
      // Add new card
      setCustomCards(prev => [...prev, card])
      // Automatically open manage cards modal and switch to custom tab
      setShowCustomTabInManager(true)
      setShowCardManagerModal(true)
    }
  }

  const handleUpdateCustomCard = (cardId: string, updates: Partial<CustomCard>) => {
    setCustomCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ))
  }

  const handleDeleteCustomCard = (cardId: string) => {
    setCustomCards(prev => prev.filter(card => card.id !== cardId))
  }

  const handleEditCustomCard = (card: CustomCard) => {
    setEditingCard(card)
    setShowCustomCardModal(true)
    setShowCardManagerModal(false)
  }

  const handleEditDefaultCard = (cardKey: string) => {
    setEditingDefaultCard(cardKey)
    setShowCustomCardModal(true)
    setShowCardManagerModal(false)
  }

  const handleUpdateDefaultCard = (cardKey: string, isVisible: boolean) => {
    setDefaultCardVisibility(prev => ({ ...prev, [cardKey]: isVisible }))
  }

  // Calculate custom card values
  const calculateCustomCardValue = (card: CustomCard): number => {
    const selectedProductData = products.filter(p => card.selectedProducts.includes(p.id))
    const values = selectedProductData.map(p => {
      const fieldValue = p[card.field as keyof Product]
      return typeof fieldValue === 'number' ? fieldValue : 0
    }).filter(v => v > 0)

    return calculateCustomValue(values, card.operation, undefined, products.length)
  }

  return (
    <div className="px-3 py-0.5 bg-white shadow-sm">
      {/* Header with Add Card and Manage Cards buttons */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">Analytics Overview</h3>
          <span className="text-xs text-gray-500">
            ({kpiData.filter(({ key }) => defaultCardVisibility[key] && kpiConfigs[key]?.isVisible !== false).length + customCards.filter(c => c.isVisible).length} cards)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCardManagerModal(true)}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Settings className="h-3 w-3" />
            <span>Manage Cards</span>
          </button>
          <button
            onClick={() => setShowCustomCardModal(true)}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="h-3 w-3" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
        {/* Default KPI Cards */}
        {kpiData
          .filter(({ key }) => defaultCardVisibility[key] && kpiConfigs[key]?.isVisible !== false)
          .map(({ key, label, metric, gradient, icon, bgGradient, isCurrency }) => (
            <KPICard
              key={key}
              label={label}
              metric={metric}
              gradient={gradient}
              icon={icon}
              bgGradient={bgGradient}
              isCurrency={isCurrency}
              config={kpiConfigs[key]}
              onRefresh={() => handleRefresh(key)}
              onConfigure={(config) => handleConfigure(key, config)}
            />
          ))}
        
        {/* Custom KPI Cards */}
        {customCards
          .filter(card => card.isVisible)
          .map(card => {
            const computedValue = calculateCustomCardValue(card)
            const isCurrency = card.field === 'price' || card.field === 'cost' || card.field === 'compareAtPrice'
            
            return (
              <div
                key={card.id}
                className={cn(
                  "bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all duration-200 group",
                  "relative overflow-visible"
                )}
              >
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-200 rounded-lg",
                  `bg-gradient-to-r ${card.color}`
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span className="text-base flex-shrink-0">{card.icon}</span>
                      <span className="text-xs font-medium text-gray-600 truncate">{card.title}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {/* Custom card indicator */}
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "text-lg font-bold",
                    card.color
                  )}>
                    {formatCardValue(computedValue, card.field)}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {card.operation} of {card.field} ({card.selectedProducts.length} products)
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Modals */}
             <CustomCardModal
         isOpen={showCustomCardModal}
         onClose={() => {
           setShowCustomCardModal(false)
           setEditingCard(null)
           setEditingDefaultCard(null)
         }}
         onSave={handleSaveCustomCard}
         products={products}
         existingCards={customCards}
         editingCard={editingCard}
         editingDefaultCard={editingDefaultCard}
       />

      <CardManagerModal
        isOpen={showCardManagerModal}
        onClose={() => {
          setShowCardManagerModal(false)
          setShowCustomTabInManager(false)
        }}
        customCards={customCards}
        defaultCards={Object.entries(defaultCardVisibility).map(([key, isVisible]) => ({
          key,
          label: kpiData.find(k => k.key === key)?.label || key,
          isVisible
        }))}
        onUpdateCustomCard={handleUpdateCustomCard}
        onUpdateDefaultCard={handleUpdateDefaultCard}
        onDeleteCustomCard={handleDeleteCustomCard}
        onEditCustomCard={handleEditCustomCard}
        onEditDefaultCard={handleEditDefaultCard}
        defaultActiveTab={showCustomTabInManager ? 'custom' : 'default'}
      />
    </div>
  )
}
