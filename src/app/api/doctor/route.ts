import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Doctor from "@/app/models/Doctor";

export async function GET() {
  try {
    await dbConnect();

    const doctors = [
      {
        name: "Andre P. Marshall, M.D., MPH, F.A.C.S.",
        specialties: ["Rhinoplasty", "Facelift", "Lip Fillers"],
        email: "andre.marshall@dezyclinic.com",
        phone: "+1-202-555-0111",
        experience: "15 years in plastic and reconstructive surgery",
        clinic: "Dezy Clinic - Main Branch",
        isAvailable: true,
        qualifications: ["MD", "MPH", "FACS"]
      },
      {
        name: "Catherine Loflin, MD, FACS",
        specialties: ["Upper Arm Lift", "Tummy Tuck", "Facelift"],
        email: "catherine.loflin@dezyclinic.com",
        phone: "+1-202-555-0112",
        experience: "12 years specializing in body contouring",
        clinic: "Dezy Clinic - Main Branch",
        isAvailable: true,
        qualifications: ["MD", "FACS"]
      },
      {
        name: "Michael Torres, MD",
        specialties: ["Botox", "Dermal Fillers", "Chemical Peels"],
        email: "michael.torres@dezyclinic.com",
        phone: "+1-202-555-0113",
        experience: "8 years in cosmetic dermatology",
        clinic: "Dezy Clinic - Skin & Aesthetics",
        isAvailable: false,
        qualifications: ["MD"]
      }
    ];

    // Clear old doctors to avoid duplicates
    await Doctor.deleteMany({});
    // Insert new doctors
    await Doctor.insertMany(doctors);

    return NextResponse.json({ success: true, message: "Doctors seeded successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

