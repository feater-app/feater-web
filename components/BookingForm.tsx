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
          Modo demonstração — as reservas não serão salvas permanentemente. Conecte o Supabase para persistir os dados.
        </div>
      )}

      <input type="hidden" name="dealId" value={deal.id} />

      <h3 className="font-bold text-lg">Seus dados</h3>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="input"
          placeholder="João da Silva"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-mail *
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
          Telefone
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
            Pessoas *
          </label>
          <select id="numPeople" name="numPeople" required className="input">
            {Array.from({ length: deal.max_people }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "pessoa" : "pessoas"}
              </option>
            ))}
          </select>
        </div>

        {/* Booking Date */}
        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data *
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
          Pedidos especiais
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="input resize-none"
          placeholder="Restrições alimentares, ocasiões especiais..."
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Processando..." : "Confirmar reserva"}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Você receberá um e-mail de confirmação. O restaurante entrará em contato para confirmar.
      </p>
    </form>
  );
}
