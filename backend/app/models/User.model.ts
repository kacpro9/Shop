import { Schema, model, Document } from "mongoose";
import { validateNip } from "../utils/validateNip";

interface IAddress {
  street: string;
  suite?: string;
  city: string;
  zipcode: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  companyName?: string;
  nip?: string;
  email: string;
  password: string;
  role: "admin" | "user";
  address?: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  suite: { type: String },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String },
    nip: {
      type: String,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return validateNip(v);
        },
        message: "Invalid NIP number",
      },
    },
    email: { type: String, required: true, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    address: { type: AddressSchema },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
