import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Material } from "../models/models.js";

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

router.get("/materials/:id/summary", async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);

    if (!material || !material.content) {
      return res.status(404).json({ error: "Документ не найден или пуст" });
    }

    const textToAnalyze = JSON.stringify(material.content);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Проанализируй следующий текст и дай краткое резюме (summary) 
                    с самой важной информацией на русском языке: ${textToAnalyze}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await material.update({ aiSummary: summary });
    res.json({ summary });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Ошибка при генерации summary" });
  }
});

export default router;