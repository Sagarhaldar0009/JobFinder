// import { NextRequest, NextResponse } from "next/server"
// import { cookies } from "next/headers"
// import { verifyToken } from "@/lib/jwt"
// import connectDB from "@/lib/mongodb"
// import Resume from "@/models/Resume"
// import { parseResumeText } from "@/lib/resume-parser"

// export const config = { api: { bodyParser: false } }

// export async function POST(req: NextRequest) {
//     try {
//         const token = cookies().get("token")?.value
//         if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

//         const user = await verifyToken(token)
//         if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

//         const formData = await req.formData()
//         const file = formData.get("resume") as File

//         if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
//         if (file.type !== "application/pdf")
//             return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
//         if (file.size > 5 * 1024 * 1024)
//             return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 })

//         // Convert file to buffer
//         const arrayBuffer = await file.arrayBuffer()
//         const buffer = Buffer.from(arrayBuffer)

//         // Extract text using pdf-parse
//         // const pdfParse = await import("pdf-parse")
//         // const pdfData = await pdfParse(buffer)
//         // const rawText = pdfData.text
//         const { extractText } = await import("unpdf")
//         const uint8Array = new Uint8Array(buffer)
//         const { text: rawText } = await extractText(uint8Array, { mergePages: true })

//         // Parse the extracted text
//         const parsed = parseResumeText(rawText)

//         await connectDB()

//         // Delete old resume if exists
//         await Resume.deleteOne({ userId: user.userId })

//         // Save new resume
//         const resume = await Resume.create({
//             userId: user.userId,
//             fileName: file.name,
//             fileSize: file.size,
//             rawText,
//             parsed,
//         })

//         return NextResponse.json({
//             message: "Resume uploaded and parsed successfully",
//             resume: {
//                 id: resume._id,
//                 fileName: resume.fileName,
//                 fileSize: resume.fileSize,
//                 parsed: resume.parsed,
//                 uploadedAt: resume.uploadedAt,
//             },
//         }, { status: 201 })

//     } catch (error) {
//         console.error("Resume upload error:", error)
//         return NextResponse.json({ error: "Failed to process resume" }, { status: 500 })
//     }
// }








import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import connectDB from "@/lib/mongodb"
import Resume from "@/models/Resume"
import { parseResumeText } from "@/lib/resume-parser"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    const token = cookies().get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("resume") as File

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    if (file.type !== "application/pdf")
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const cloudinaryResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: `jobfinder/resumes/${user.userId}`,
            public_id: `resume_${Date.now()}`,
            format: "pdf",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as { secure_url: string; public_id: string })
          }
        ).end(buffer)
      }
    )

    // Extract text
    const { extractText } = await import("unpdf")
    const uint8Array = new Uint8Array(buffer)
    const { text: rawText } = await extractText(uint8Array, { mergePages: true })

    // Parse text
    const parsed = parseResumeText(rawText)

    await connectDB()

    // Delete old Cloudinary file if exists
    const existingResume = await Resume.findOne({ userId: user.userId })
    if (existingResume?.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(existingResume.cloudinaryPublicId, {
        resource_type: "raw",
      })
    }

    // Upsert resume
    const resume = await Resume.findOneAndUpdate(
      { userId: user.userId },
      {
        userId: user.userId,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        rawText,
        parsed,
        uploadedAt: new Date(),
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        fileUrl: resume.fileUrl,
        parsed: resume.parsed,
        uploadedAt: resume.uploadedAt,
      },
    }, { status: 201 })

  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 })
  }
}