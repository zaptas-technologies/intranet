// hashingUtils.js
const bcrypt = require('bcryptjs');

const generateSalt = async (rounds = 10) => {
  return await bcrypt.genSalt(rounds);
};

const hashValue = async (value, saltRounds = 10) => {
  const salt = await generateSalt(saltRounds);
  return await bcrypt.hash(value, salt);
};

const compareValue = async (value, hashedValue) => {
  return await bcrypt.compare(value, hashedValue);
};



module.exports = {
  hashValue,
  compareValue,
};
