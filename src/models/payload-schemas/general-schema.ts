import z from "zod";


// UUID parameter validation (for path params)
export const uuidParamSchema = z.object({
    id: z.string({
        required_error: "ID is required",
    }).uuid("ID must be a valid UUID")
});