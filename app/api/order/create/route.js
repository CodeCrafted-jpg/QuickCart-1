import { inngest } from "@/config/inngest";
import Product from "@/models/product";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    console.log(userId)
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "No items provided" });
    }

    // Calculate total amount
    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue; // Skip invalid products
      amount += product.offerPrice * item.quantity;
    }

    const totalAmount = amount + Math.floor(amount * 0.02); // Add tax (2%)

    // Send order to Inngest
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        items,
        amount: totalAmount,
        date: Date.now(),
      },
    });

    // Clear user's cart
    const user = await User.findById(userId);
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Order placed" });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}

