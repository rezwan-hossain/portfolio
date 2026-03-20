import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation"


export async function getCheckoutData(packageId: number) {
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
    console.error("Failed to fetch checkout data:", error);
    return { package: null, error: "Failed to fetch checkout data" };
  }
}