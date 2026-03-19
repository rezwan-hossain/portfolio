// prisma/seed.ts
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── ORGANIZERS ───────────────────────────────────
  const organizer1 = await prisma.organizer.create({
    data: {
      name: "Dhaka Runners Club",
      email: "info@dhakarunners.com",
      phone: "+8801711000001",
      logo: "https://placehold.co/200x200/4F46E5/white?text=DRC",
      isActive: true,
    },
  });

  const organizer2 = await prisma.organizer.create({
    data: {
      name: "Bengal Marathon Foundation",
      email: "contact@bengalmarathon.org",
      phone: "+8801711000002",
      logo: "https://placehold.co/200x200/DC2626/white?text=BMF",
      isActive: true,
    },
  });

  const organizer3 = await prisma.organizer.create({
    data: {
      name: "Chittagong Sports Alliance",
      email: "hello@ctgsports.com",
      phone: "+8801711000003",
      logo: "https://placehold.co/200x200/059669/white?text=CSA",
      isActive: true,
    },
  });

  console.log("✅ Organizers created");

  // ─── EVENTS ───────────────────────────────────────
  const event1 = await prisma.event.create({
    data: {
      name: "Dhaka City Marathon 2025",
      slug: "dhaka-city-marathon-2025",
      date: new Date("2025-09-15"),
      time: new Date("2025-09-15T06:00:00"),
      address: "Hatirjheel, Dhaka, Bangladesh",
      eventType: "LIVE",
      organizerId: organizer1.id,
      description:
        "Join the biggest marathon event in Dhaka! Run through the scenic Hatirjheel waterfront and experience the energy of thousands of runners. Categories available for all fitness levels from 5K fun run to full 42K marathon. Medals, t-shirts, and refreshments included for all participants.",
      bannerImage: "https://placehold.co/1200x600/4F46E5/white?text=Dhaka+Marathon+2025",
      thumbImage: "https://placehold.co/400x300/4F46E5/white?text=Dhaka+Marathon",
      minPackagePrice: 500,
      status: "ACTIVE",
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: "Sundarbans Trail Run 2025",
      slug: "sundarbans-trail-run-2025",
      date: new Date("2025-10-20"),
      time: new Date("2025-10-20T05:30:00"),
      address: "Khulna Division, Sundarbans, Bangladesh",
      eventType: "LIVE",
      organizerId: organizer2.id,
      description:
        "Experience the thrill of running through the world's largest mangrove forest! This unique trail run takes you along safe, scenic routes near the Sundarbans. A once-in-a-lifetime running experience combining fitness with nature exploration. Limited slots available.",
      bannerImage: "https://placehold.co/1200x600/059669/white?text=Sundarbans+Trail+Run",
      thumbImage: "https://placehold.co/400x300/059669/white?text=Sundarbans+Trail",
      minPackagePrice: 1000,
      status: "ACTIVE",
    },
  });

  const event3 = await prisma.event.create({
    data: {
      name: "Chittagong Coastal Run 2025",
      slug: "chittagong-coastal-run-2025",
      date: new Date("2025-11-10"),
      time: new Date("2025-11-10T06:30:00"),
      address: "Patenga Beach, Chittagong, Bangladesh",
      eventType: "LIVE",
      organizerId: organizer3.id,
      description:
        "Run along the beautiful Chittagong coastline! Feel the ocean breeze as you race through Patenga Beach and the scenic coastal roads. Perfect for beginners and seasoned runners alike. Post-race beach party included!",
      bannerImage: "https://placehold.co/1200x600/0284C7/white?text=Coastal+Run+2025",
      thumbImage: "https://placehold.co/400x300/0284C7/white?text=Coastal+Run",
      minPackagePrice: 600,
      status: "ACTIVE",
    },
  });

  const event4 = await prisma.event.create({
    data: {
      name: "Virtual Independence Run 2025",
      slug: "virtual-independence-run-2025",
      date: new Date("2025-12-16"),
      time: new Date("2025-12-16T07:00:00"),
      address: "Virtual - Run Anywhere in Bangladesh",
      eventType: "VIRTUAL",
      organizerId: organizer1.id,
      description:
        "Celebrate Victory Day with a virtual run! Run anywhere, anytime on December 16th. Track your run using any GPS app and submit your results. Finisher medals and t-shirts will be shipped to your address. Unite the nation through running!",
      bannerImage: "https://placehold.co/1200x600/DC2626/white?text=Independence+Run",
      thumbImage: "https://placehold.co/400x300/DC2626/white?text=Independence+Run",
      minPackagePrice: 400,
      status: "ACTIVE",
    },
  });

  const event5 = await prisma.event.create({
    data: {
      name: "Old Dhaka Heritage Run 2025",
      slug: "old-dhaka-heritage-run-2025",
      date: new Date("2025-08-25"),
      time: new Date("2025-08-25T05:00:00"),
      address: "Ahsan Manzil, Old Dhaka, Bangladesh",
      eventType: "LIVE",
      organizerId: organizer2.id,
      description:
        "Discover the rich history of Old Dhaka on foot! This heritage run takes you past iconic landmarks including Ahsan Manzil, Lalbagh Fort, and Star Mosque. A unique blend of fitness and cultural exploration. Early morning start to beat the heat.",
      bannerImage: "https://placehold.co/1200x600/B45309/white?text=Heritage+Run+2025",
      thumbImage: "https://placehold.co/400x300/B45309/white?text=Heritage+Run",
      minPackagePrice: 700,
      status: "ACTIVE",
    },
  });

  console.log("✅ Events created");

  // ─── PACKAGES ─────────────────────────────────────

  // Dhaka City Marathon packages
  await prisma.package.createMany({
    data: [
      {
        name: "5K Fun Run",
        distance: "5K",
        price: 500,
        availableSlots: 500,
        usedSlots: 12,
        eventId: event1.id,
        status: "ACTIVE",
      },
      {
        name: "10K Challenge",
        distance: "10K",
        price: 800,
        availableSlots: 300,
        usedSlots: 8,
        eventId: event1.id,
        status: "ACTIVE",
      },
      {
        name: "Half Marathon",
        distance: "21K",
        price: 1200,
        availableSlots: 200,
        usedSlots: 5,
        eventId: event1.id,
        status: "ACTIVE",
      },
      {
        name: "Full Marathon",
        distance: "42K",
        price: 1800,
        availableSlots: 100,
        usedSlots: 3,
        eventId: event1.id,
        status: "ACTIVE",
      },
    ],
  });

  // Sundarbans Trail Run packages
  await prisma.package.createMany({
    data: [
      {
        name: "Trail Explorer",
        distance: "10K",
        price: 1000,
        availableSlots: 150,
        usedSlots: 20,
        eventId: event2.id,
        status: "ACTIVE",
      },
      {
        name: "Trail Warrior",
        distance: "21K",
        price: 1500,
        availableSlots: 100,
        usedSlots: 10,
        eventId: event2.id,
        status: "ACTIVE",
      },
      {
        name: "Ultra Trail",
        distance: "42K",
        price: 2500,
        availableSlots: 50,
        usedSlots: 2,
        eventId: event2.id,
        status: "ACTIVE",
      },
    ],
  });

  // Chittagong Coastal Run packages
  await prisma.package.createMany({
    data: [
      {
        name: "Beach Fun Run",
        distance: "5K",
        price: 600,
        availableSlots: 400,
        usedSlots: 15,
        eventId: event3.id,
        status: "ACTIVE",
      },
      {
        name: "Coastal Challenge",
        distance: "10K",
        price: 900,
        availableSlots: 250,
        usedSlots: 7,
        eventId: event3.id,
        status: "ACTIVE",
      },
      {
        name: "Coastal Half Marathon",
        distance: "21K",
        price: 1400,
        availableSlots: 150,
        usedSlots: 4,
        eventId: event3.id,
        status: "ACTIVE",
      },
    ],
  });

  // Virtual Independence Run packages
  await prisma.package.createMany({
    data: [
      {
        name: "Victory 5K",
        distance: "5K",
        price: 400,
        availableSlots: 1000,
        usedSlots: 50,
        eventId: event4.id,
        status: "ACTIVE",
      },
      {
        name: "Victory 10K",
        distance: "10K",
        price: 600,
        availableSlots: 500,
        usedSlots: 25,
        eventId: event4.id,
        status: "ACTIVE",
      },
      {
        name: "Victory Half Marathon",
        distance: "21K",
        price: 900,
        availableSlots: 300,
        usedSlots: 10,
        eventId: event4.id,
        status: "ACTIVE",
      },
    ],
  });

  // Old Dhaka Heritage Run packages
  await prisma.package.createMany({
    data: [
      {
        name: "Heritage Walk & Run",
        distance: "5K",
        price: 700,
        availableSlots: 300,
        usedSlots: 18,
        eventId: event5.id,
        status: "ACTIVE",
      },
      {
        name: "Heritage 10K",
        distance: "10K",
        price: 1000,
        availableSlots: 200,
        usedSlots: 9,
        eventId: event5.id,
        status: "ACTIVE",
      },
      {
        name: "Heritage Half Marathon",
        distance: "21K",
        price: 1500,
        availableSlots: 100,
        usedSlots: 3,
        eventId: event5.id,
        status: "ACTIVE",
      },
    ],
  });

  console.log("✅ Packages created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });