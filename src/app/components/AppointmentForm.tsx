import { useState } from "react";
import { Doctor } from "../types";

interface AppointmentFormData {
  date: string;
  time: string;
  description: string;
}

interface AppointmentSubmitData {
  start: string;       // ISO date string
  end: string;         // ISO date string
  description: string;
}

interface AppointmentFormProps {
  doctor: Doctor;
  onSubmit: (data: AppointmentSubmitData) => void;
  onCancel: () => void;
}

export default function AppointmentForm({
  doctor,
  onSubmit,
  onCancel,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    date: "",
    time: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert date and time to ISO format
    const start = new Date(`${formData.date}T${formData.time}:00`);
    const end = new Date(start.getTime() + 30 * 60000); // 30-minute appointment

    onSubmit({
      start: start.toISOString(),
      end: end.toISOString(),
      description: formData.description || `Appointment with Dr. ${doctor.name}`,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-4">Book with Dr. {doctor.name}</h3>

      <div className="space-y-4">
        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        {/* Time Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <select
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          >
            <option value="">Select a time</option>
            {[
              "09:00",
              "09:30",
              "10:00",
              "10:30",
              "11:00",
              "11:30",
              "14:00",
              "14:30",
              "15:00",
              "15:30",
            ].map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
            placeholder="Briefly describe the reason for your visit"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Confirm Booking
        </button>
      </div>
    </form>
  );
}
