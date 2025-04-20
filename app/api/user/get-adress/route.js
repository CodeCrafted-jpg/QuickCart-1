import connectDb from "@/config/db";
import Adress from "@/models/adress";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const {userId}=getAuth(request)

        await connectDb()
        const adresses=await Adress.find({userId})

         return NextResponse.json({success:true,adresses})
    } catch (error) {
        return NextResponse.json({success:false,message:error.message})
    }
}