
const Router = require("express");
const router = new Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Material } = require("../models/models");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/materials/:id/summary", async (req, res) => {
  try {
    // 1. Находим документ в БД по ID
    const material = await Material.findByPk(req.params.id);
    
    if (!material || !material.content) {
      return res.status(404).json({ error: "Документ не найден или пуст" });
    }

    const textToAnalyze = JSON.stringify(material.content);
    // 2. Инициализируем модель (gemini-1.5-flash — самая быстрая и дешевая)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Проанализируй следующий текст и дай краткое резюме (summary) 
                    с самой важной информацией на русском языке: ${textToAnalyze}`;
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // 5. Отправляем на фронтенд
    await material.update({ aiSummary: summary });
    res.json({ summary });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Ошибка при генерации summary" });
  }
});

module.exports = router;