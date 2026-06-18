export function VoucherLink({ bookingId, label }: { bookingId: string; label: string }) {
  return (
    <a
      href={`/api/account/bookings/${encodeURIComponent(bookingId)}/voucher`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-[10px] border border-stroke px-5 py-2.5 text-sm font-extrabold text-ink transition-colors hover:border-cta hover:text-cta"
    >
      {label}
    </a>
  );
}
