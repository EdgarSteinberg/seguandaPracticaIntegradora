export default class UserDTO {
    constructor({ _id, first_name, last_name, email, age, username, password }) {
        this.id = _id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.age = age;
        this.username = username;
        this.password = password
    }
}