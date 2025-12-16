import { Schema, model, Document } from "mongoose";

export interface IPart extends Document {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  dateOfDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const PartSchema = new Schema<IPart>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    dateOfDelivery: { type: Date },
  },
  { timestamps: true }
);

export const Part = model<IPart>("Part", PartSchema);
