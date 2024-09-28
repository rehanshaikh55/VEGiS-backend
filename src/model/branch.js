import mongoose from "mongoose";
import { DeliveryPartner } from "./user.js";

const branchSchema = new mongoose.Schema({
    name: {
      type: String,
      required:true
    },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
      address: {
        type: String,
      },
      DeliveryPartners:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DeliveryPartner"
      }]
  });
  export const Branch = mongoose.model("Branch",branchSchema)

 