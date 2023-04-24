const bcrypt = require("bcrypt");
const saltRounds = 10;

export async function hashIt(password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    return null;
  }
}
