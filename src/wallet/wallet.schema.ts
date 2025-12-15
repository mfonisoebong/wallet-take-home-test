import z from "zod";

export const FundSchema = z.object({
  amount: z
    .number({
      invalid_type_error: "Amount must be a number",
      required_error: "Amount is required",
    })
    .positive("Amount must be a positive number"),
  walletId: z.string({
    required_error: "Wallet ID is required",
    invalid_type_error: "Wallet ID must be a string",
  }),
});

export const TransferSchema = z
  .object({
    amount: z
      .number({
        invalid_type_error: "Amount must be a number",
        required_error: "Amount is required",
      })
      .positive("Amount must be a positive number"),
    from: z.string({
      required_error: "From Wallet ID is required",
      invalid_type_error: "From Wallet ID must be a string",
    }),
    to: z.string({
      required_error: "To Wallet ID is required",
      invalid_type_error: "To Wallet ID must be a string",
    }),
  })
  .refine((data) => data.from !== data.to, {
    message: "From and To Wallet IDs must be different",
  });

export type FundSchemaType = z.infer<typeof FundSchema>;
export type TransferSchemaType = z.infer<typeof TransferSchema>;
