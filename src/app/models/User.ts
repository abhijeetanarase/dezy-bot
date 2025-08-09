import mongoose from "mongoose";


const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true  , select : false},
        age : { type: Number, default: 0 , required: true },
        phone: { type: String, default: 'required true' },
        reasonOfVisit: { type: String, default: 'required true' },
     },
    { timestamps: true }
)

export default mongoose.models.User || mongoose.model("User", UserSchema);