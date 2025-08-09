import dbConnect from "@/app/lib/db";
import User from "@/app/models/User";
import { makeRequest } from "@/app/utils/gmini";

import {
  handleAvailableDoctors,
  handleBookAppointment,
  handleCancelAllAppointments,
  handleCancelAppointment,
  handleCancelAppointmentById,
  handleCheckSlotAvailability,
  handleGetAllAvailableSlots,
  handleGetDoctorAppointments,
  handleGetDoctorsInfo,
  handleGetPatientAppointments,
  handleInfoAboutDoctor,
  handleSelectDoctor
} from "@/app/utils/opreations";
import { getSystemPrmpt } from "@/app/utils/prompt";
import { get } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export interface FunctionCall<TArgs = Record<string, unknown>> {
  name: string;
  arguments: TArgs;
}

export interface ParsedResult<TArgs = Record<string, unknown>> {
  type: "message" | "function_call";
  function_call: FunctionCall<TArgs>;
  message?: string;
}

export async function POST(req: Request) {
  await dbConnect();
  const { prompt } = (await req.json()) as { prompt: string };

  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");
 ;

  const systemPrompt = getSystemPrmpt(userId?.toString() ?? "");

  let result = await makeRequest(systemPrompt, prompt);
  let cleanedResult: ParsedResult;

  try {
    if (typeof result === "string") {
      result = result.trim();
      if (result.startsWith("```json")) {
        result = result.replace(/^```json/, "").trim();
      }
      if (result.endsWith("```")) {
        result = result.replace(/```$/, "").trim();
      }
      cleanedResult = JSON.parse(result) as ParsedResult;
    } else {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid response format" },
      { status: 400 }
    );
  }

  if (cleanedResult?.type === "function_call") {
     console.log("Cleanup result:", cleanedResult);
     

    try {
      switch (cleanedResult.function_call.name) {
        case "availableDoctors":
          return await handleAvailableDoctors(cleanedResult);

        case "selectDoctor":
          return await handleSelectDoctor(cleanedResult);

        case "bookAppointment":
          return await handleBookAppointment(cleanedResult);

        case "checkSlotAvailability":
          return await handleCheckSlotAvailability(cleanedResult);

        case "cancelAppointment":
          return await handleCancelAppointment(cleanedResult);

        case "getAllAvailableSlots":
          return await handleGetAllAvailableSlots(cleanedResult);

        case "getDoctorAppointments":
          return await handleGetDoctorAppointments(cleanedResult);

        case "cancelAllAppointments":
          return await handleCancelAllAppointments(cleanedResult);

        case "getPatientAppointments":
          return await handleGetPatientAppointments(cleanedResult);

        case "infoAboutDoctor":
          return await handleInfoAboutDoctor(cleanedResult);

        case "cancelAppointmentById":
          return await handleCancelAppointmentById(cleanedResult);

        case "getDoctorsInfo":
          return await handleGetDoctorsInfo(cleanedResult);

        default:
          return NextResponse.json(
            { error: "Unknown function call" },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error("Error handling function call:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: cleanedResult?.message || "No action taken",
  });
}
