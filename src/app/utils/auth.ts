import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
}


export const generateToken = (user: any) => {
  const token = jwt.sign(user, process.env.JWT_SECRET!);
  return token;
}

