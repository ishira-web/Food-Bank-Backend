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


export const confirmReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        
        if (!reservationId) {
            return res.status(400).json({ message: "Reservation ID is required" });
        }

        // Automatically set status to "accepted" without requiring it in the body
        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { resStatus: "accepted" }, // Hardcoded status
            { new: true, runValidators: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.status(200).json({
            message: "Reservation confirmed successfully",
            reservation: updatedReservation
        });

    } catch (error) {
        console.error("Error confirming reservation:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid reservation ID format" });
        }
        
        res.status(500).json({ 
            message: "Server error while confirming reservation",
            error: error.message 
        });
    }
};

export const getAllReservations = async (req, res) => {
    try {
        const { status, date, sort = '-createdAt', page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) filter.resStatus = status;
        if (date) filter.reservedDate = { $gte: new Date(date),$lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))};
        const skip = (page - 1) * limit;
        const reservations = await Reservation.find(filter).sort(sort).skip(skip).limit(Number(limit));
        const total = await Reservation.countDocuments(filter);
        const pages = Math.ceil(total / limit);
        res.status(200).json({message: "Reservations retrieved successfully",count: reservations.length, page: Number(page), pages, total, reservations});
    } catch (error) {
        console.error("Error getting reservations:", error);
        res.status(500).json({message: "Server error while retrieving reservations",error: error.message});
    }
};

export const rejectReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        if (!reservationId) { return res.status(400).json({ message: "Reservation ID is required" });}
        const rejectedReservation = await Reservation.findByIdAndUpdate(reservationId,{ resStatus: "rejected" },{ new: true });
        if (!rejectedReservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        res.status(200).json({
            message: "Reservation rejected successfully",
            reservation: rejectedReservation
        });
    } catch (error) {
        console.error("Error rejecting reservation:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid reservation ID format" });
        }
        res.status(500).json({ 
            message: "Server error while rejecting reservation",
            error: error.message 
        });
    }
};