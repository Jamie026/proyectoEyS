const bcrypt = require("bcrypt");

async function encrypt(password){
    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(password, salt);
    return hash;
}

function compare(password, hashedPassword){
    return bcrypt.compareSync(password, hashedPassword);
}

module.exports = { encrypt, compare };