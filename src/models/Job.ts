import mongoose, { Schema, Document } from "mongoose"

export interface IJob extends Document {
  externalId: string
  source: "adzuna" | "remotive" | "themuse"
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  url: string
  tags: string[]
  isRemote: boolean
  postedAt: Date
  fetchedAt: Date
}

const JobSchema = new Schema<IJob>({
  externalId: { type: String, required: true, unique: true },
  source: { type: String, enum: ["adzuna", "remotive", "themuse"], required: true },
  title: { type: String, required: true },
  company: { type: String, default: "" },
  location: { type: String, default: "" },
  type: { type: String, default: "full-time" },
  salary: { type: String, default: "" },
  description: { type: String, default: "" },
  url: { type: String, required: true },
  tags: { type: [String], default: [] },
  isRemote: { type: Boolean, default: false },
  postedAt: { type: Date, default: Date.now },
  fetchedAt: { type: Date, default: Date.now },
})

// Index for fast search
JobSchema.index({ title: "text", company: "text", description: "text" })
JobSchema.index({ source: 1, fetchedAt: -1 })

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema)