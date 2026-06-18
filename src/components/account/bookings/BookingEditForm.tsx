"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Flash,
  StatusBadge,
  SubmitButton,
  fieldInputClass,
  lineBadgeTone,
} from "@/components/account/ui";
import { fill } from "@/lib/i18n/config";
import type {
  Booking,
  BookingHotel,
  BookingLine,
  BookingParticipant,
} from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { CancelItemButton } from "./CancelItemButton";
import { formatStartAt } from "./datetime";
import { isLineEditable, statusLabel } from "./status";

const labelClass = "mb-1 block text-sm font-bold text-ink";

/** A controlled labelled input (client form — uses the shared input look). */
function Input({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={fieldInputClass}
      />
    </div>
  );
}

/** Editable participant fields (all kept as strings for controlled inputs). */
interface ParticipantForm {
  first_name: string;
  last_name: string;
  email: string;
  phone_prefix: string;
  phone: string;
  birth_date: string;
  passport: string;
  identity_document: string;
  nationality: string;
}

type HotelField =
  | "hotel_name"
  | "hotel_street_address"
  | "hotel_street_number"
  | "hotel_city"
  | "hotel_postal_code"
  | "booking_name_at_hotel"
  | "room_number"
  | "front_desk_phone"
  | "front_desk_language";

type HotelForm = Record<HotelField, string>;

function toParticipantForm(p: BookingParticipant): ParticipantForm {
  return {
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    email: p.email ?? "",
    phone_prefix: p.phone_prefix ?? "",
    phone: p.phone ?? "",
    birth_date: p.birth_date ?? "",
    passport: p.passport ?? "",
    identity_document: p.identity_document ?? "",
    nationality: p.nationality ?? "",
  };
}

/** All participants of a line, flattened across its unit items (detail view only). */
function lineParticipants(line: BookingLine): BookingParticipant[] {
  return line.unit_items.flatMap((u) => u.participants ?? []);
}

/**
 * Edit a booking: per-line participant details + ONE reservation-level
 * hotel/pickup/dropoff. Saves the whole form via PATCH `/api/account/bookings/
 * {uuid}` (`{ participants, hotel, pickup, dropoff, locale }`); each active slot
 * also exposes a Cancel action (DELETE).
 *
 * Client component: controlled inputs + submitting/feedback in `useState`, the
 * submit handler is async on onSubmit (no setState-in-effect — Compiler ON). On
 * success it shows a flash and `router.refresh()` to re-pull the booking.
 *
 * EDIT GUARD: when `editable` is false (terminal state / no active line) every
 * input renders disabled with the `notEditable` notice and no save/cancel
 * controls. The backend stays the authority (locked PATCH → 403).
 */
