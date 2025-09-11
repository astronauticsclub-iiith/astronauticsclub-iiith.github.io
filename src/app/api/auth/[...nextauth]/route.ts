import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { parseStringPromise } from "xml2js";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { withBasePath } from "@/components/common/HelperFunction";

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'admin' | 'writer' | 'none';
}

// Define the CAS attributes interface
interface CASAttributes {
  "cas:clientIpAddress"?: string[];
  "cas:E-Mail"?: string[];
  "cas:isFromNewLogin"?: string[];
  "cas:authenticationDate"?: string[];
  "cas:FirstName"?: string[];
  "cas:successfulAuthenticationHandlers"?: string[];
  "cas:userAgent"?: string[];
  "cas:Name"?: string[];
  "cas:credentialType"?: string[];
  "cas:samlAuthenticationStatementAuthMethod"?: string[];
  "cas:uid"?: string[];
  "cas:authenticationMethod"?: string[];
  "cas:serverIpAddress"?: string[];
  "cas:longTermAuthenticationRequestTokenUsed"?: string[];
  "cas:LastName"?: string[];
}

interface CASResponse {
  "cas:serviceResponse"?: {
    "cas:authenticationSuccess"?: [
      {
        "cas:user": string[];
        "cas:attributes": [CASAttributes];
      }
    ];
    "cas:authenticationFailure"?: [
      {
        _: string;
        $: { code: string };
      }
    ];
  };
}

// Create the auth configuration
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "IIIT CAS",
      credentials: {
        ticket: { label: "Ticket", type: "text" },
        service: { label: "Service", type: "text" },
      },
      async authorize(credentials) {
        console.log("=== CAS AUTHORIZATION STARTED ===");
        console.log("Credentials received:", { ticket: credentials?.ticket, service: credentials?.service });
        
        try {
          // Get the ticket from the credentials
          const ticket = credentials?.ticket;
          const service = credentials?.service || process.env.NEXTAUTH_URL;

          if (!ticket) {
            console.log("CAS Authorization - No ticket provided");
            throw new Error("No CAS ticket provided");
          }

          if (!service) {
            console.log("CAS Authorization - No service URL provided");
            throw new Error("No service URL provided");
          }

          // Use the service URL exactly as provided
          const validationUrl = `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(
            service
          )}`;
          console.log("Validating CAS ticket with URL:", validationUrl);

          // Validate the ticket with the CAS server
          const response = await fetch(validationUrl);
          const xmlResponse = await response.text();
          console.log("CAS XML Response:", xmlResponse);

          // Parse the XML response
          const result = (await parseStringPromise(xmlResponse)) as CASResponse;

          // Check for authentication failures first
          if (result["cas:serviceResponse"]?.["cas:authenticationFailure"]) {
            const failure =
              result["cas:serviceResponse"]["cas:authenticationFailure"][0];
            throw new Error(
              `CAS authentication failed: ${failure._ || failure.$.code}`
            );
          }

          const authSuccess =
            result["cas:serviceResponse"]?.["cas:authenticationSuccess"]?.[0];

          if (!authSuccess) {
            throw new Error("CAS authentication failed: No success response");
          }

          // Extract user information
          const username = authSuccess["cas:user"][0];
          const attributes = authSuccess["cas:attributes"]?.[0];

          if (!attributes) {
            throw new Error("No attributes found in CAS response");
          }

          const email =
            attributes["cas:E-Mail"]?.[0] || `${username}@iiit.ac.in`;
          const firstName = attributes["cas:FirstName"]?.[0] || username;
          const lastName = attributes["cas:LastName"]?.[0] || "";

          // Check if user exists in database and has appropriate role
          await connectToDatabase();
          const dbUser = await User.findOne({ email }).lean() as IUser | null;

          console.log("CAS Authentication - User lookup:", {
            email,
            dbUser: dbUser ? { email: dbUser.email, role: dbUser.role } : null
          });

          if (!dbUser) {
            // User not found in database - they shouldn't have access
            console.log("CAS Authentication - User not found in database:", email);
            return null;
          }

          const userObject = {
            id: username,
            email,
            name: firstName && lastName ? `${firstName} ${lastName}` : username,
            role: dbUser.role,
          };

          console.log("CAS Authentication - Returning user object:", userObject);

          // Return the user object with role information
          return userObject;
        } catch (error) {
          console.error("CAS Authentication Error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to the token
      if (user) {
        token.role = (user as ExtendedUser).role;
        console.log("JWT Callback - Adding role to token:", {
          userRole: (user as ExtendedUser).role,
          tokenRole: token.role
        });
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session
      if (token && session.user) {
        const user = session.user as ExtendedUser;
        user.role = token.role as 'admin' | 'writer' | 'none';
        console.log("Session Callback - Final session:", {
          userEmail: user.email,
          userRole: user.role,
          tokenRole: token.role
        });
      }
      return session;
    },
  },
  pages: {
    signIn: withBasePath(`/let-me-innn`),
    error: withBasePath(`/stay-away-snooper`),
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };