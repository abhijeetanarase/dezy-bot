// app/api/doctor/route.ts
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
        qualifications: ["MD", "MPH", "FACS"] // Now matches schema
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

    // Clear existing data
    await Doctor.deleteMany({});
    
    // Insert new data
    await Doctor.insertMany(doctors);

    return NextResponse.json({ 
      success: true, 
      message: `${doctors.length} doctors seeded successfully` 
    });
  } catch (err) {
    console.error("Seeding error:", err);
    return NextResponse.json(
      { 
        success: false, 
        error: err instanceof Error ? err.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}