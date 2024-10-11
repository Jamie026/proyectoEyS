const bcrypt = require("bcrypt");

function encrypt(password){
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function compare(password, hashedPassword){
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = { encrypt, compare };