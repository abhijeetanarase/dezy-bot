import dbConnect from "@/app/lib/db";
import User from "@/app/models/User";
import { comparePassword, generateToken } from "@/app/utils/auth";
import { NextResponse } from "next/server";
import { use } from "react";



export async function POST(req: Request) {
  await dbConnect();
  const {email , password} = await req.json();
  console.log("Login request received with email:", email, "and password:", password);
  
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  const user = await User.findOne({ email })
    if (!user) {
        return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
        );
    }
   
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
        return NextResponse.json(
        { error: "Invalid Credentials" },
        { status: 400 }
        );
    }
   
    const token = generateToken({ id: user._id, email: user.email });
    return NextResponse.json({ user : {email : user.email , name : user.name}, token });
}