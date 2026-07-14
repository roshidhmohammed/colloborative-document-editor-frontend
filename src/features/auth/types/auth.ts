
/* ---------- Register ---------- */

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

/* ---------- Login ---------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token?: string;
}

export type LoginFormProps = {
  returnTo?: string;
};

/* ---------- User ---------- */

export interface User {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}