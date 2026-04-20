"use server";

import { prisma } from "@/lib/prisma";

export interface OnboardingFormData {
  programName: string;
  orgName: string;
  orgDescription: string;
  brandNames: string;
  projectScope: string;
  currentUserId?: string | null;
  signupEmail?: string | null;
}

export async function saveOnboardingData(data: OnboardingFormData) {
  const orgName =
    data.orgName.trim() || data.programName.trim() || "My Organization";

  const org = await prisma.organization.create({
    data: { name: orgName, logo: orgName.charAt(0).toUpperCase() },
  });

  let userEmail: string | null = null;

  if (data.currentUserId) {
    const updated = await prisma.user.update({
      where: { id: data.currentUserId },
      data: { organizationId: org.id },
    });
    userEmail = updated.email;
  } else if (data.signupEmail) {
    const email = data.signupEmail.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { organizationId: org.id },
      });
    } else {
      const name = email.split("@")[0].replace(/[._]/g, " ");
      const initials =
        name
          .split(" ")
          .map((p) => p.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("") || "??";

      await prisma.user.create({
        data: {
          email,
          name: name.replace(/\b\w/g, (c) => c.toUpperCase()) || email,
          role: "Admin",
          roleLabel: "Admin (Internal)",
          status: "active",
          initials,
          organizationId: org.id,
        },
      });
    }
    userEmail = email;
  }

  return {
    success: true,
    organizationId: org.id,
    orgName: org.name,
    userEmail,
  };
}
