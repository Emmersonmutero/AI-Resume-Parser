import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"

// Schema for job matching analysis
export const JobMatchSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillsMatch: z.object({
    score: z.number().min(0).max(100),
    matchedSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    explanation: z.string(),
  }),
  experienceMatch: z.object({
    score: z.number().min(0).max(100),
    relevantExperience: z.array(z.string()),
    experienceGap: z.string().optional(),
    explanation: z.string(),
  }),
  educationMatch: z.object({
    score: z.number().min(0).max(100),
    meetsRequirements: z.boolean(),
    explanation: z.string(),
  }),
  locationMatch: z.object({
    score: z.number().min(0).max(100),
    compatible: z.boolean(),
    explanation: z.string(),
  }),
  culturalFit: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    concerns: z.array(z.string()).optional(),
    explanation: z.string(),
  }),
  recommendations: z.array(z.string()),
  summary: z.string(),
})

export type JobMatch = z.infer<typeof JobMatchSchema>

export async function matchCandidateToJob(candidateData: any, jobDescription: any): Promise<JobMatch> {
  try {
    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      schema: JobMatchSchema,
      prompt: `
        Analyze how well this candidate matches the job description. Provide detailed scoring and explanations.

        CANDIDATE PROFILE:
        Name: ${candidateData.personalInfo.fullName}
        Location: ${candidateData.personalInfo.location || "Not specified"}
        
        Summary: ${candidateData.summary || "No summary provided"}
        
        Experience:
        ${candidateData.experience
          .map(
            (exp: any) =>
              `- ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"}): ${exp.description}`,
          )
          .join("\n")}
        
        Education:
        ${candidateData.education
          .map((edu: any) => `- ${edu.degree} in ${edu.field || "N/A"} from ${edu.institution}`)
          .join("\n")}
        
        Technical Skills: ${candidateData.skills.technical.join(", ")}
        Soft Skills: ${candidateData.skills.soft.join(", ")}
        
        JOB DESCRIPTION:
        Title: ${jobDescription.title}
        Company: ${jobDescription.company}
        Location: ${jobDescription.location}
        Type: ${jobDescription.employment_type}
        Experience Level: ${jobDescription.experience_level}
        
        Description: ${jobDescription.description}
        
        Required Skills: ${jobDescription.required_skills.join(", ")}
        Preferred Skills: ${jobDescription.preferred_skills?.join(", ") || "None specified"}
        
        Education Requirements: ${jobDescription.education_requirements || "Not specified"}
        Experience Requirements: ${jobDescription.experience_requirements || "Not specified"}
        
        SCORING INSTRUCTIONS:
        - Overall Score: Weighted average (Skills 40%, Experience 30%, Education 15%, Location 10%, Cultural Fit 5%)
        - Skills Match: Compare technical and soft skills, prioritize required skills
        - Experience Match: Evaluate relevant work experience, industry background, and career progression
        - Education Match: Check if education meets minimum requirements
        - Location Match: Consider remote work options, relocation willingness, and geographic compatibility
        - Cultural Fit: Assess based on company culture, values, and candidate background
        
        Provide specific, actionable recommendations for both the candidate and recruiter.
        Be honest about gaps while highlighting strengths.
      `,
    })

    return object
  } catch (error) {
    console.error("Error matching candidate to job:", error)
    throw new Error("Failed to analyze job match")
  }
}

export function calculateMatchScore(match: JobMatch): number {
  // Weighted scoring algorithm
  const weights = {
    skills: 0.4,
    experience: 0.3,
    education: 0.15,
    location: 0.1,
    culturalFit: 0.05,
  }

  return Math.round(
    match.skillsMatch.score * weights.skills +
      match.experienceMatch.score * weights.experience +
      match.educationMatch.score * weights.education +
      match.locationMatch.score * weights.location +
      match.culturalFit.score * weights.culturalFit,
  )
}
