import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const payload = getPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const roleDef = await prisma.roleDefinition.findUnique({
    where: { name: user.role },
    include: {
      rolePermissions: { include: { permission: true } },
    },
  });

  const permissions = roleDef?.rolePermissions.map((rp) => rp.permission.action) ?? [];

  return NextResponse.json({ user, permissions });
}
