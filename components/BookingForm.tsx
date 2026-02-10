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
    <form action={action} className="card space-y-5 p-5 md:p-6">
      {isMockMode && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Modo demonstracao: as candidaturas nao sao salvas permanentemente sem Supabase conectado.
        </div>
      )}

      <input type="hidden" name="dealId" value={deal.id} />

      <div>
        <p className="text-xl font-semibold text-slate-900">Enviar candidatura</p>
        <p className="mt-1 text-sm text-slate-500">Informe seu contato e disponibilidade para fechar a permuta.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
          Nome completo *
          <input
            type="text"
            id="name"
            name="name"
            required
            className="input mt-2"
            placeholder="Joao da Silva"
          />
        </label>

        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          E-mail *
          <input
            type="email"
            id="email"
            name="email"
            required
            className="input mt-2"
            placeholder="joao@email.com"
          />
        </label>

        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
          Telefone
          <input type="tel" id="phone" name="phone" className="input mt-2" placeholder="+55 11 99999-9999" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label htmlFor="numPeople" className="block text-sm font-semibold text-slate-700">
          Pessoas *
          <select id="numPeople" name="numPeople" required className="input mt-2">
            {Array.from({ length: deal.max_people }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "pessoa" : "pessoas"}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="bookingDate" className="block text-sm font-semibold text-slate-700">
          Data *
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            required
            min={today}
            max={deal.valid_until}
            className="input mt-2"
          />
        </label>
      </div>

        <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">
        Pitch rapido
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="input mt-2 resize-none"
          placeholder="Seu nicho, formato de conteudo e ideias para esta collab..."
        />
      </label>

      <div className="space-y-3 pt-1">
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Enviando..." : "Enviar candidatura"}
        </button>
        <p className="text-center text-xs text-slate-500">
          Voce recebe confirmacao por e-mail e o restaurante retorna em ate 24 horas.
        </p>
      </div>
    </form>
  );
}
