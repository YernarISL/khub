const pdfParse = require("pdf-parse-new");
const { Material, User } = require("../models/models");

class MaterialController {
  async createMaterial(req, res) {
    try {
      const { title, description, materialType, content } = req.body;
      console.log("Body:", req.body);
      console.log("Session:", req.session);
      if (!title || !description || !materialType || !content) {
        return res.status(400).json({ message: "Not all fields are filled" });
      }
      const material = await Material.create({
        title,
        description,
        materialType,
        content,
        publishedDate: new Date(),
        userId: req.session.userId,
      });

      return res.json(material);
    } catch (error) {
      console.error("Ошибка при создании материала:", error);

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async getUserMaterials(req, res) {
    try {
      const materials = await Material.findAll({
        where: { userId: req.session.userId },
        order: [["publishedDate", "DESC"]],
      });

      return res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async getMaterialById(req, res) {
    try {
      const { id } = req.params;

      const material = await Material.findByPk(id, {
        include: {
            model: User,
            attributes: ["id", "firstName", "secondName", "username"],
        }
      });

      if (!material) {
        console.log(`Material with id ${id} not found`);
        return res.status(404).json({ message: "Material not found" });
      }

      return res.json(material);
    } catch (error) {
      console.error("Error getting material by id: ", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createFromPdf(req, res) {
    try {
      // ДИАГНОСТИКА: Посмотрим, что в переменной
      console.log("Тип pdfParse:", typeof pdfParse);
      console.log("Содержимое pdfParse:", pdfParse);

      if (!req.file) {
        return res.status(400).json({ message: "Файл не получен" });
      }

      // Определяем функцию парсинга
      let parseFunction;
      if (typeof pdfParse === "function") {
        parseFunction = pdfParse;
      } else if (pdfParse && typeof pdfParse.default === "function") {
        parseFunction = pdfParse.default;
      } else {
        // Если всё еще не функция, пробуем принудительный импорт конкретного файла
        parseFunction = require("pdf-parse/lib/pdf-parse.js");
      }

      const pdfData = await parseFunction(req.file.buffer);

      const material = await Material.create({
        title: req.body.title || "Без названия",
        description: req.body.description || "",
        materialType: "UPLOAD",
        content: pdfData.text,
        publishedDate: new Date(),
        userId: req.session.userId,
      });

      return res.json(material);
    } catch (error) {
      console.error("ДЕТАЛЬНАЯ ОШИБКА:", error);
      return res.status(500).json({
        message: "Ошибка обработки PDF",
        error: error.message,
      });
    }
  }
}

module.exports = new MaterialController();
