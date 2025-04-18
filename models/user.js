import mongoose from "mongoose";


const userShema=new mongoose.Schema({
    _id:{type:String, required:ture},
    name:{type:String, required:ture},
    email:{type:String, required:ture,unique:true},
    imageUrl:{type:String, required:ture},
    cartIteams:{type:Object, dafault:{}},

},{minimize:false})

const User=mongoose.model.user||mongoose.model('user',userShema)
export default User