export interface IUser {
  _id: string
  name: string
  email: string
  image?: string
  createdAt: Date
}

export interface IJob {
  _id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'remote'
  salary?: string
  description: string
  url?: string
  postedAt: Date
}

export interface IApplication {
  _id: string
  userId: string
  jobId: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  appliedAt?: Date
  notes?: string
  createdAt: Date
}