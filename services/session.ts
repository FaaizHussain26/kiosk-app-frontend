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

  const { data } = await api.post<UploadImageResponse>(
    `/session/${params.sessionId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};


