import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"

// Schema for structured resume data
export const ResumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedIn: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string(),
      achievements: z.array(z.string()).optional(),
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      graduationDate: z.string().optional(),
      gpa: z.string().optional(),
    }),
  ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    languages: z.array(z.string()).optional(),
  }),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string().optional(),
        expiryDate: z.string().optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional(),
        url: z.string().optional(),
      }),
    )
    .optional(),
})

export type ParsedResume = z.infer<typeof ResumeSchema>

export async function parseResumeText(resumeText: string): Promise<ParsedResume> {
  try {
    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      schema: ResumeSchema,
      prompt: `
        Parse the following resume text and extract structured information. 
        Be thorough and accurate. If information is not available, omit the field or use empty arrays.
        
        Resume Text:
        ${resumeText}
        
        Instructions:
        - Extract all personal information (name, contact details)
        - List work experience in chronological order (most recent first)
        - Include education details with degrees and institutions
        - Categorize skills into technical, soft skills, and languages
        - Extract certifications with issuing organizations
        - Identify notable projects with descriptions and technologies used
        - For dates, use consistent format (YYYY-MM or YYYY)
        - Be precise with company names, job titles, and technical terms
      `,
    })

    return object
  } catch (error) {
    console.error("Error parsing resume:", error)
    throw new Error("Failed to parse resume content")
  }
}

// Extract text from different file types
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type

  if (fileType === "text/plain") {
    return await file.text()
  }

  if (fileType === "application/pdf") {
    // For PDF parsing, we'll use a simple approach
    // In production, you'd want to use a proper PDF parser like pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(arrayBuffer)
    return text
  }

  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // For DOCX parsing, we'll use a simple approach
    // In production, you'd want to use a proper DOCX parser like mammoth
    const arrayBuffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(arrayBuffer)
    return text
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}
