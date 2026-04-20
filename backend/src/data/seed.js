const bcrypt = require("bcryptjs");
const { User } = require("../models/user.model");
const { CarpenterProfile } = require("../models/carpenter-profile.model");
const { ContractorProfile } = require("../models/contractor-profile.model");
const { CustomerProfile } = require("../models/customer-profile.model");
const { Job } = require("../models/job.model");
const { Booking } = require("../models/booking.model");
const { AttendanceLog } = require("../models/attendance-log.model");
const { Offer } = require("../models/offer.model");
const { Payment } = require("../models/payment.model");
const { Review } = require("../models/review.model");

const DEMO_PASSWORD = "Demo@12345";
const ADMIN_PASSWORD = "Admin@12345";

const CONTRACTOR_CITIES = [
  { state: "Delhi", district: "New Delhi", city: "Delhi NCR", pincode: "110001", address: "Connaught Place" },
  { state: "Haryana", district: "Gurugram", city: "Gurugram", pincode: "122001", address: "Udyog Vihar" },
  { state: "Uttar Pradesh", district: "Gautam Buddha Nagar", city: "Noida", pincode: "201301", address: "Sector 62" },
  { state: "Rajasthan", district: "Jaipur", city: "Jaipur", pincode: "302001", address: "Vaishali Nagar" },
  { state: "Uttar Pradesh", district: "Lucknow", city: "Lucknow", pincode: "226010", address: "Gomti Nagar" },
  { state: "Karnataka", district: "Bengaluru Urban", city: "Bengaluru", pincode: "560001", address: "Indiranagar" },
  { state: "Tamil Nadu", district: "Chennai", city: "Chennai", pincode: "600001", address: "Velachery" },
  { state: "Telangana", district: "Hyderabad", city: "Hyderabad", pincode: "500001", address: "Madhapur" },
  { state: "Gujarat", district: "Ahmedabad", city: "Ahmedabad", pincode: "380001", address: "Prahlad Nagar" },
  { state: "Maharashtra", district: "Pune", city: "Pune", pincode: "411001", address: "Baner" }
];

const CARPENTER_SKILL_SETS = [
  ["Modular kitchen", "Wardrobe fitting", "Furniture assembly"],
  ["Polish", "Door fitting", "Window fitting"],
  ["Office furniture", "False ceiling woodwork", "Paneling"],
  ["Custom furniture", "Bed fitting", "TV unit"],
  ["Plywood cutting", "Laminate finish", "Cabinet fitting"]
];

const CUSTOMER_TYPES = ["homeowner", "builder", "shop_owner", "office_owner"];
const LANGUAGES = ["hi", "en", "ta", "kn"];

function contractorPlan(index) {
  if (index <= 3) return "pro";
  if (index <= 7) return "standard";
  return "basic";
}

function carpenterPlan(index) {
  if (index <= 20) return "pro";
  if (index <= 70) return "standard";
  return "basic";
}

function customerPlan(index) {
  if (index <= 2) return "pro";
  if (index <= 4) return "standard";
  return "basic";
}

function billingCycleForPlan(plan) {
  return plan === "pro" ? "yearly" : "monthly";
}

function isBcryptHash(value) {
  return typeof value === "string" && value.startsWith("$2");
}

function numberLabel(value, size = 2) {
  return String(value).padStart(size, "0");
}

