import mongoose, { Schema, Document } from "mongoose"

export interface IResume extends Document {
  userId: string
  fileName: string
  fileSize: number
  fileUrl: string
  cloudinaryPublicId: string
  rawText: string
  parsed: {
    skills: string[]
    jobTitles: string[]
    experience: { company: string; role: string; duration: string }[]
    education: { institution: string; degree: string; year: string }[]
    email: string
    phone: string
    totalExperienceYears: number
  }
  uploadedAt: Date
}

const ResumeSchema = new Schema<IResume>({
  userId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileUrl: { type: String, default: "" },
  cloudinaryPublicId: { type: String, default: "" },
  rawText: { type: String, default: "" },
  parsed: {
    skills: { type: [String], default: [] },
    jobTitles: { type: [String], default: [] },
    experience: [{ company: String, role: String, duration: String }],
    education: [{ institution: String, degree: String, year: String }],
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    totalExperienceYears: { type: Number, default: 0 },
  },
  uploadedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema)