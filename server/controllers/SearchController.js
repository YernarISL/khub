const { User, Material } = require("../models/models");

class SearchController {
    async getAllUsers(req, res) {
        const data = await User.findAll()
        return res.json({message: "Works!", data: data});
    } 

    async getAllMaterials(req, res) {
        const data = await Material.findAll();
        return res.json({ message: "Works!", data: data});
    }
}

module.exports = new SearchController();