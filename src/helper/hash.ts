const bcrypt = require("bcrypt");
const fixedSalt = process.env.SALT;

export async function hashIt(password: string) {
  try {
    const hashedPassword = await bcrypt.hashSync(password, fixedSalt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    return null;
  }
}
