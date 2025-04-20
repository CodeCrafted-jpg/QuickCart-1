import { inngest } from "@/config/inngest";
import Product from "@/models/product";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const {userId}=getAuth(request)
        const{items}=await request.json()

        if(!items){
            return NextResponse({success:false,})
        }
       //calculate amount using items
       const amount=await items.reduce(async(acc,item)=>{
        const product=await Product.findById(item.product)
        return acc+product.offerPrice*item.quantity
       },0)
      
       await inngest.send({
        name:'order/created',
        data:{
            userId,items,amount:amount+Math.floor(amount*.02),
            date:Date.now()

        }
       })

       const user=await User.findById(userId)
       user.cartItems={}
        await user.save()
       return NextResponse.json({success:true,message:'order Placed'})
    } catch (error) {
       console.log(error)
       return NextResponse.json({success:false,message:error.message}) 
    }
    
}