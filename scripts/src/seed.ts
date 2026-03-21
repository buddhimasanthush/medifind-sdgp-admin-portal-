import { db, pharmaciesTable, patientsTable, ocrLogsTable, ordersTable, settingsTable, adminsTable, notificationsTable } from "@workspace/db";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string) {
  const salt = "8b3238618a804473"; // Fixed salt for seeding to keep it consistent
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data for fresh seed of new features
  await db.delete(adminsTable);
  await db.delete(notificationsTable);
  await db.delete(ordersTable);

  // Seed default admin
  const hashedPass = await hashPassword("admin123");
  await db.insert(adminsTable).values([
    {
      username: "admin",
      passwordHash: hashedPass,
      employeeId: "EMP-001",
      status: "approved",
    },
    {
      username: "newbie",
      passwordHash: hashedPass,
      employeeId: "EMP-999",
      status: "pending",
    }
  ]).onConflictDoNothing();

  // Seed notifications
  await db.insert(notificationsTable).values([
    {
      type: "new_employee_signup",
      message: "New employee signup: newbie (EMP-999)",
      read: false,
      metadata: JSON.stringify({ adminId: 2 }),
      createdAt: new Date(),
    },
    {
      type: "system",
      message: "Welcome to Medifind Admin Panel",
      read: true,
      metadata: "",
      createdAt: new Date(Date.now() - 86400000),
    }
  ]).onConflictDoNothing();

  // Seed pharmacies
  await db.insert(pharmaciesTable).values([
    {
      name: "MediCare Plus Pharmacy",
      registrationNumber: "REG-2024-0891",
      location: "Austin, TX",
      contactEmail: "admin@medicareplus.com",
      phone: "+1 (512) 555-0101",
      licenseExpiry: "2026-12-31",
      username: "medicare_tx",
      passwordHash: hashedPass,
      status: "pending",
      dateApplied: "2026-03-10",
    },
    {
      name: "HealthFirst Rx",
      registrationNumber: "REG-2024-0892",
      location: "Chicago, IL",
      contactEmail: "contact@healthfirstrx.com",
      phone: "+1 (312) 555-0202",
      licenseExpiry: "2027-06-30",
      username: "healthfirst_ch",
      passwordHash: hashedPass,
      status: "pending",
      dateApplied: "2026-03-11",
    },
    {
      name: "QuickMeds Dispensary",
      registrationNumber: "REG-2024-0893",
      location: "Miami, FL",
      contactEmail: "info@quickmeds.com",
      phone: "+1 (305) 555-0303",
      licenseExpiry: "2027-03-15",
      username: "quickmeds_miami",
      passwordHash: hashedPass,
      status: "pending",
      dateApplied: "2026-03-14",
    },
    {
      name: "Walgreens Central",
      registrationNumber: "REG-2023-0441",
      location: "New York, NY",
      contactEmail: "nyc@walgreens.com",
      phone: "+1 (212) 555-0404",
      licenseExpiry: "2028-01-01",
      username: "walgreens_ny",
      passwordHash: hashedPass,
      status: "approved",
      dateApplied: "2025-11-20",
    },
    {
      name: "CareRx Pharmacy",
      registrationNumber: "REG-2023-0442",
      location: "Los Angeles, CA",
      contactEmail: "la@carerx.com",
      phone: "+1 (213) 555-0505",
      licenseExpiry: "2027-09-30",
      username: "carerx_la",
      passwordHash: hashedPass,
      status: "approved",
      dateApplied: "2025-12-05",
    },
    {
      name: "Sunrise Compounding",
      registrationNumber: "REG-2024-0501",
      location: "Phoenix, AZ",
      contactEmail: "info@sunriserx.com",
      phone: "+1 (480) 555-0606",
      licenseExpiry: "2026-08-15",
      username: "sunrise_phx",
      passwordHash: hashedPass,
      status: "rejected",
      dateApplied: "2026-01-15",
    },
  ]).onConflictDoNothing();

  // Seed patients
  await db.insert(patientsTable).values([
    {
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone: "+1 (512) 555-1001",
      dateOfBirth: "1982-04-15",
      address: "142 Maple St, Austin, TX 78701",
      prescriptionCount: 4,
      lastVisit: "2026-03-01",
      username: "jwilson",
      passwordHash: hashedPass,
      status: "active",
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (312) 555-1002",
      dateOfBirth: "1975-09-22",
      address: "88 Oak Ave, Chicago, IL 60601",
      prescriptionCount: 7,
      lastVisit: "2026-02-28",
      username: "sjohnson",
      passwordHash: hashedPass,
      status: "active",
    },
    {
      name: "Michael Torres",
      email: "michael.torres@email.com",
      phone: "+1 (305) 555-1003",
      dateOfBirth: "1990-01-30",
      address: "315 Bay Dr, Miami, FL 33101",
      prescriptionCount: 2,
      lastVisit: "2026-02-15",
      username: "mtorres",
      passwordHash: hashedPass,
      status: "active",
    },
    {
      name: "Emily Chen",
      email: "emily.chen@email.com",
      phone: "+1 (212) 555-1004",
      dateOfBirth: "1988-07-11",
      address: "720 5th Ave, New York, NY 10001",
      prescriptionCount: 5,
      lastVisit: "2026-03-10",
      username: "echen",
      passwordHash: hashedPass,
      status: "active",
    },
    {
      name: "Robert Davis",
      email: "robert.davis@email.com",
      phone: "+1 (213) 555-1005",
      dateOfBirth: "1965-12-03",
      address: "45 Sunset Blvd, Los Angeles, CA 90001",
      prescriptionCount: 12,
      lastVisit: "2026-01-20",
      username: "rdavis",
      passwordHash: hashedPass,
      status: "active",
    },
    {
      name: "Lisa Martinez",
      email: "lisa.martinez@email.com",
      phone: "+1 (480) 555-1006",
      dateOfBirth: "1993-03-27",
      address: "900 Desert Rd, Phoenix, AZ 85001",
      prescriptionCount: 1,
      lastVisit: "2025-12-10",
      username: "lmartinez",
      passwordHash: hashedPass,
      status: "inactive",
    },
    {
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (415) 555-1007",
      dateOfBirth: "1979-08-14",
      address: "550 Market St, San Francisco, CA 94101",
      prescriptionCount: 3,
      lastVisit: "2026-03-05",
      username: "dkim",
      passwordHash: hashedPass,
      status: "active",
    },
    {
      name: "Amanda White",
      email: "amanda.white@email.com",
      phone: "+1 (206) 555-1008",
      dateOfBirth: "1984-11-19",
      address: "1200 Pine Ave, Seattle, WA 98101",
      prescriptionCount: 6,
      lastVisit: "2025-11-30",
      username: "awhite",
      passwordHash: hashedPass,
      status: "inactive",
    },
  ]).onConflictDoNothing();

  // Seed OCR logs
  await db.insert(ocrLogsTable).values([
    {
      prescriptionId: "RX-2026-001847",
      medicationName: "Amoxicillin 500mg",
      pharmacyName: "MediCare Plus",
      patientName: "James Wilson",
      status: "success",
      confidence: 0.98,
      errorReason: null,
      scannedAt: "2026-03-17T08:23:00Z",
    },
    {
      prescriptionId: "RX-2026-001848",
      medicationName: "Lisinopril 250mg",
      pharmacyName: "HealthFirst Rx",
      patientName: "Sarah Johnson",
      status: "manual_fallback",
      confidence: 0.61,
      errorReason: "Low image quality — handwriting unclear",
      scannedAt: "2026-03-17T08:35:00Z",
    },
    {
      prescriptionId: "RX-2026-001849",
      medicationName: "Metformin 10mg",
      pharmacyName: "QuickMeds",
      patientName: "Michael Torres",
      status: "success",
      confidence: 0.96,
      errorReason: null,
      scannedAt: "2026-03-17T09:01:00Z",
    },
    {
      prescriptionId: "RX-2026-001850",
      medicationName: "Atorvastatin 500mg",
      pharmacyName: "MediCare Plus",
      patientName: "Emily Chen",
      status: "success",
      confidence: 0.99,
      errorReason: null,
      scannedAt: "2026-03-17T09:15:00Z",
    },
    {
      prescriptionId: "RX-2026-001851",
      medicationName: "Levothyroxine 50mcg",
      pharmacyName: "Walgreens Central",
      patientName: "Robert Davis",
      status: "manual_fallback",
      confidence: 0.58,
      errorReason: "Multiple medications on single prescription — split required",
      scannedAt: "2026-03-17T09:42:00Z",
    },
    {
      prescriptionId: "RX-2026-001852",
      medicationName: "Omeprazole 20mg",
      pharmacyName: "CareRx Pharmacy",
      patientName: "Lisa Martinez",
      status: "success",
      confidence: 0.95,
      errorReason: null,
      scannedAt: "2026-03-17T10:05:00Z",
    },
    {
      prescriptionId: "RX-2026-001853",
      medicationName: "Amlodipine 5mg",
      pharmacyName: "QuickMeds",
      patientName: "David Kim",
      status: "success",
      confidence: 0.97,
      errorReason: null,
      scannedAt: "2026-03-17T10:22:00Z",
    },
    {
      prescriptionId: "RX-2026-001854",
      medicationName: "Sertraline 100mg",
      pharmacyName: "MediCare Plus",
      patientName: "Amanda White",
      status: "failed",
      confidence: 0.22,
      errorReason: "Document type not recognized — not a prescription",
      scannedAt: "2026-03-17T10:48:00Z",
    },
    {
      prescriptionId: "RX-2026-001855",
      medicationName: "Gabapentin 300mg",
      pharmacyName: "HealthFirst Rx",
      patientName: "James Wilson",
      status: "success",
      confidence: 0.94,
      errorReason: null,
      scannedAt: "2026-03-17T11:02:00Z",
    },
    {
      prescriptionId: "RX-2026-001856",
      medicationName: "Pantoprazole 40mg",
      pharmacyName: "Walgreens Central",
      patientName: "Sarah Johnson",
      status: "success",
      confidence: 0.99,
      errorReason: null,
      scannedAt: "2026-03-17T11:30:00Z",
    },
  ]).onConflictDoNothing();

  // Seed orders
  await db.insert(ordersTable).values([
    {
      orderId: "ORD-2026-8821",
      patientName: "James Wilson",
      pharmacyName: "MediCare Plus",
      medications: "Amoxicillin 500mg, Gabapentin 300mg",
      status: "delivered",
      total: 42.50,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8822",
      patientName: "Sarah Johnson",
      pharmacyName: "HealthFirst Rx",
      medications: "Lisinopril 250mg",
      status: "shipped",
      total: 18.00,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8823",
      patientName: "Michael Torres",
      pharmacyName: "QuickMeds",
      medications: "Metformin 10mg",
      status: "processing",
      total: 12.75,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8824",
      patientName: "Emily Chen",
      pharmacyName: "MediCare Plus",
      medications: "Atorvastatin 500mg, Omeprazole 20mg",
      status: "processing",
      total: 65.20,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8825",
      patientName: "Robert Davis",
      pharmacyName: "Walgreens Central",
      medications: "Levothyroxine 50mcg, Amlodipine 5mg, Metformin 10mg",
      status: "shipped",
      total: 89.99,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8826",
      patientName: "Lisa Martinez",
      pharmacyName: "CareRx Pharmacy",
      medications: "Omeprazole 20mg",
      status: "cancelled",
      total: 15.50,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8827",
      patientName: "David Kim",
      pharmacyName: "QuickMeds",
      medications: "Amlodipine 5mg",
      status: "delivered",
      total: 24.00,
      createdAt: new Date(),
    },
    {
      orderId: "ORD-2026-8828",
      patientName: "Amanda White",
      pharmacyName: "MediCare Plus",
      medications: "Sertraline 100mg, Pantoprazole 40mg",
      status: "processing",
      total: 55.80,
      createdAt: new Date(),
    },
  ]).onConflictDoNothing();

  // Seed settings (single row)
  const existing = await db.select().from(settingsTable).limit(1);
  if (existing.length === 0) {
    await db.insert(settingsTable).values({});
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
