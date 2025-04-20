import connectDb from "@/config/db";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("🔥 userId from Clerk:", userId); // debug here

    if (!userId) {
      return NextResponse.json({ success: false, message: "No user ID found in Clerk session." });
    }

    await connectDb();

    const user = await User.findOne({_id:userId}).lean(); // use `.lean()` to simplify

    if (!user) {
      console.log("❌ User not found in DB for ID:", userId); // extra log
      return NextResponse.json({ success: false, message: "User not found" });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("💥 Error in GET /api/user/data:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
