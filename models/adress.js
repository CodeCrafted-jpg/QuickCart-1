import mongoose from "mongoose";

const adressSchema = new mongoose.Schema({
    userId: { type: String, required: true, },
    fullName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    pincode: { type: Number, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
});

const Adress = mongoose.models.adress || mongoose.model('adress', adressSchema);

export default Adress;
