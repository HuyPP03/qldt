export interface CreateAbsentRequest {
  token: string;
  classId: string;
  date: string;
  reason: string;
  title: string;
  file: any; // File minh chung
}

export interface CreateAbsentResponse {
  data: {
    absence_request_id?: string;
    reason?: string;
    date?: string;
    token?: string;
    classId?: string;
  };
  meta: {
    code: string;
    message: string;
  };
}
