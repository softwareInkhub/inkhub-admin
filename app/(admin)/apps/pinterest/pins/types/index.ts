export interface Pin {
  id: string
  title: string
  description: string
  board: string
  owner: string
  image: string
  createdAt: string
  updatedAt: string
  tags: string[]
  likes: number
  comments: number
  repins: number
  saves: number
  isStarred: boolean
  selected?: boolean
  type?: 'image' | 'video' | 'article'
  status?: 'active' | 'archived'
}

export interface PinVariant {
  id: string
  title: string
  board: string
  likes: number
  comments: number
  repins: number
  type: 'image' | 'video' | 'article'
}

export interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

export interface KPIMetrics {
  totalPins: KPIMetric
  imagePins: KPIMetric
  videoPins: KPIMetric
  articlePins: KPIMetric
  totalLikes: KPIMetric
  totalComments: KPIMetric
  totalRepins: KPIMetric
  averageEngagement: KPIMetric
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

export interface PinsClientProps {
  initialData: {
    items: any[]
    lastEvaluatedKey: any
    total: number
  }
}
