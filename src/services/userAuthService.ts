export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UserLoginCredentials {
  email: string;
  password: string;
}

export class UserAuthService {
  private static readonly USER_EMAIL = "usuario@gmail.com";
  private static readonly USER_PASSWORD = "123456";
  private static readonly AUTH_KEY = "drive_mental_user_auth";

  static async login(credentials: UserLoginCredentials): Promise<User> {
    // Simula delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === this.USER_EMAIL && credentials.password === this.USER_PASSWORD) {
      const user: User = {
        id: "user-001",
        email: this.USER_EMAIL,
        name: "Usuário Drive Mental",
        role: "user"
      };

      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      return user;
    }

    throw new Error("Credenciais inválidas");
  }

  static logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  static getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}