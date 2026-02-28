import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";

function DefaultLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.users);

  const userMenu = [
    { name: "Home", path: "/easy-booking", icon: "ri-home-line" },
    { name: "Bookings", path: "/bookings", icon: "ri-file-list-line" },
    { name: "Logout", path: "/logout", icon: "ri-logout-box-line" },
  ];
  const adminMenu = [
    { name: "Home", path: "/easy-booking", icon: "ri-home-line" },
    { name: "Buses", path: "/admin/buses", icon: "ri-bus-line" },
    { name: "Users", path: "/admin/users", icon: "ri-user-line" },
    { name: "Bookings", path: "/admin/bookings", icon: "ri-file-list-line" },
    { name: "Logout", path: "/logout", icon: "ri-logout-box-line" },
  ];
  const menu = user?.isAdmin ? adminMenu : userMenu;
  let activeRoute = window.location.pathname;
  if (window.location.pathname.includes("book-now")) activeRoute = "/easy-booking";

  const handleNav = (path) => {
    if (path === "/logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(path);
    }
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {menu.map((item, key) => (
        <div
          key={key}
          onClick={() => handleNav(item.path)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            activeRoute === item.path
              ? "bg-primary-600 text-white"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          <i className={`${item.icon} text-xl shrink-0`}></i>
          {(!collapsed || sidebarOpen) && (
            <span className="font-medium">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-800 border-r border-slate-700 transition-all duration-300 ${
          collapsed ? "w-20" : "w-56"
        }`}
      >
        <div className="p-4 flex justify-between items-center shrink-0">
          {!collapsed && (
            <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <i className={`ri-${collapsed ? "menu-2" : "close"}-line text-xl`}></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-800 z-50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 shrink-0"
          >
            <i className="ri-menu-line text-2xl text-gray-600"></i>
          </button>
          <img
            onClick={() => navigate("/")}
            src={logo}
            alt="Ticket Bus"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl cursor-pointer object-cover hover:opacity-90 transition-opacity shrink-0"
          />
          <div className="flex-1 min-w-0" />
          <div className="text-right min-w-0 shrink-0">
            <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
              {user?.name}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm truncate">{user?.email}</p>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DefaultLayout;