function dicebearUrl(seed, backgroundColor = "8b5e3c", textColor = "fffaf4") {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}&textColor=${textColor}`;
}

function contractorSeed(index) {
  const city = CONTRACTOR_CITIES[index - 1];
  const plan = contractorPlan(index);
  return {
    key: `contractor${numberLabel(index)}`,
    fullName: `Thekedar ${numberLabel(index)}`,
    email: `contractor${numberLabel(index)}@kaamkacarpenter.com`,
    mobile: `9000000${String(index).padStart(3, "0")}`,
    role: "contractor",
    status: "active",
    language: LANGUAGES[index % LANGUAGES.length],
    selectedPlan: plan,
    billingCycle: billingCycleForPlan(plan),
    companyName: `BuildEdge ${city.city} Projects`,
    contactPerson: `Site Manager ${numberLabel(index)}`,
    profileType: index % 2 === 0 ? "company" : "individual",
    businessLocation: city,
    profilePhotoUrl: dicebearUrl(`contractor-${index}`, "c89b6d", "2b221c"),
    bio: `${city.city} me interior aur carpentry workforce handle karne wale verified thekedar.`
  };
}

function carpenterSeed(index) {
  const city = CONTRACTOR_CITIES[(index - 1) % CONTRACTOR_CITIES.length];
  const skills = CARPENTER_SKILL_SETS[(index - 1) % CARPENTER_SKILL_SETS.length];
  const plan = carpenterPlan(index);
  const backgroundColor = index % 2 === 0 ? "c89b6d" : "8b5e3c";
  const textColor = index % 2 === 0 ? "2b221c" : "fffaf4";

  return {
    key: `carpenter${numberLabel(index, 3)}`,
    fullName: `Karigar ${numberLabel(index, 3)}`,
    email: `carpenter${numberLabel(index, 3)}@kaamkacarpenter.com`,
    mobile: `910${String(index).padStart(7, "0")}`,
    role: "carpenter",
    status: index % 11 === 0 ? "pending" : "active",
    language: LANGUAGES[index % LANGUAGES.length],
    selectedPlan: plan,
    billingCycle: billingCycleForPlan(plan),
    experienceYears: 2 + (index % 11),
    skills,
    availabilityStatus: index % 5 === 0 ? "busy" : "available",
    currentLocation: {
      state: city.state,
      district: city.district,
      city: city.city,
      pincode: city.pincode
    },
    kycStatus: index % 9 === 0 ? "pending" : "approved",
    totalEarnings: 12000 + index * 850,
    averageRating: Number((3.8 + (index % 10) * 0.1).toFixed(1)),
    profilePhotoUrl: dicebearUrl(`carpenter-${index}`, backgroundColor, textColor),
    bio: `${city.city} based skilled carpenter. ${skills.join(", ")} work me experienced.`,
    portfolioItems: [
      {
        mediaType: "image",
        url: `https://picsum.photos/seed/kkc-carpenter-${index}-1/800/600`,
        caption: `${skills[0]} sample`
      },
      {
        mediaType: "image",
        url: `https://picsum.photos/seed/kkc-carpenter-${index}-2/800/600`,
        caption: `${skills[1]} sample`
      }
    ],
    rateCard: {
      daily: 800 + (index % 8) * 100,
      halfDay: 500 + (index % 5) * 75,
      monthly: 18000 + (index % 10) * 2000,
      overtimePerHour: 120 + (index % 4) * 20
    }
  };
}

function customerSeed(index) {
  const city = CONTRACTOR_CITIES[(index + 2) % CONTRACTOR_CITIES.length];
  const plan = customerPlan(index);
  const type = CUSTOMER_TYPES[(index - 1) % CUSTOMER_TYPES.length];

  return {
    key: `customer${numberLabel(index)}`,
    fullName: `Customer ${numberLabel(index)}`,
    email: `customer${numberLabel(index)}@kaamkacarpenter.com`,
    mobile: `9200000${String(index).padStart(3, "0")}`,
    role: "customer",
    status: "active",
    language: LANGUAGES[(index + 1) % LANGUAGES.length],
    selectedPlan: plan,
    billingCycle: billingCycleForPlan(plan),
    profileType: type,
    address: {
      state: city.state,
      district: city.district,
      city: city.city,
      pincode: city.pincode,
      fullAddress: city.address
    },
    profilePhotoUrl: dicebearUrl(`customer-${index}`, "e7d6c4", "2b221c"),
    bio: `${city.city} me ${type.replaceAll("_", " ")} requirement ke liye verified karigar hire karne wale customer.`
  };
}

