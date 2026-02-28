import logo from "../assets/img/logo.png";
import { Helmet } from "react-helmet";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import Bus from "../components/Bus";
import { message } from "antd";
import { Link } from "react-router-dom";

function Index() {
  const dispatch = useDispatch();
  const [buses, setBuses] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchBuses = useCallback(
    async (from, to, journeyDate) => {
      setLoading(true);
      dispatch(ShowLoading());
      try {
        let data;
        if (from && to && journeyDate) {
          const res = await axios.post(
            `/api/buses/get?from=${from}&to=${to}&journeyDate=${journeyDate}`
          );
          data = res.data.data;
        } else {
          const res = await axios.get("/api/buses/home");
          data = res.data.data;
        }
        setBuses(data || []);
      } catch (error) {
        message.error(error.response?.data?.message || "Gagal memuat data bus");
        setBuses([]);
      } finally {
        setLoading(false);
        dispatch(HideLoading());
      }
    },
    [dispatch]
  );

  const getBusesByFilter = useCallback(() => {
    const { from, to, journeyDate } = filters;
    if (from && to && journeyDate) {
      fetchBuses(from, to, journeyDate);
    } else {
      fetchBuses();
    }
  }, [filters, fetchBuses]);

  useEffect(() => {
    axios.get("/api/cities/get-all-cities").then((res) => {
      setCities(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    fetchBuses();
  }, []);

  const hasSearched = filters.from && filters.to && filters.journeyDate;
  const showBuses = buses.length > 0;
  const showEmptySearch = hasSearched && !showBuses && !loading;

  return (
    <>
      <Helmet>
        <title>Ticket Bus - Pesan Tiket Bus Online</title>
      </Helmet>
      <div
        className="min-h-screen flex flex-col lg:flex-row relative"
        style={{
          backgroundImage: `url("https://img5.goodfon.com/wallpaper/nbig/6/6a/temsa-maraton-coach-bus.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/85" />
        {/* Search Panel - sticky & compact */}
        <div className="relative z-10 w-full lg:w-[380px] xl:w-[400px] shrink-0 sticky top-0 self-start lg:min-h-screen bg-slate-800/95 backdrop-blur p-4 sm:p-5 lg:p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-700/50">
          <div className="flex flex-col items-center mb-4 lg:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary-500/20 flex items-center justify-center mb-2 sm:mb-3">
              <i className="ri-bus-line text-xl sm:text-2xl text-primary-400"></i>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5">Ticket Bus</h1>
            <p className="text-slate-400 text-center text-xs max-w-[240px]">
              Pesan tiket bus online dengan mudah dan cepat
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <div>
              <label className="block text-slate-400 text-xs sm:text-sm mb-1">Kota Asal</label>
              <select
                className="input-custom bg-slate-700/50 border-slate-600 text-white"
                value={filters.from || ""}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              >
                <option value="">Pilih kota asal</option>
                {cities.map((c, i) => (
                  <option key={i} value={c.ville}>{c.ville}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs sm:text-sm mb-1">Kota Tujuan</label>
              <select
                className="input-custom bg-slate-700/50 border-slate-600 text-white"
                value={filters.to || ""}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              >
                <option value="">Pilih kota tujuan</option>
                {cities.map((c, i) => (
                  <option key={i} value={c.ville}>{c.ville}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs sm:text-sm mb-1">Tanggal Keberangkatan</label>
              <input
                className="input-custom bg-slate-700/50 border-slate-600 text-white"
                min={new Date().toISOString().split("T")[0]}
                type="date"
                value={filters.journeyDate || ""}
                onChange={(e) =>
                  setFilters({ ...filters, journeyDate: e.target.value })
                }
              />
            </div>
            <button
              onClick={getBusesByFilter}
              disabled={loading}
              className="btn-primary-custom w-full py-2.5 sm:py-3 bg-primary-500 hover:bg-primary-600 flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-lg"></i>
                  Memuat...
                </>
              ) : (
                <>
                  <i className="ri-search-line"></i>
                  Cari Bus
                </>
              )}
            </button>
          </div>

          <div className="mt-4 lg:mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="block w-full py-2 sm:py-2.5 rounded-xl font-semibold text-primary-400 hover:text-primary-300 border border-primary-500/50 hover:border-primary-400 transition-all text-sm"
            >
              Login
            </Link>
            <p className="text-slate-500 text-xs">
              Belum punya akun?{" "}
              <Link to="/register" className="text-primary-400 hover:underline">
                Daftar
              </Link>
            </p>
          </div>
        </div>

        {/* Bus Results */}
        <div className="relative z-10 flex-1 overflow-auto p-4 sm:p-6 lg:p-8 xl:p-10 min-h-0">
          <div className="max-w-4xl mx-auto w-full">
            {showBuses && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {hasSearched ? `Hasil Pencarian (${buses.length} bus)` : "Bus Tersedia"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {hasSearched
                    ? `${filters.from || ""} → ${filters.to || ""} • ${filters.journeyDate || ""}`
                    : "Pilih rute dan tanggal untuk filter"}
                </p>
              </div>
            )}

            {loading && !showBuses ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[400px]">
                <i className="ri-loader-4-line text-6xl text-primary-500 animate-spin mb-4"></i>
                <p className="text-slate-400">Memuat data bus...</p>
              </div>
            ) : showEmptySearch ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[400px] text-slate-400">
                <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                  <i className="ri-search-line text-4xl"></i>
                </div>
                <p className="text-xl font-medium text-white">Tidak ada bus ditemukan</p>
                <p className="text-sm mt-1">Coba rute atau tanggal lain</p>
              </div>
            ) : !showBuses ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] sm:min-h-[400px] text-slate-400">
                <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                  <i className="ri-bus-line text-4xl"></i>
                </div>
                <p className="text-xl font-medium text-white">Belum ada data bus</p>
                <p className="text-sm mt-1">Jalankan seed: npm run db:seed</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
                {buses.map((bus, index) => (
                  <Bus key={bus.id || index} bus={bus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Index;
