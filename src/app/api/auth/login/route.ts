import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      organization: {
        include: { subOrganizations: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "no matching account" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: user.roleLabel,
      initials: user.initials,
      subtitle: user.subtitle,
      avatarUrl: user.avatarUrl,
    },
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      logo: user.organization.logo,
    },
    subOrganizations: user.organization.subOrganizations.map((s) => ({
      id: s.id,
      name: s.name,
      count: s.count,
    })),
  });
}
