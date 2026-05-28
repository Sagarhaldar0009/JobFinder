import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  isOnboarded: boolean
  savedJobs: string[]
  blacklistedCompanies: string[]
  profile: {
    targetRoles: string[]
    locations: string[]
    workPreference: "remote" | "hybrid" | "onsite" | ""
    salaryMin: number
    salaryMax: number
    currency: string
    dealBreakerCompanies: string[]
    skills: string[]
  }
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  isOnboarded: { type: Boolean, default: false },
  savedJobs: { type: [String], default: [] },
  blacklistedCompanies: { type: [String], default: [] },
  profile: {
    targetRoles: { type: [String], default: [] },
    locations: { type: [String], default: [] },
    workPreference: { type: String, default: "" },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    dealBreakerCompanies: { type: [String], default: [] },
    skills: { type: [String], default: [] },
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)