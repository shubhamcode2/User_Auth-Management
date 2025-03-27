import mongoose from "mongoose";


const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,  //this is the user who is subscribing
        ref: "User",
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,  //this is the user who is being subscribed
        ref: "User",
    },
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription