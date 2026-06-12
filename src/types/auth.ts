export type AuthUserType = "admin" | "employee";
export type UserRole = "admin" | "manager" | "cashier";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  type: AuthUserType;
  role: UserRole;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: AuthUser;
}
