export class BaseResponse {
  data: Record<string, any>;
  meta: {
    code: number;
    message: string;
  };
}

export interface UserAccount {
  account_id: string;
  last_name: string;
  first_name: string;
  email: string;
}
