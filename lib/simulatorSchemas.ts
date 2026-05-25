import { z } from "zod";

export const invoiceFormSchema = z.object({
  customerId: z.string().min(1, "Choose a customer"),
  invoiceNumber: z.string().min(1, "Enter an invoice number"),
  lineItem: z.string().min(2, "Enter a line item"),
  amount: z.coerce.number().positive("Amount must be greater than zero")
});

export const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, "Choose an invoice"),
  paymentAccount: z.string().min(1, "Choose a payment account"),
  amount: z.coerce.number().positive("Amount must be greater than zero")
});

export const expenseFormSchema = z.object({
  payeeId: z.string().min(1, "Choose a payee"),
  paymentAccount: z.string().min(1, "Choose a payment account"),
  category: z.string().min(1, "Choose a category"),
  amount: z.coerce.number().positive("Amount must be greater than zero")
});

export const bankRuleSchema = z.object({
  ruleName: z.string().min(2, "Name the rule"),
  condition: z.string().min(2, "Add a matching condition"),
  category: z.string().min(1, "Choose a category")
});

export const payrollEmployeeSchema = z.object({
  firstName: z.string().min(1, "Enter a first name"),
  lastName: z.string().min(1, "Enter a last name"),
  payRate: z.coerce.number().positive("Pay rate must be greater than zero")
});

export const reportFilterSchema = z.object({
  reportPeriod: z.string().min(1, "Choose a report period"),
  accountingBasis: z.enum(["cash", "accrual"])
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
export type BankRuleValues = z.infer<typeof bankRuleSchema>;
export type PayrollEmployeeValues = z.infer<typeof payrollEmployeeSchema>;
export type ReportFilterValues = z.infer<typeof reportFilterSchema>;
