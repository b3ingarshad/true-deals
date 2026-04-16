import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const BASE_URL = "https://true-deals.vercel.app";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);

  const menuRef = useRef(null);
  const desktopBellRef = useRef(null); // ✅ separate refs
  const mobileBellRef = useRef(null);
  const location = useLocation();

  // ✅ Re-fetch pending count on EVERY route change
  // This means after admin approves/rejects on ManageProductsPage
  // and the page re-renders, the count drops automatically
  useEffect(() => {
    fetchPendingCount();
  }, [location.pathname]);

  // Also poll every 30s
  useEffect(() => {
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setBellOpen(false);
  }, [location]);

  // Close dropdowns when clicking outside — handles both bell refs properly
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      const clickedInsideBell =
        (desktopBellRef.current &&
          desktopBellRef.current.contains(event.target)) ||
        (mobileBellRef.current && mobileBellRef.current.contains(event.target));
      if (!clickedInsideBell) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/products/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setPendingCount(data.length);
    } catch (error) {
      console.error("Failed to fetch pending count:", error);
    }
  };

  const navLinks = [
    { to: "/admin", label: "Home" },
    { to: "/admin/products", label: "Manage Products", badge: pendingCount },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/bids", label: "Manage Bids" },
    { to: "/admin/orders", label: "Manage Orders" },
  ];

  const BellDropdown = () => (
    <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-bold text-white">Pending Approvals</span>
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
            {pendingCount} waiting
          </span>
        )}
      </div>
      <div className="p-4">
        {pendingCount === 0 ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-gray-400 text-sm font-medium">All caught up!</p>
            <p className="text-gray-500 text-xs mt-1">
              No listings pending approval.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-300 text-sm mb-4">
              <span className="text-amber-400 font-black">{pendingCount}</span>{" "}
              product{pendingCount > 1 ? "s are" : " is"} waiting for your
              review.
            </p>
            <Link
              to="/admin/products"
              onClick={(e) => {
                e.stopPropagation();
                setBellOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Review Now
            </Link>
          </>
        )}
      </div>
    </div>
  );

  const BellButton = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setBellOpen((prev) => !prev);
      }}
      className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      title="Pending Approvals"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-pulse">
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      )}
    </button>
  );

  return (
    <nav
      className="fixed w-full z-50 bg-gray-900 border-b border-gray-800"
      ref={menuRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <Link to="/admin" className="flex-shrink-0">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              DealHub Admin
            </h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
                {link.badge > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="h-6 w-px bg-gray-700 mx-2"></div>

            {/* Desktop Bell */}
            <div className="relative" ref={desktopBellRef}>
              <BellButton />
              {bellOpen && <BellDropdown />}
            </div>

            <Link
              to="/admin/profile"
              className="text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              {localStorage.getItem("username") || "Profile"}
            </Link>
            <Link
              to="/logout"
              className="ml-4 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-bold"
            >
              Logout
            </Link>
          </div>

          {/* Mobile: Bell + Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <div className="relative" ref={mobileBellRef}>
              <BellButton />
              {bellOpen && <BellDropdown />}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors"
            >
              {menuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                {link.label}
                {link.badge > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-gray-800 my-2 pt-2">
              <Link
                to="/admin/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-teal-400 hover:bg-gray-800"
              >
                {localStorage.getItem("username") || "Profile"}
              </Link>
              <Link
                to="/logout"
                className="block px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-gray-800 mt-1"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
