import { getUser, unauthorizedResponse } from "@/lib/auth-session";

export async function GET() {
  const user = await getUser();

  if (!user) {
    return unauthorizedResponse();
  }

  return Response.json({ user });
}
