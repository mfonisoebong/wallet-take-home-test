import crypto from "crypto";
import { STATUS_CODE } from "@/enums/status-codes";

type HttpResponseParams = {
  message?: string;
  data?: any;
  code?: STATUS_CODE;
};

export type HttpResponse<T = any> = {
  statusCode: STATUS_CODE;
  data: T;
  message: string;
};

export const httpResponse = ({
  code = STATUS_CODE.OK,
  data = null,
  message = "Request made",
}: HttpResponseParams): HttpResponse => {
  return {
    statusCode: code,
    data,
    message,
  };
};

export const paginatedData = (query, total: number) => {
  const page = query.page || 1;
  const limit = query.limit ? parseInt(query.limit) : 12;
  const skip = (page - 1) * limit;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page < lastPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    currentPage: page,
    perPage: limit,
    skip,
    lastPage,
    nextPage,
    prevPage,
    from: skip + 1,
    to: skip + (total > limit ? limit : total),
  };
};

export const currencyFormatter = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

export const errorParser = (error: unknown): string => {
  const DEFAULT_ERROR = "An error occured";

  if (error instanceof Error) {
    return error.message;
  }

  return DEFAULT_ERROR;
};

export const generateTransactionReference = (): string =>
  `TX-${crypto.randomBytes(4).toString("hex")}`;
