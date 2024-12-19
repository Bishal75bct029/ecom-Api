interface GetPaginatedResponseProps {
  count: number;
  limit: number;
  page: number;
}

export const getPaginatedResponse = ({ count, limit, page }: GetPaginatedResponseProps) => ({
  count,
  totalPage: Math.ceil(count / limit),
  currentPage: page,
  limit: limit,
});
