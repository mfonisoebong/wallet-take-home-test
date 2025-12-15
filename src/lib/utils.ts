import { STATUS_CODE } from "@/enums/status-codes";

type HttpResponseParams = {
  message?: string;
  data?: any;
  code?: STATUS_CODE;
};

export type HttpResponse<T = any> = {
  code: STATUS_CODE;
  data: T;
  message: string;
};

export const httpResponse = ({
  code = STATUS_CODE.OK,
  data = null,
  message = "Request made",
}: HttpResponseParams): HttpResponse => {
  return {
    code,
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
