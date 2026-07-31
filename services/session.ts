import { api } from "./api";

export interface CreateSessionResponse {
  token: string;
  status: string;
  kioskUrl: string;
  mobileUrl: string;
}

export const createSession = async (): Promise<CreateSessionResponse> => {
  const { data } = await api.post<CreateSessionResponse>("/session");
  return data;
};

export interface UploadImageResponse {
  message: string;
  status: string;
  imageUrl: string;
}

export const uploadSessionImage = async (params: {
  sessionId: string;
  file: File;
}): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("image", params.file);

  // Do not set Content-Type — the browser must add the multipart boundary.
  const { data } = await api.post<UploadImageResponse>(
    `/session/${params.sessionId}/image`,
    formData,
    {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120_000,
      transformRequest: [
        (payload, headers) => {
          if (typeof FormData !== "undefined" && payload instanceof FormData) {
            headers.delete?.("Content-Type");
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return payload;
        },
      ],
    },
  );

  return data;
};

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export const createPaymentIntent = async (
  sessionId: string,
): Promise<CreatePaymentIntentResponse> => {
  const { data } = await api.post<CreatePaymentIntentResponse>(
    `/session/${sessionId}/payment-intent`,
  );
  return data;
};

export const confirmPaymentOnServer = async (params: {
  sessionId: string;
  paymentIntentId: string;
}): Promise<{ status: string }> => {
  const { data } = await api.post<{ status: string }>(
    `/session/${params.sessionId}/payment-confirm`,
    {
      paymentIntentId: params.paymentIntentId,
    },
  );
  return data;
};

export const requestPrint = async (sessionId: string): Promise<void> => {
  await api.post(`/session/${sessionId}/print`);
};

/**
 * Send a rendered image (with filters baked in) to the backend for server-side
 * CUPS printing. This bypasses the browser print dialog entirely, allowing the
 * backend to auto-configure tray, media type, paper size, etc.
 */
export const requestPrintWithImage = async (params: {
  sessionId: string;
  imageBlob: Blob;
}): Promise<{ message: string; status: string }> => {
  const formData = new FormData();
  formData.append("image", params.imageBlob, "postcard.jpg");

  const { data } = await api.post<{ message: string; status: string }>(
    `/session/${params.sessionId}/print`,
    formData,
    {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120_000,
      transformRequest: [
        (payload, headers) => {
          if (typeof FormData !== "undefined" && payload instanceof FormData) {
            headers.delete?.("Content-Type");
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
          return payload;
        },
      ],
    },
  );

  return data;
};


