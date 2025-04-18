import mongoose from "mongoose";


const userShema=new mongoose.Schema({
    _id:{type:String, required:true},
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    imageUrl:{type:String, required:true},
    cartIteams:{type:Object, dafault:{}},

},{minimize:false})

const User=mongoose.model.user||mongoose.model('user',userShema)
export default User