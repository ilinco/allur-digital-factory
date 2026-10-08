import { api } from "../axios";
import { tokenStorage } from "../tokenStorage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/auth/register",
      credentials,
      {
        headers: { Authorization: false },
      },
    );

    if (typeof data?.token !== "string" || !data.token.trim()) {
      throw new Error("Сервер не вернул токен авторизации");
    }

    tokenStorage.set(data.token);
    return data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials, {
      headers: { Authorization: false },
    });

    if (typeof data?.token !== "string" || !data.token.trim()) {
      throw new Error("Сервер не вернул токен авторизации");
    }

    tokenStorage.set(data.token);
    return data;
  },

  logout(): void {
    tokenStorage.clear();
  },

  getToken(): string | null {
    return tokenStorage.get();
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },
};
