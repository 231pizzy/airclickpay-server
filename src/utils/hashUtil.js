const bcrypt = require('bcryptjs');

const hashUtil = {
  hashPassword: (password) => {
    return bcrypt.hashSync(password, 10);
  },
  // hashPassword: async (password) => {
  //   const salt = await bcrypt.genSalt(10);
  //   return await bcrypt.hash(password, salt);
  // },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },
};

module.exports = hashUtil;
