export enum AbsentStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export const TranslatedAbsentStatus = {
  [AbsentStatus.PENDING]: "Chờ xác nhận",
  [AbsentStatus.ACCEPTED]: "Đã chấp nhận",
  [AbsentStatus.REJECTED]: "Đã từ chối",
};

export interface StudentInfo {
  account_id: string;
  last_name: string;
  first_name: string;
  email: string;
  student_id: string;
}

export interface AbsentRequest {
  id: string;
  student_account: StudentInfo;
  absence_date: string;
  title: string;
  reason: string;
  status: AbsentStatus;
  file_url?: string;
}

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

export interface GetAbsentRequest {
  token: string;
  class_id: string;
  date?: string;
  status?: AbsentStatus;
  pageable_request?: {
    page: string;
    page_size: string;
  };
}

export interface GetAbsentResponse {
  data: {
    page_content: AbsentRequest[];
    page_info: {
      total_records: string;
      total_page: string;
      page_size: string;
      page: string;
      next_page: string;
      previous_page: string | null;
    };
  };
  meta: {
    code: string;
    message: string;
  };
}

export interface ReviewAbsentRequest {
  token: string;
  request_id: string;
  status: AbsentStatus;
}

export interface ReviewAbsentResponse {
  data: string;
  meta: {
    code: string;
    message: string;
  };
}

export interface GetStudentAbsentRequest {
  token: string;
  class_id: string;
  date?: string;
  status?: AbsentStatus;
  pageable_request?: {
    page: string;
    page_size: string;
  };
}

export interface GetStudentAbsentResponse {
  data: {
    page_content: AbsentRequest[];
    page_info: {
      total_records: string;
      total_page: string;
      page_size: string;
      page: string;
      next_page: string;
      previous_page: string | null;
    };
  };
  meta: {
    code: string;
    message: string;
  };
}
