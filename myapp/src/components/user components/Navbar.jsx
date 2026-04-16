import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);

  const menuRef = useRef(null);
  const desktopBellRef = useRef(null); // ✅ separate refs — fixes double-ref bug
  const mobileBellRef = useRef(null);
  const location = useLocation();

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Close menus when clicking outside — properly handles both bell refs
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

  // ✅ fetchNotifications as useCallback so it's stable across renders
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // Poll every 30s
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // ✅ Mark single as read — optimistic update + re-fetch to sync with DB
  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation(); // prevent bell closing
    try {
      const token = localStorage.getItem("token");

      // Optimistic UI update immediately
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );

      const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      // If server call failed, revert
      if (!res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: false } : n)),
        );
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // ✅ Mark all as read — optimistic update
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");

      // Optimistic UI update immediately
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Revert on failure
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      fetchNotifications();
    }
  };

  // ✅ Derived from state — always in sync
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navLinkClass =
    "text-gray-700 hover:text-brand-600 font-medium transition-colors duration-300 relative group py-2";
  const mobileNavLinkClass =
    "block text-gray-800 hover:bg-brand-50 hover:text-brand-600 rounded-lg px-4 py-3 font-medium transition-colors";

  // Reusable notification list content
  const NotificationList = () => (
    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">🔔</div>
          <p className="text-gray-500 text-sm font-medium">
            No notifications yet
          </p>
          <p className="text-gray-400 text-xs mt-1">
            You&apos;ll be notified when admin reviews your listings
          </p>
        </div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className={`px-4 py-3.5 flex items-start gap-3 transition-colors ${
              notif.read ? "bg-white" : "bg-brand-50/40"
            }`}
          >
            {/* Type icon */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                notif.type === "approved"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {notif.type === "approved" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug">
                Your product{" "}
                <span className="font-bold text-gray-900">
                  &quot;{notif.productTitle}&quot;
                </span>{" "}
                {notif.type === "approved" ? (
                  <span className="text-green-600 font-bold">
                    was approved ✅
                  </span>
                ) : (
                  <span className="text-red-500 font-bold">
                    was rejected ❌
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {!notif.read && (
                <button
                  onClick={(e) => handleMarkAsRead(e, notif._id)}
                  className="mt-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors underline-offset-2 hover:underline"
                >
                  Mark as read
                </button>
              )}
            </div>

            {/* Unread dot */}
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2"></div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const BellDropdown = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <NotificationList />

      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
          <p className="text-xs text-gray-400">
            Showing last {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );

  const BellButton = () => (
    <button
      onClick={() => setBellOpen((prev) => !prev)}
      className="relative p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
      title="Notifications"
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
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
      ref={menuRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Brand */}
          <Link
            to={user ? "/user" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-all duration-300">
              D
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              DealHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to={user ? "/user" : "/"} className={navLinkClass}>
              Home
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {user ? (
              <>
                <Link to="/products" className={navLinkClass}>
                  Products
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/sell" className={navLinkClass}>
                  Sell
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/auction-buy" className={navLinkClass}>
                  Buy
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/orders" className={navLinkClass}>
                  Orders
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {/* Desktop Bell */}
                <div className="relative" ref={desktopBellRef}>
                  <BellButton />
                  {bellOpen && <BellDropdown />}
                </div>

                {/* Profile + Logout */}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-brand-600 font-medium transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border border-brand-200">
                      {(user?.username || user?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    {user?.username || user?.name}
                  </Link>
                  <Link
                    to="/logout"
                    className="px-4 py-2 rounded-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Logout
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-brand-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Bell + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="relative" ref={mobileBellRef}>
                <BellButton />
                {bellOpen && <BellDropdown />}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <div className="w-6 h-5 flex flex-col justify-between relative">
                <span
                  className={`w-full h-0.5 bg-current transform transition-all duration-300 origin-left ${menuOpen ? "rotate-45 translate-x-px translate-y-[-1px]" : ""}`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-current transform transition-all duration-300 origin-left ${menuOpen ? "-rotate-45 translate-x-px translate-y-px" : ""}`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 py-4 space-y-1">
          <Link to={user ? "/user" : "/"} className={mobileNavLinkClass}>
            Home
          </Link>
          {user ? (
            <>
              <Link to="/products" className={mobileNavLinkClass}>
                Products
              </Link>
              <Link to="/sell" className={mobileNavLinkClass}>
                Sell
              </Link>
              <Link to="/auction-buy" className={mobileNavLinkClass}>
                Buy
              </Link>
              <Link to="/orders" className={mobileNavLinkClass}>
                Orders
              </Link>
              <div className="h-px bg-gray-100 my-4"></div>
              <Link to="/profile" className={mobileNavLinkClass}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                    {(user?.username || user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <span>Profile ({user?.username || user?.name})</span>
                </div>
              </Link>
              <Link
                to="/logout"
                className="block text-red-600 hover:bg-red-50 rounded-lg px-4 py-3 font-medium transition-colors mt-1"
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <div className="h-px bg-gray-100 my-4"></div>
              <div className="flex flex-col gap-2 mt-4 px-2">
                <Link
                  to="/login"
                  className="w-full text-center px-5 py-3 rounded-xl text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full text-center px-5 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
