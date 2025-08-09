import dbConnect from "@/app/lib/db";
import User from "@/app/models/User";
import { generateToken, hashPassword } from "@/app/utils/auth";
import { NextResponse } from "next/server";




export async function POST(req: Request) {
  await dbConnect();
  const {email , password , name ,phone , reasonOfVisit , age } = await req.json();
  if (!email || !password || !name || !phone || !reasonOfVisit || !age) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
        );
    }
  const  hashedPassword = await hashPassword(password);
  const user = await User.create({email , name , password : hashedPassword , phone , reasonOfVisit , age});
  const token = generateToken({ id: user._id, email: user.email });
  return NextResponse.json({ user : {email : user.email , name : user.name}, token });
}