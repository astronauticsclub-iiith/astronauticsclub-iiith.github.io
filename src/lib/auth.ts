import { getServerSession, NextAuthOptions } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { IUser } from "@/models/User";

interface ExtendedSession {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: 'admin' | 'writer' | 'none';
  };
}

const authOptions: NextAuthOptions = {
  providers: [],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getAuthSession(): Promise<ExtendedSession | null> {
  return await getServerSession(authOptions) as ExtendedSession | null;
}

export async function requireAuth(): Promise<{ session: ExtendedSession; user: IUser }> {
  const session = await getAuthSession();
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  
  if (!user) {
    throw new Error("User not found in database");
  }
  
  return { session, user };
}

export async function requireRole(role: 'admin' | 'writer' | 'none'): Promise<{ session: ExtendedSession; user: IUser }> {
  const { session, user } = await requireAuth();
  
  if (user.role !== role) {
    throw new Error(`${role.charAt(0).toUpperCase() + role.slice(1)} access required`);
  }
  
  return { session, user };
}

export async function requireAnyRole(roles: ('admin' | 'writer' | 'none')[]): Promise<{ session: ExtendedSession; user: IUser }> {
  const { session, user } = await requireAuth();
  
  const hasRequiredRole = roles.some(r => user.role === r);
  if (!hasRequiredRole) {
    throw new Error(`One of the following roles required: ${roles.join(', ')}`);
  }
  
  return { session, user };
}

export async function requireAdmin(): Promise<{ session: ExtendedSession; user: IUser }> {
  return requireRole('admin');
}

export async function requireWriter(): Promise<{ session: ExtendedSession; user: IUser }> {
  const { session, user } = await requireAuth();
  if (user.role !== 'writer' && user.role !== 'admin') {
    throw new Error("Writer or Admin access required");
  }
  return { session, user };
}