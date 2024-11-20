export class BaseResponse {
  data: Record<string, any>;
  meta: {
    code: number;
    message: string;
  };
}