async function ensureUser(seed, passwordHash) {
  const user = await User.findOneAndUpdate(
    { email: seed.email },
    {
      fullName: seed.fullName,
      email: seed.email,
      mobile: seed.mobile,
      passwordHash,
      role: seed.role,
      status: seed.status,
      language: seed.language,
      selectedPlan: seed.selectedPlan,
      billingCycle: seed.billingCycle,
      planStatus: "active",
      planUpdatedAt: new Date(),
      profileCompleted: true,
      planHistory: [
        {
          plan: seed.selectedPlan,
          billingCycle: seed.billingCycle,
          status: "active",
          changedAt: new Date()
        }
      ]
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!isBcryptHash(user.passwordHash)) {
    user.passwordHash = passwordHash;
    await user.save();
  }

  return user;
}

async function ensureJob(seed) {
  return Job.findOneAndUpdate(
    { createdByUserId: seed.createdByUserId, title: seed.title },
    seed,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureBooking(seed) {
  return Booking.findOneAndUpdate(
    { bookedByUserId: seed.bookedByUserId, carpenterId: seed.carpenterId, jobId: seed.jobId || null, rateModel: seed.rateModel },
    seed,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureOffer(seed) {
  return Offer.findOneAndUpdate(
    { contractorId: seed.contractorId, carpenterId: seed.carpenterId, jobId: seed.jobId },
    seed,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensurePayment(seed) {
  return Payment.findOneAndUpdate(
    { bookingId: seed.bookingId, paymentType: seed.paymentType, payerUserId: seed.payerUserId, payeeUserId: seed.payeeUserId },
    seed,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureAttendance(seed) {
  return AttendanceLog.findOneAndUpdate(
    { bookingId: seed.bookingId, carpenterId: seed.carpenterId, date: seed.date },
    seed,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureReview(seed) {
  return Review.findOneAndUpdate(
    { bookingId: seed.bookingId, reviewerUserId: seed.reviewerUserId, revieweeUserId: seed.revieweeUserId },
    seed,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function ensureSeedData() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await ensureUser(
    {
      fullName: "Admin Manager",
      email: "admin@kaamkacarpenter.com",
      mobile: "9999999990",
      role: "admin",
      status: "active",
      language: "en",
      selectedPlan: "pro",
      billingCycle: "yearly"
    },
    adminHash
  );

  const contractorSeeds = Array.from({ length: 10 }, (_, index) => contractorSeed(index + 1));
  const carpenterSeeds = Array.from({ length: 100 }, (_, index) => carpenterSeed(index + 1));
  const customerSeeds = Array.from({ length: 6 }, (_, index) => customerSeed(index + 1));

  const contractorUsers = [];
  const carpenterUsers = [];
  const customerUsers = [];

  for (const seed of contractorSeeds) {
    contractorUsers.push(await ensureUser(seed, demoHash));
  }

  for (const seed of carpenterSeeds) {
    carpenterUsers.push(await ensureUser(seed, demoHash));
  }

  for (const seed of customerSeeds) {
    customerUsers.push(await ensureUser(seed, demoHash));
  }

  const contractorProfiles = new Map();
  const carpenterProfiles = new Map();
  const customerProfiles = new Map();

  for (let index = 0; index < contractorSeeds.length; index += 1) {
    const seed = contractorSeeds[index];
    const user = contractorUsers[index];
    const profile = await ContractorProfile.findOneAndUpdate(
      { userId: user._id },
      {
        profileType: seed.profileType,
        companyName: seed.companyName,
        contactPerson: seed.contactPerson,
        businessLocation: seed.businessLocation,
        profilePhotoUrl: seed.profilePhotoUrl,
        bio: seed.bio
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    contractorProfiles.set(seed.key, { user, profile, seed });
  }

  for (let index = 0; index < carpenterSeeds.length; index += 1) {
    const seed = carpenterSeeds[index];
    const user = carpenterUsers[index];
    const profile = await CarpenterProfile.findOneAndUpdate(
      { userId: user._id },
      {
        experienceYears: seed.experienceYears,
        bio: seed.bio,
        skills: seed.skills,
        currentLocation: seed.currentLocation,
        availabilityStatus: seed.availabilityStatus,
        kycStatus: seed.kycStatus,
        totalEarnings: seed.totalEarnings,
        averageRating: seed.averageRating,
        profilePhotoUrl: seed.profilePhotoUrl,
        portfolioItems: seed.portfolioItems,
        rateCard: seed.rateCard
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    carpenterProfiles.set(seed.key, { user, profile, seed });
  }

  for (let index = 0; index < customerSeeds.length; index += 1) {
    const seed = customerSeeds[index];
    const user = customerUsers[index];
    const profile = await CustomerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        profileType: seed.profileType,
        address: seed.address,
        profilePhotoUrl: seed.profilePhotoUrl,
        bio: seed.bio
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    customerProfiles.set(seed.key, { user, profile, seed });
  }

  const jobMap = new Map();
  const bookingMap = new Map();

  for (let contractorIndex = 0; contractorIndex < contractorSeeds.length; contractorIndex += 1) {
    const contractorSeedItem = contractorSeeds[contractorIndex];
    const contractorRecord = contractorProfiles.get(contractorSeedItem.key);
    const city = contractorSeedItem.businessLocation.city;
    const cityAddress = contractorSeedItem.businessLocation.address;

    const dailyJob = await ensureJob({
      createdByUserId: contractorRecord.user._id,
      title: `${city} modular kitchen fitting batch ${numberLabel(contractorIndex + 1)}`,
      description: `${city} residential project ke liye modular kitchen aur wardrobe installation ka kaam.`,
      workType: "Daily wage",
      skillRequirements: ["Modular kitchen", "Wardrobe fitting"],
      carpenterCountNeeded: 4,
      rateModel: "daily",
      budget: { min: 900, max: 1400 },
      duration: { estimatedDays: 4 + (contractorIndex % 4) },
      labourMode: "labour_only",
      location: {
        state: contractorSeedItem.businessLocation.state,
        district: contractorSeedItem.businessLocation.district,
        city,
        pincode: contractorSeedItem.businessLocation.pincode,
        fullAddress: cityAddress
      },
      outstationAllowed: contractorIndex >= 5,
      emergencyJob: contractorIndex % 3 === 0,
      status: "open"
    });

    const projectJob = await ensureJob({
      createdByUserId: contractorRecord.user._id,
      title: `${city} office partition package ${numberLabel(contractorIndex + 1)}`,
      description: `${city} commercial office ke liye partition, false ceiling frame aur office furniture support.`,
      workType: "Per sq ft",
      skillRequirements: ["Office furniture", "False ceiling woodwork", "Paneling"],
      carpenterCountNeeded: 6,
      rateModel: "per_sqft",
      budget: { min: 120, max: 175 },
      duration: { estimatedDays: 7 + (contractorIndex % 5) },
      labourMode: contractorIndex % 2 === 0 ? "both" : "labour_only",
      location: {
        state: contractorSeedItem.businessLocation.state,
        district: contractorSeedItem.businessLocation.district,
        city,
        pincode: contractorSeedItem.businessLocation.pincode,
        fullAddress: `${cityAddress} Site 2`
      },
      outstationAllowed: true,
      emergencyJob: false,
      status: contractorIndex % 2 === 0 ? "open" : "in_progress"
    });

    jobMap.set(`${contractorSeedItem.key}-daily`, dailyJob);
    jobMap.set(`${contractorSeedItem.key}-project`, projectJob);

    const startIndex = contractorIndex * 10;
    const assignedCarpenters = carpenterSeeds.slice(startIndex, startIndex + 10);

    for (let localIndex = 0; localIndex < assignedCarpenters.length; localIndex += 1) {
      const carpenterSeedItem = assignedCarpenters[localIndex];
      const carpenterRecord = carpenterProfiles.get(carpenterSeedItem.key);

      await ensureOffer({
        contractorId: contractorRecord.profile._id,
        carpenterId: carpenterRecord.profile._id,
        jobId: dailyJob._id,
        offeredByUserId: contractorRecord.user._id,
        rateModel: "daily",
        offeredRate: 1000 + localIndex * 50 + contractorIndex * 25,
        paymentTerms: localIndex % 2 === 0 ? "Weekly settlement + advance" : "Daily payout after attendance approval",
        startDate: new Date(),
        durationDays: 3 + (localIndex % 4),
        outstationAllowance: contractorIndex >= 5 ? 1200 : 0,
        overtimeRate: 150 + (localIndex % 4) * 20,
        message: `${city} site par ${carpenterSeedItem.skills[0]} ka urgent kaam hai.`,
        status: localIndex < 2 ? "accepted" : localIndex < 5 ? "pending" : "rejected"
      });

      if (localIndex < 3) {
        const bookingStatus = localIndex === 0 ? "completed" : localIndex === 1 ? "active" : "pending";
        const paymentStatus = localIndex === 0 ? "paid" : localIndex === 1 ? "partial" : "unpaid";
        const customerRecord = customerProfiles.get(customerSeeds[(contractorIndex + localIndex) % customerSeeds.length].key);

        const booking = await ensureBooking({
          sourceType: "job_hire",
          contractorId: contractorRecord.profile._id,
          carpenterId: carpenterRecord.profile._id,
          jobId: localIndex === 2 ? projectJob._id : dailyJob._id,
          bookedByUserId: contractorRecord.user._id,
          rateModel: localIndex === 2 ? "per_sqft" : "daily",
          agreedRate: localIndex === 2 ? 18500 + contractorIndex * 500 : 1200 + localIndex * 150,
          schedule: {
            startDate: new Date(),
            endDate: new Date(Date.now() + (4 + localIndex) * 24 * 60 * 60 * 1000)
          },
          status: bookingStatus,
          advanceAmount: bookingStatus === "pending" ? 0 : 2000,
          totalEstimatedAmount: localIndex === 2 ? 24000 : 6400,
          pendingAmount: bookingStatus === "completed" ? 0 : localIndex === 1 ? 3500 : 6400,
          finalSettlementAmount: bookingStatus === "completed" ? 6400 : 0,
          paymentStatus
        });

        bookingMap.set(`${contractorSeedItem.key}-${carpenterSeedItem.key}`, booking);

        await ensurePayment({
          bookingId: booking._id,
          payerUserId: contractorRecord.user._id,
          payeeUserId: carpenterRecord.user._id,
          paymentType: bookingStatus === "completed" ? "final" : "advance",
          paymentMethod: localIndex === 0 ? "upi" : "manual",
          gateway: localIndex === 0 ? "razorpay" : "manual",
          amount: bookingStatus === "completed" ? booking.finalSettlementAmount || booking.agreedRate : booking.advanceAmount || 2000,
          status: bookingStatus === "pending" ? "created" : "success",
          note: `${city} project payment`
        });

        if (bookingStatus !== "pending") {
          await ensureAttendance({
            bookingId: booking._id,
            carpenterId: carpenterRecord.profile._id,
            contractorId: contractorRecord.profile._id,
            date: `2026-04-${String((contractorIndex % 9) + localIndex + 1).padStart(2, "0")}T00:00:00.000Z`,
            attendanceType: localIndex === 1 ? "full_day" : "half_day",
            checkIn: {
              time: new Date(`2026-04-${String((contractorIndex % 9) + localIndex + 1).padStart(2, "0")}T09:15:00.000Z`),
              lat: 28.6139 + contractorIndex * 0.01,
              lng: 77.209 + contractorIndex * 0.01
            },
            checkOut: {
              time: new Date(`2026-04-${String((contractorIndex % 9) + localIndex + 1).padStart(2, "0")}T18:05:00.000Z`),
              lat: 28.6139 + contractorIndex * 0.01,
              lng: 77.209 + contractorIndex * 0.01
            },
            totalWorkMinutes: localIndex === 1 ? 540 : 260,
            overtimeMinutes: localIndex === 1 ? 60 : 0,
            approvalStatus: bookingStatus === "active" ? "pending" : "approved",
            notes: bookingStatus === "active" ? "Approval pending" : "Approved shift"
          });
        }

        if (bookingStatus === "completed") {
          await ensureReview({
            bookingId: booking._id,
            reviewerUserId: contractorRecord.user._id,
            revieweeUserId: carpenterRecord.user._id,
            reviewerRole: "contractor",
            rating: 4 + (contractorIndex % 2),
            title: `${carpenterRecord.user.fullName} reliable worker`,
            comment: `${carpenterRecord.user.fullName} ne ${city} site par reporting aur finish dono achhe diye.`,
            moderationStatus: "approved"
          });

          await ensureReview({
            bookingId: booking._id,
            reviewerUserId: carpenterRecord.user._id,
            revieweeUserId: contractorRecord.user._id,
            reviewerRole: "carpenter",
            rating: 4,
            title: `${contractorRecord.seed.companyName} payment clear`,
            comment: `Thekedar side se instruction clear tha aur settlement expected time me mila.`,
            moderationStatus: "approved"
          });

          await ensureBooking({
            sourceType: "direct_booking",
            customerId: customerRecord.profile._id,
            carpenterId: carpenterRecord.profile._id,
            jobId: dailyJob._id,
            bookedByUserId: customerRecord.user._id,
            rateModel: "full_day",
            agreedRate: 1800 + contractorIndex * 100,
            schedule: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            status: "completed",
            advanceAmount: 1000,
            totalEstimatedAmount: 3600,
            pendingAmount: 0,
            finalSettlementAmount: 2600,
            paymentStatus: "paid"
          });
        }
      }
    }
  }
}

module.exports = { ensureSeedData };
