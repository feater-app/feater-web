"use client";

import { createBooking } from "@/app/actions/booking";
import { useActionState } from "react";

interface BookingFormProps {
  deal: any;
  isMockMode?: boolean;
}

const today = new Date().toISOString().split("T")[0];

export default function BookingForm({ deal, isMockMode = false }: BookingFormProps) {
  const [, action, pending] = useActionState(async (_: any, formData: FormData) => {
    await createBooking(formData);
  }, null);

  return (
    <form action={action} className="card p-6 space-y-4">
      {isMockMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Demo mode — bookings won&apos;t be saved permanently. Connect Supabase to persist data.
        </div>
      )}

      <input type="hidden" name="dealId" value={deal.id} />

      <h3 className="font-bold text-lg">Your Information</h3>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="input"
          placeholder="John Doe"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="input"
          placeholder="john@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="input"
          placeholder="+55 11 99999-9999"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Number of People */}
        <div>
          <label htmlFor="numPeople" className="block text-sm font-medium text-gray-700 mb-1">
            People *
          </label>
          <select id="numPeople" name="numPeople" required className="input">
            {Array.from({ length: deal.max_people }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        {/* Booking Date */}
        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            required
            min={today}
            max={deal.valid_until}
            className="input"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="input resize-none"
          placeholder="Dietary restrictions, special occasions..."
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Processing..." : "Confirm Booking"}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You&apos;ll receive a confirmation email. The restaurant will contact you to confirm.
      </p>
    </form>
  );
}
