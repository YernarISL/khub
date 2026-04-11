const { GoogleGenerativeAI } = require("@google/generative-ai");

// ВСТАВЬТЕ КЛЮЧ ПРЯМО СЮДА ДЛЯ ТЕСТА
const genAI = new GoogleGenerativeAI("AIzaSyCcURqwqTX309RD1vnEkhc_Z4VgL8AGvNs");

async function run() {
  try {
    // Явно указываем версию API через параметр, если SDK капризничает
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, {apiVersion: "v1" });

    const prompt = "Напиши слово 'Работает', если ты меня слышишь.";

    console.log("Отправка запроса...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("РЕЗУЛЬТАТ:", response.text());
  } catch (error) {
    console.error("--- ПОЛНАЯ ОШИБКА ---");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
    // Это поможет увидеть, куда именно стучится библиотека
    if (error.stack) console.error("Stack:", error.stack);
  }
}

run();