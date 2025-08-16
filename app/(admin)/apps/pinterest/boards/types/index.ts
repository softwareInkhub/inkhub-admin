export interface Board {
  id: string
  name: string
  description: string
  owner: string
  privacy: 'public' | 'private'
  pinCount: number
  followers: number
  image: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isStarred: boolean
  selected?: boolean
  category?: string
  status?: 'active' | 'archived'
}

export interface BoardVariant {
  id: string
  name: string
  pinCount: number
  followers: number
  privacy: 'public' | 'private'
}

export interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

export interface KPIMetrics {
  totalBoards: KPIMetric
  publicBoards: KPIMetric
  privateBoards: KPIMetric
  totalPins: KPIMetric
  totalFollowers: KPIMetric
  averagePinsPerBoard: KPIMetric
}

export interface SearchCondition {
  field: string
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with'
  value: string
  connector: 'AND' | 'OR'
}

export interface CustomFilter {
  id: string
  name: string
  field: string
  operator: string
  value: string
}

export interface BoardsClientProps {
  initialData: {
    items: any[]
    lastEvaluatedKey: any
    total: number
  }
}
