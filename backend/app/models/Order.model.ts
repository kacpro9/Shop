import { Schema, model, Document } from "mongoose";
import { IPart } from "./Part.model";
import { IUser } from "./User.model";

export interface IOrder extends Document {
  user: IUser["_id"];
  parts: {
    part: IPart["_id"];
    quantity: number;
  }[];
  totalPrice: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  estimatedFulfillmentDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderPartSchema = new Schema(
  {
    part: { type: Schema.Types.ObjectId, ref: "Part", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parts: { type: [OrderPartSchema], required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    estimatedFulfillmentDays: { type: Number, required: false },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
