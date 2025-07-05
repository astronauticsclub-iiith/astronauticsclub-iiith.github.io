import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'admin' | 'writer' | 'none';
    };
  }

  interface User {
    id?: string;
    email?: string;
    name?: string;
    role?: 'admin' | 'writer' | 'none';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: 'admin' | 'writer' | 'none';
  }
}