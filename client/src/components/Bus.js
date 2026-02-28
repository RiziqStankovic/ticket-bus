import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

function Bus({ bus }) {
  const navigate = useNavigate();
  const seatsBooked = Array.isArray(bus.seatsBooked) ? bus.seatsBooked : [];
  const seatsLeft = bus.capacity - seatsBooked.length;

  const handleBook = () => {
    localStorage.setItem("idTrip", bus.id);
    navigate(`/book-now/${bus.id}`);
  };

  return (
    <div className="group bg-slate-800/80 backdrop-blur rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-700/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <i className="ri-bus-line text-primary-400 text-base sm:text-lg"></i>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate text-sm sm:text-base">{bus.name}</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              {moment(bus.journeyDate).format("DD MMM YYYY")}
            </p>
          </div>
        </div>
        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-primary-500/20 text-primary-400 text-xs sm:text-sm font-medium shrink-0">
          No.{bus.busNumber}
        </span>
      </div>

      {/* Route & Time */}
      <div className="px-4 sm:px-5 py-3 sm:py-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-base sm:text-lg">{bus.from}</span>
          <i className="ri-arrow-right-line text-slate-500 text-sm"></i>
          <span className="font-semibold text-white text-base sm:text-lg">{bus.to}</span>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-6 mt-2 text-slate-400 text-xs sm:text-sm">
          <span>
            <i className="ri-time-line mr-1"></i>
            {moment(bus.departure, "HH:mm").format("hh:mm A")}
          </span>
          <span>
            <i className="ri-time-line mr-1"></i>
            {moment(bus.arrival, "HH:mm").format("hh:mm A")}
          </span>
        </div>
      </div>

      {/* Footer - stack di mobile */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-slate-500 text-xs">Harga</p>
            <p className="font-bold text-primary-400 text-sm sm:text-base">
              Rp {Number(bus.price).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="h-6 sm:h-8 w-px bg-slate-600"></div>
          <div>
            <p className="text-slate-500 text-xs">Kursi</p>
            <p className="font-semibold text-white text-sm sm:text-base">{seatsLeft}/{bus.capacity}</p>
          </div>
        </div>
        <button
          onClick={handleBook}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
        >
          <i className="ri-ticket-line"></i>
          Pesan Sekarang
        </button>
      </div>
    </div>
  );
}

export default Bus;
