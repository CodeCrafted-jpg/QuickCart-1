import connectDb from "@/config/db";
import Adress from "@/models/adress";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth?.userId;
        console.log("UserID from Clerk:", userId);

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized: No userId found." });
        }

        const { address } = await request.json();

        await connectDb();

        const newAddress = await Adress.create({ ...address, userId });

        return NextResponse.json({
            success: true,
            message: "Address added successfully",
            newAddress
        });

    } catch (error) {
        console.error("Error in POST /add-adress:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}
