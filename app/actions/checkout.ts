"use server";

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
if (!pkg) return { package: null, error: "Package not found" };

  

    return { package: JSON.parse(JSON.stringify(pkg)) };

  } catch (error) {
    console.error("Failed to fetch checkout data:", error);
    return { package: null, error: "Failed to fetch checkout data" };
  }
}

// export async function placeOrder(formData){
//     console.log("Placing order with data:", formData);

//     try {
//         const supabase = await createClient();
//         const {
//             data: { user },
//         } = await supabase.auth.getUser();

//         if (!user) {
//             return { error: "You must be logged in to place an order" };
//         }
//     } catch (error) {
//         console.error("Error placing order:", error);
//         return { error: "Failed to place order. Please try again." };
//     }
// }

export async function placeOrder(formData: {
  packageId: number;
  eventId: string;
  qty: number;
  fullName: string;
  phone: string;
  gender: string;
  birthDate: string;
  ageCategory: string;
  bloodGroup: string;
  tshirtSize: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  communityName?: string;
  runnerCategory: string;
  paymentMethod: string;
}) {

    console.log("Step 1: Creating supabase client...");
  const supabase = await createClient();
  console.log("Step 2: Getting user...");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Step 2 done, user:", user?.id);


  if (!user) {
    return { error: "You must be logged in to place an order" };
  }

  try {
    console.log("Step 3: Finding DB user...");

    // Get user from DB
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
    });

    console.log("Step 3 done, dbUser:", dbUser?.id);


    if (!dbUser) {
      return { error: "User not found" };
    }

    // Get package to verify price and availability
    const pkg = await prisma.package.findUnique({
      where: { id: formData.packageId },
    });

    if (!pkg) {
      return { error: "Package not found" };
    }

    const slotsLeft = pkg.availableSlots - pkg.usedSlots;
    if (slotsLeft < formData.qty) {
      return { error: `Only ${slotsLeft} slots remaining` };
    }

    // Create order with registration and payment in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: dbUser.id,
          packageId: formData.packageId,
          eventId: formData.eventId,
          qty: formData.qty,
          status: "PENDING",
        },
      });

      // Create registration
      await tx.registration.create({
        data: {
          orderId: newOrder.id,
          fullName: formData.fullName,
          phone: formData.phone.trim(),
          gender: formData.gender,
          birthDate: new Date(formData.birthDate),
          ageCategory: formData.ageCategory,
          bloodGroup: formData.bloodGroup,
          tshirtSize: formData.tshirtSize,
          emergencyContactName: formData.emergencyContactName || null,
          emergencyContactNumber: formData.emergencyContactNumber || null,
          communityName: formData.communityName || null,
          runnerCategory: formData.runnerCategory,
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: Number(pkg.price) * formData.qty,
          currency: "BDT",
          status: "PENDING",
          paymentMethod: formData.paymentMethod,
        },
      });

      // Update used slots
      await tx.package.update({
        where: { id: formData.packageId },
        data: {
          usedSlots: { increment: formData.qty },
        },
      });

      return newOrder;
    });

    return { success: true, orderId: order.id, amount: Number(pkg.price) * formData.qty };
  } catch (error) {
    console.error("Failed to place order:", error);
    return { error: "Failed to place order. Please try again." };
  }
}