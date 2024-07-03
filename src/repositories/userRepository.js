import UserDTO from "../dao/dto/userDTO.js"

export default class UserRepository {
    constructor(dao) {
        this.dao = dao
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getById(uid) {
        return await this.dao.getById(uid)
    }

    async createRegister(user) {
        const newRegister = new UserDTO(user)
        return await this.dao.createRegister(newRegister)
    }

    async createLogin(email, password) {
        return await this.dao.createLogin(email)
    }


    async updateUser(uid, updateData) {
        return await this.dao.updateUser(uid, updateData);
    }

    async getEmail(email){
        return await this.dao.getEmail(email)
    }
}