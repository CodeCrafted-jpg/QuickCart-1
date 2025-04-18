import { Inngest } from "inngest";
import connectDb from "./db";
import {User} from "@/models/user";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

//ingest function to save user data in database

export const syncUserCreation=inngest.createFunction(
    {
    id:'sync-user-from-clerk'
  },
{event:'clerk/user.created'},
async({event})=>{
const { id,first_name,last_name,email_adresses,image_url}= event.data
const userData={
    _id:id,
    email:email_adresses[0].email_address,
    name:first_name+ ''+last_name,
    imageUrl:image_url

}
await connectDb()
await User.create(userData)
}
)

//inngest function to update
export const syncUserUpdation=inngest.createFunction({
    id:'update-user-from-clerk'
    
},
{event:'clerk/user.updated'},
async({event})=>{
    const { id,first_name,last_name,email_adresses,image_url}= event.data
    const userData={
        _id:id,
        email:email_adresses[0].email_address,
        name:first_name+ ''+last_name,
        imageUrl:image_url
    
    }
    await connectDb()
    await User.findByIdAndUpdate(id,userData,)
})

//inggest function to delete
export const syncUserDeletion=inngest.createFunction({
    id:'delete-user-with-clerk'
    
},
{event:'clerk/user.deleted'},
async({event})=>{
    const { id,first_name,last_name,email_adresses,image_url}= event.data
    const userData={
        _id:id,
        email:email_adresses[0].email_address,
        name:first_name+ ''+last_name,
        imageUrl:image_url
    
    }
    await connectDb()
    await User.findByIdAndDelete(id)
}
)