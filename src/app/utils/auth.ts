import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtUserPayload {
  id: string;
  email: string;
  role?: string;
  // Add more fields if your token includes them
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: JwtUserPayload): string => {
  return jwt.sign(user, process.env.JWT_SECRET as string);
};
