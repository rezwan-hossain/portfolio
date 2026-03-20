// app/actions/cart.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getPackageWithEvent(packageId: number) {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        event: {
          include: {
            organizer: true,
          },
        },
      },
    });

    return { package: pkg };
  } catch (error) {
    console.error("Failed to fetch package:", error);
    return { package: null, error: "Failed to fetch package" };
  }
}