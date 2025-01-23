const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const pdf = require("pdf-parse");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT;

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Function to get Gemini response
async function getGeminiResponse(input) {
  try {
    console.log("Input prompt:", input);
    
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate content
    const result = await model.generateContent(input);
    const response = await result.response;
    const text = response.text();
    
    console.log("Generated response:", text);
    return text;
  } catch (error) {
    console.error("Error in getGeminiResponse:", error);
    throw error;
  }
}

// Route to handle PDF upload and job description
app.post("/api/evaluate", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jd;
    const pdfBuffer = req.file.buffer;
    // Extract text from PDF
    const pdfData = await pdf(pdfBuffer);
    const resumeText = pdfData.text;

    const inputPrompt = `
            Hey Act Like a skilled or very experience ATS(Application Tracking System)
            with a deep understanding of tech field, software engineering, data science, data analyst
            and big data engineer. Your task is to evaluate the resume based on the given job description.
            You must consider the job market is very competitive and you should provide 
            best assistance for improving the resumes. Assign the percentage Matching based 
            on JD and the missing keywords with high accuracy
            resume: ${resumeText}
            description: ${jobDescription}

            Additionally, evaluate the resume’s existing profile summary (if present) 
            and rewrite it to tailor it specifically for the provided job description. 
            Ensure the new profile summary aligns perfectly with the job requirements, 
            using relevant points and achievements from the resume while making it job-focused.

            I want the response in one single string having the structure
            {"JD Match":"%","MissingKeywords":[],"Profile Summary":""}
        `;

    const atsResponse = await getGeminiResponse(inputPrompt);
    res.json(atsResponse);
  } catch (error) {
    res.status(500).send("Error processing the request");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
