interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

const defaultOptions: RequestOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (options.params) {
      const queryParams = new URLSearchParams(options.params).toString();
      url = `${url}${url.includes("?") ? "&" : "?"}${queryParams}`;
    }

    if (finalOptions.body) {
      if (finalOptions.headers["Content-Type"] !== "application/json") {
        finalOptions.body = finalOptions.body;
      } else {
        finalOptions.body = JSON.stringify(finalOptions.body);
      }
    }

    const response = await fetch(url, finalOptions);

    const contentType = response.headers.get("Content-Type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    if (error && typeof error === "object") {
      throw error;
    }
    throw error;
  }
}

export default request;
