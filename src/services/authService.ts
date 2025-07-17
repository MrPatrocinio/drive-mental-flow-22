export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  private static readonly ADMIN_EMAIL = "dppsoft@gmail.com";
  private static readonly ADMIN_PASSWORD = "123456";
  private static readonly AUTH_KEY = "drive_mental_admin_auth";

  static async login(credentials: LoginCredentials): Promise<AdminUser> {
    // Simula delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === this.ADMIN_EMAIL && credentials.password === this.ADMIN_PASSWORD) {
      const adminUser: AdminUser = {
        id: "admin-001",
        email: this.ADMIN_EMAIL,
        name: "Administrador Drive Mental",
        role: "admin"
      };

      localStorage.setItem(this.AUTH_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    throw new Error("Credenciais inválidas");
  }

  static logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  static getCurrentUser(): AdminUser | null {
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