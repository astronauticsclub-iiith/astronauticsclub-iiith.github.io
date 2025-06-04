import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
    };
  }

  interface User {
    id?: string;
    email?: string;
    name?: string;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[];
  }
}