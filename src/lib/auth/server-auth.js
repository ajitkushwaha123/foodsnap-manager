import { auth } from "@clerk/nextjs/server";

export const serverAuthData = async () => {
  const { userId, orgId, sessionId } = await auth();

  return {
    userId,
    orgId,
    sessionId,
    isAuthenticated: !!userId,
  };
};