export function BookingEditForm({
  booking,
  editable,
  lang,
  dict,
}: {
  booking: Booking;
  editable: boolean;
  lang: Locale;
  dict: Dictionary["account"];
}) {
  const router = useRouter();
  const d = dict.bookingDetail;

  const [participants, setParticipants] = useState<Record<string, ParticipantForm>>(() => {
    const init: Record<string, ParticipantForm> = {};
    for (const line of booking.lines) {
      for (const p of lineParticipants(line)) init[p.id] = toParticipantForm(p);
    }
    return init;
  });

  const [hotel, setHotel] = useState<HotelForm>(() => ({
    hotel_name: booking.hotel?.hotel_name ?? "",
    hotel_street_address: booking.hotel?.hotel_street_address ?? "",
    hotel_street_number: booking.hotel?.hotel_street_number ?? "",
    hotel_city: booking.hotel?.hotel_city ?? "",
    hotel_postal_code: booking.hotel?.hotel_postal_code ?? "",
    booking_name_at_hotel: booking.hotel?.booking_name_at_hotel ?? "",
    room_number: booking.hotel?.room_number ?? "",
    front_desk_phone: booking.hotel?.front_desk_phone ?? "",
    front_desk_language: booking.hotel?.front_desk_language ?? "",
  }));

  const [pickupRequested, setPickupRequested] = useState(booking.pickup?.pickup_requested ?? false);
  const [pickupNotes, setPickupNotes] = useState(booking.pickup?.pickup_notes ?? "");
  const [dropoffRequested, setDropoffRequested] = useState(booking.dropoff?.dropoff_requested ?? false);
  const [dropoffNotes, setDropoffNotes] = useState(booking.dropoff?.dropoff_notes ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [hotelIncomplete, setHotelIncomplete] = useState(false);

  function setParticipantField(id: string, field: keyof ParticipantForm, value: string) {
    setParticipants((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function setHotelField(field: HotelField, value: string) {
    setHotel((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !editable) return;
    setSubmitting(true);
    setSaved(false);
    setError(false);
    setHotelIncomplete(false);

    const participantPatches = Object.entries(participants).map(([id, f]) => ({
      id,
      first_name: f.first_name.trim(),
      last_name: f.last_name.trim(),
      email: f.email.trim(),
      phone_prefix: f.phone_prefix.trim(),
      phone: f.phone.trim(),
      birth_date: f.birth_date.trim(),
      passport: f.passport.trim(),
      identity_document: f.identity_document.trim(),
      nationality: f.nationality.trim(),
    }));

    const hotelPatch: Partial<BookingHotel> = {
      hotel_name: hotel.hotel_name.trim(),
      hotel_street_address: hotel.hotel_street_address.trim(),
      hotel_street_number: hotel.hotel_street_number.trim(),
      hotel_city: hotel.hotel_city.trim(),
      hotel_postal_code: hotel.hotel_postal_code.trim(),
      booking_name_at_hotel: hotel.booking_name_at_hotel.trim(),
      room_number: hotel.room_number.trim(),
      front_desk_phone: hotel.front_desk_phone.trim(),
      front_desk_language: hotel.front_desk_language.trim(),
    };
    // An untouched (all-empty) hotel section means "no hotel change" — sending it
    // would make the backend insert a row with NULLs on its NOT NULL columns.
    const hotelEmpty = Object.values(hotelPatch).every((v) => v === "");
    if (
      !hotelEmpty &&
      (!hotelPatch.hotel_name || !hotelPatch.hotel_city || !hotelPatch.booking_name_at_hotel)
    ) {
      setHotelIncomplete(true);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/account/bookings/${booking.uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: participantPatches,
          ...(hotelEmpty ? {} : { hotel: hotelPatch }),
          pickup: { pickup_requested: pickupRequested, pickup_notes: pickupNotes.trim() },
          dropoff: { dropoff_requested: dropoffRequested, dropoff_notes: dropoffNotes.trim() },
          locale: lang,
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) throw new Error("failed");
      setSaved(true);
      setSubmitting(false);
      router.refresh();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {!editable ? <Flash variant="info">{d.notEditable}</Flash> : null}

      {/* Lines + participants */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold text-ink">{d.participantsTitle}</h2>
        {booking.lines.map((line) => {
          const canEditLine = editable && isLineEditable(line);
          const people = lineParticipants(line);
          return (
            <div
              key={line.id}
              className="rounded-[15px] border border-stroke-2 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-extrabold leading-snug text-ink">{line.product_name ?? "—"}</h3>
                  <p className="mt-0.5 text-sm text-ink/70">
                    {formatStartAt(line.slot_start, lang)}
                    {line.option_name ? ` · ${line.option_name}` : ""}
                  </p>
                </div>
                <StatusBadge tone={lineBadgeTone(line.state)}>
                  {statusLabel(dict.status, line.state)}
                </StatusBadge>
              </div>

              {people.length > 0 ? (
                <div className="mt-4 flex flex-col gap-5 border-t border-soft-grey pt-4">
                  {people.map((p, i) => {
                    const form = participants[p.id];
                    const canEdit = canEditLine && p.state !== "cancelled";
                    return (
                      <div key={p.id} className="flex flex-col gap-3">
                        <p className="text-sm font-bold text-ink">
                          {fill(d.participant, { n: String(p.position || i + 1) })}
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Input
                            id={`p-${p.id}-first`}
                            label={d.firstName}
                            value={form.first_name}
                            onChange={(v) => setParticipantField(p.id, "first_name", v)}
                            autoComplete="given-name"
                            disabled={!canEdit}
                          />
                          <Input
                            id={`p-${p.id}-last`}
                            label={d.lastName}
                            value={form.last_name}
                            onChange={(v) => setParticipantField(p.id, "last_name", v)}
                            autoComplete="family-name"
                            disabled={!canEdit}
                          />
                          <Input
                            id={`p-${p.id}-email`}
                            label={d.email}
                            value={form.email}
                            onChange={(v) => setParticipantField(p.id, "email", v)}
                            type="email"
                            autoComplete="email"
                            disabled={!canEdit}
                          />
                          <div className="grid grid-cols-[100px_1fr] gap-3">
                            <Input
                              id={`p-${p.id}-prefix`}
                              label={d.phonePrefix}
                              value={form.phone_prefix}
                              onChange={(v) => setParticipantField(p.id, "phone_prefix", v)}
                              disabled={!canEdit}
                            />
                            <Input
                              id={`p-${p.id}-phone`}
                              label={d.phone}
                              value={form.phone}
                              onChange={(v) => setParticipantField(p.id, "phone", v)}
                              type="tel"
                              autoComplete="tel"
                              disabled={!canEdit}
                            />
                          </div>
                          <Input
                            id={`p-${p.id}-birth`}
                            label={d.birthDate}
                            value={form.birth_date}
                            onChange={(v) => setParticipantField(p.id, "birth_date", v)}
                            type="date"
                            disabled={!canEdit}
                          />
                          <Input
                            id={`p-${p.id}-nationality`}
                            label={d.nationality}
                            value={form.nationality}
                            onChange={(v) => setParticipantField(p.id, "nationality", v)}
                            disabled={!canEdit}
                          />
                          <Input
                            id={`p-${p.id}-passport`}
                            label={d.passport}
                            value={form.passport}
                            onChange={(v) => setParticipantField(p.id, "passport", v)}
                            disabled={!canEdit}
                          />
                          <Input
                            id={`p-${p.id}-doc`}
                            label={d.identityDocument}
                            value={form.identity_document}
                            onChange={(v) => setParticipantField(p.id, "identity_document", v)}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {canEditLine ? (
                <div className="mt-4 border-t border-soft-grey pt-4">
                  <CancelItemButton
                    bookingId={booking.uuid}
                    itemId={line.id}
                    lang={lang}
                    dict={dict}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      {/* Hotel (one per reservation) */}
      <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-ink">{d.hotelTitle}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input id="hotel-name" label={d.hotelName} value={hotel.hotel_name} onChange={(v) => setHotelField("hotel_name", v)} disabled={!editable} />
          <Input id="hotel-booking-name" label={d.bookingNameAtHotel} value={hotel.booking_name_at_hotel} onChange={(v) => setHotelField("booking_name_at_hotel", v)} disabled={!editable} />
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <Input id="hotel-street" label={d.hotelStreetAddress} value={hotel.hotel_street_address} onChange={(v) => setHotelField("hotel_street_address", v)} disabled={!editable} />
            <Input id="hotel-street-no" label={d.hotelStreetNumber} value={hotel.hotel_street_number} onChange={(v) => setHotelField("hotel_street_number", v)} disabled={!editable} />
          </div>
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <Input id="hotel-city" label={d.hotelCity} value={hotel.hotel_city} onChange={(v) => setHotelField("hotel_city", v)} disabled={!editable} />
            <Input id="hotel-postal" label={d.hotelPostalCode} value={hotel.hotel_postal_code} onChange={(v) => setHotelField("hotel_postal_code", v)} disabled={!editable} />
          </div>
          <Input id="hotel-room" label={d.roomNumber} value={hotel.room_number} onChange={(v) => setHotelField("room_number", v)} disabled={!editable} />
          <Input id="hotel-desk-phone" label={d.frontDeskPhone} value={hotel.front_desk_phone} onChange={(v) => setHotelField("front_desk_phone", v)} type="tel" disabled={!editable} />
          <Input id="hotel-desk-lang" label={d.frontDeskLanguage} value={hotel.front_desk_language} onChange={(v) => setHotelField("front_desk_language", v)} disabled={!editable} />
        </div>
      </section>

      {/* Pickup */}
      <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-ink">{d.pickupTitle}</h2>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={pickupRequested}
            onChange={(e) => setPickupRequested(e.target.checked)}
            disabled={!editable}
            className="h-4 w-4 shrink-0 accent-cta"
          />
          {d.pickupRequested}
        </label>
        <div className="mt-3">
          <label htmlFor="pickup-notes" className={labelClass}>
            {d.pickupNotes}
          </label>
          <textarea
            id="pickup-notes"
            value={pickupNotes}
            onChange={(e) => setPickupNotes(e.target.value)}
            disabled={!editable}
            rows={2}
            className={`${fieldInputClass} resize-y`}
          />
        </div>
      </section>

      {/* Dropoff */}
      <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-ink">{d.dropoffTitle}</h2>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={dropoffRequested}
            onChange={(e) => setDropoffRequested(e.target.checked)}
            disabled={!editable}
            className="h-4 w-4 shrink-0 accent-cta"
          />
          {d.dropoffRequested}
        </label>
        <div className="mt-3">
          <label htmlFor="dropoff-notes" className={labelClass}>
            {d.dropoffNotes}
          </label>
          <textarea
            id="dropoff-notes"
            value={dropoffNotes}
            onChange={(e) => setDropoffNotes(e.target.value)}
            disabled={!editable}
            rows={2}
            className={`${fieldInputClass} resize-y`}
          />
        </div>
      </section>

      {editable ? (
        <div className="flex flex-col gap-3">
          {saved ? <Flash variant="success">{d.saved}</Flash> : null}
          {error ? <Flash variant="error">{dict.feedback.error}</Flash> : null}
          {hotelIncomplete ? <Flash variant="error">{d.hotelIncomplete}</Flash> : null}
          <div className="sm:max-w-[280px]">
            <SubmitButton loading={submitting} loadingLabel={d.saving}>
              {d.save}
            </SubmitButton>
          </div>
        </div>
      ) : null}
    </form>
  );
}
