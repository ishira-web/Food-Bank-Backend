import mongoose from "mongoose";

const reservationSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    numberOfAdults: { type: Number, required: true },
    numberOfChildren: { type: Number, required: true },
    reservedDate: { type: Date, required: true }, 
    reservedTime: { type: String, required: true }, 
    resStatus: { type: String,default: "pending", enum: ["pending", "accepted", "rejected"]},
    specialNote :{type: String}
});

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;