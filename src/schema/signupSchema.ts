import { z } from "zod";

export const userNameSchema = z.string()
.min(3,"Username must be of min 3 characters")
.max(20,"Username must be of max 20 characters");

export const signUpSchema = z.object({
    username: userNameSchema,
    email: z.string().email({
        message: "Invalid email",
    }),
    password: z.string().min(8),
    confirmPassword: z.string()
    .min(8,{message:"Password must be of min 8 characters"}),
});