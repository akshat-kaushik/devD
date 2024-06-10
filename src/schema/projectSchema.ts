import {z} from "zod";

export const projectSchema =z.object({
    title: z.string().min(3, "Title must be of min 3 characters"),
    description: z.string().min(10, "Description must be of min 10 characters"),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
})