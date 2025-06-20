import Reservation from "../UserModels/Reservation.js";

export const createReservation = async (req, res) => {
    try {
        const {fullName,email,phoneNumber,numberOfAdults,numberOfChildren,reservedDate,reservedTime,specialNote} = req.body;
        if (!fullName || !email || !phoneNumber || !numberOfAdults || !reservedDate || !reservedTime) {
            return res.status(400).json({ message: "Required fields are missing" });}
        const newReservation = new Reservation({
            fullName,
            email,
            phoneNumber,
            numberOfAdults: Number(numberOfAdults),
            numberOfChildren: Number(numberOfChildren) || 0,
            reservedDate: new Date(reservedDate),
            reservedTime,
            specialNote: specialNote || "",
        });
        const savedReservation = await newReservation.save();

        res.status(201).json({
            message: "Reservation created successfully",
            reservation: savedReservation
        });

    } catch (error) {
        console.error("Error creating reservation:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation error",
                details: error.errors 
            });
        }
        
        res.status(500).json({ 
            message: "Server error while creating reservation",
            error: error.message 
        });
    }
};