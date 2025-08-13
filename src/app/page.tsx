"use client";
import { useState, useRef, useEffect } from "react";
import { Doctor, Message, Slot } from "./types";
import DoctorCard from "./components/DoctorCard";
import { useRouter } from "next/navigation";
import AppointmentList from "./components/AppointmentList";
import { set } from "mongoose";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cancelState, setCancelState] = useState<{
    id: string | null;
    text: string;
  } | null>({
    id: null,
    text: "",
  });

  const [slectedSlot, setSelectedSlot] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user" as const,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const formattedInput =
        input +
        `${selectedDoctorId ? `with  doctorID : ${selectedDoctorId}` : ""} ${
          slectedSlot
            ? `and slot : ${slectedSlot}`
            : "" +
              `${
                cancelState?.id
                  ? ` and cancel appointment : ${cancelState.id}`
                  : ""
              }`
        }`;
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt: formattedInput }),
      });
      setSelectedDoctorId(null);
      setSelectedSlot("");
      setCancelState(null);

      const data = await response.json();

      if (data.appointments && data.appointments.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.message || "Here are your appointments:",
            sender: "bot",
            appointment: data.appointments,
          },
        ]);
        return;
      }

      if (data.slots && data.slots.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.message || "Here are available slots:",
            sender: "bot",
            slots: data.slots,
          },
        ]);
        return;
      }

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.error,
            sender: "bot",
            isError: true,
          },
        ]);
        return;
      }

      if (data.data) {
        if (Array.isArray(data.data)) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: data.message || "Here are available doctors:",
              sender: "bot",
              doctors: data.data,
            },
          ]);
        } else if (data.data.slotStart) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text:
                data.message ||
                "Your appointment has been booked successfully!",
              sender: "bot",
            },
          ]);
          setShowForm(false);
        } else if (data.data.name) {
          setSelectedDoctor(data.data);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: data.message || "Doctor details:",
              sender: "bot",
              doctor: data.data,
            },
          ]);
        } else if (typeof data.available !== "undefined") {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: data.available
                ? "The slot is available! Would you like to book it?"
                : "Sorry, this slot is already booked.",
              sender: "bot",
              slotAvailable: data.available,
              metadata: data,
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.message || "I didn't understand that request.",
            sender: "bot",
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Sorry, something went wrong. Please try again.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setInput(`Dr. ${doctor.name}`);
    setSelectedDoctorId(doctor._id);
    setTimeout(() => {
      document.getElementById("chat-input")?.focus();
    }, 100);
  };

  const bookSlot = (slot: Slot) => {
    setInput(
      ` I want to book on  date : ${new Date(
        slot.start
      ).toLocaleDateString()}, start: ${new Date(
        slot.start
      ).toLocaleTimeString()}, end: ${new Date(slot.end).toLocaleTimeString()}`
    );
    setTimeout(handleSendMessage, 300);
  };

  useEffect(() => {
    if (cancelState?.text) {
      setInput(cancelState.text);
    }
  }, [cancelState]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with medical theme */}
      <header className="bg-teal-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Dezy Clinic Booking Assistant
              </h1>
              <p className="text-teal-100 text-sm">
                Your personal healthcare scheduling companion
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="bg-white text-teal-600 px-4 py-2 rounded-full shadow-sm hover:bg-teal-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 container mx-auto p-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.text && (
                <div
                  className={`max-w-3/4 rounded-lg p-4 ${
                    message.sender === "user"
                      ? "bg-teal-600 text-white"
                      : message.isError
                      ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                      : "bg-white text-gray-800 shadow border-l-4 border-teal-400"
                  }`}
                >
                  {message.text}

                  {message.doctors && (
                    <div className="mt-3 space-y-3">
                      <p className="font-medium text-teal-700">
                        Available Doctors:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {message.doctors.map((doctor: Doctor) => (
                          <div
                            key={doctor._id}
                            className="border border-teal-100 p-3 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                            onClick={() => handleDoctorSelect(doctor)}
                          >
                            <p className="font-medium text-teal-800">
                              Dr. {doctor.name}
                            </p>
                            <p className="text-sm text-teal-600">
                              {doctor.specialization}
                            </p>
                            {/* <p className="text-xs text-gray-500 mt-1">
                            {doctor.availableSlots?.length || 0} slots available
                          </p> */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.slots && (
                    <div className="mt-3 space-y-3">
                      <p className="font-medium text-teal-700">
                        Available Slots on{" "}
                        {new Date(message.slots[0].start).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {message.slots.map((slot: Slot, index) => (
                          <div
                            key={index}
                            className="border border-teal-100 p-2 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors text-center"
                            onClick={() => bookSlot(slot)}
                          >
                            <p className="font-medium text-teal-800">
                              {new Date(slot.start).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              Click to book
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.appointment && message.appointment.length > 0 && (
                    <div className="mt-3 ">
                      <p className="font-medium text-teal-700">
                        Your Appointments:
                      </p>
                      <AppointmentList
                        appointments={message.appointment}
                        message={message.text}
                        setCancelState={setCancelState}
                      />
                    </div>
                  )}

                  {message.doctor && (
                    <div className="mt-3">
                      <DoctorCard doctor={message.doctor} />
                      <button
                        className="mt-3 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors w-full"
                        onClick={() => {
                          if (message.doctor) {
                             setInput(`I want to book with Dr. ${message.doctor.name}`);
                             setSelectedDoctor(message.doctor);
                             setSelectedDoctorId(message.doctor._id);
                          }
                          setShowForm(true);
                        }}
                      >
                        Book with Dr. {message.doctor.name}
                      </button>
                    </div>
                  )}

                  {message.slotAvailable && (
                    <div className="mt-3 space-x-2">
                      <button
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                        onClick={() => setShowForm(true)}
                      >
                        Yes, book this slot
                      </button>
                      <button
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() =>
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: Date.now().toString(),
                              text: "Let me know if you'd like to see other options.",
                              sender: "bot",
                            },
                          ])
                        }
                      >
                        No, show other options
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-lg p-4 shadow border-l-4 border-teal-400">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

      

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex space-x-2">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 text-gray-800 border black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              Send
            </button>
          </div>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-500">Try:</span>
            <div className="overflow-x-auto flex space-x-2" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setInput("Book an appointment")}
                className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded hover:bg-teal-100"
              >
                Book an appointment
              </button>
              <button
                onClick={() => setInput("Check doctor availability")}
                className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded hover:bg-teal-100"
              >
                Check availability
              </button>
              <button
                onClick={() => setInput("Cancel my appointments")}
                className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded hover:bg-teal-100"
              >
                Cancel appointments
              </button>
              <button
                onClick={() => setInput("Show me my all appointments")}
                className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded hover:bg-teal-100"
              >
                Get all appointments
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
