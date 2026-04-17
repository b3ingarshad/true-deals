import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL = "https://true-deals.vercel.app";

const AuctionProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("recent");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "auction" | "fixed"

  // Buy Now modal state
  const [buyProduct, setBuyProduct] = useState(null);
  const [buyLoading, setBuyLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(fetchProducts, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter & Sort ──
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "auction" && product.listingType !== "fixed") ||
        (activeTab === "fixed" && product.listingType === "fixed");
      return matchesSearch && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "price-low": {
          const pa = a.listingType === "fixed" ? a.fixedPrice : a.currentBid;
          const pb = b.listingType === "fixed" ? b.fixedPrice : b.currentBid;
          return pa - pb;
        }
        case "price-high": {
          const pa = a.listingType === "fixed" ? a.fixedPrice : a.currentBid;
          const pb = b.listingType === "fixed" ? b.fixedPrice : b.currentBid;
          return pb - pa;
        }
        case "ending":
          return new Date(a.auctionEndTime) - new Date(b.auctionEndTime);
        case "recent":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const auctionCount = products.filter((p) => p.listingType !== "fixed").length;
  const fixedCount = products.filter((p) => p.listingType === "fixed").length;

  // ── Auction Bid Handlers ──
  const handlePlaceBidClick = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setSelectedProduct(product);
    setBidAmount("");
  };

  const handleCloseModal = () => setSelectedProduct(null);

  const handleConfirmBid = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= selectedProduct.currentBid) {
      toast.error("Bid must be higher than current bid!");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/bids/${selectedProduct._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(bidAmount) }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Bid placed successfully!");
      const updatedRes = await fetch(`${BASE_URL}/api/products`);
      const updatedData = await updatedRes.json();
      setProducts(updatedData);
      handleCloseModal();
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  // ── Buy Now Handlers ──
  const handleBuyNowClick = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setBuyProduct(product);
  };

  const handleCloseBuyModal = () => setBuyProduct(null);

  const handleConfirmBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setBuyLoading(true);
    try {
      // Create a direct order for fixed-price product
      const res = await fetch(`${BASE_URL}/api/payments/buy-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: buyProduct._id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Initiate Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "TrueDeals",
        description: buyProduct.title,
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${BASE_URL}/api/payments/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message);

            toast.success("Purchase successful! Check your orders.");
            handleCloseBuyModal();
            navigate("/orders");
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user"))?.username || "",
          email: JSON.parse(localStorage.getItem("user"))?.email || "",
        },
        theme: { color: "#0d9488" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      handleCloseBuyModal();
    } catch (error) {
      toast.error(error.message || "Could not initiate purchase");
    } finally {
      setBuyLoading(false);
    }
  };

  const calculateTimeLeft = (endTime) => {
    const difference = new Date(endTime) - new Date();
    if (difference <= 0) return "Ended";
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen font-sans">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 md:p-14 text-white mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-brand-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-brand-400 opacity-20 rounded-full blur-3xl"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
          TrueDeals Marketplace
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl relative z-10 leading-relaxed">
          Bid on exclusive auctions or buy instantly at fixed prices. Discover
          unique items from verified sellers.
        </p>
        <div className="flex gap-4 mt-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold">
            🏷️ {auctionCount} Live Auctions
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold">
            🛒 {fixedCount} Buy Now
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col gap-4">
          {/* Tab Toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { key: "all", label: "All Products", count: products.length },
              { key: "auction", label: "🏷️ Auctions", count: auctionCount },
              { key: "fixed", label: "🛒 Buy Now", count: fixedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? "bg-brand-100 text-brand-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <select
                className="flex-1 min-w-[12rem] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>

              <select
                className="flex-1 min-w-[12rem] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="recent">Recently Added</option>
                <option value="ending">Ending Soon</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const isFixed = product.listingType === "fixed";
            const isAuctionEnded =
              !isFixed && new Date(product.auctionEndTime) < new Date();

            return isFixed ? (
              // ── Fixed Price Card ──
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-2xl"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    🛒 FIXED PRICE
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 block">
                    {product.category || "General"}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-slate-700 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {product.description}
                  </p>

                  <div className="flex-grow"></div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-medium text-gray-500">
                        Fixed Price
                      </span>
                      <span className="text-2xl font-black text-gray-900">
                        ₹{Number(product.fixedPrice).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBuyNowClick(product)}
                      className="w-full py-3.5 rounded-xl font-bold transition-all bg-slate-800 text-white hover:bg-slate-900 hover:shadow-lg transform hover:-translate-y-0.5 shadow-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // ── Auction Card ──
              <div
                key={product._id}
                className={`bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group flex flex-col transition-all duration-300 hover:shadow-2xl ${isAuctionEnded ? "opacity-75 grayscale-[20%]" : ""}`}
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${!isAuctionEnded && "group-hover:scale-110"}`}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    🏷️ AUCTION
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1.5 z-10">
                    <span
                      className={`w-2 h-2 rounded-full ${isAuctionEnded ? "bg-gray-400" : "bg-brand-500 animate-pulse"}`}
                    ></span>
                    {product.bidCount || 0} Bids
                  </div>
                  {isAuctionEnded && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-10">
                      <span className="bg-red-500 text-white font-black px-6 py-2 rounded-xl rotate-12 uppercase tracking-widest border-2 border-white/20 shadow-2xl text-lg">
                        Ended
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider mb-2 block">
                    {product.category || "General"}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex-grow"></div>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-gray-500">
                        Current Bid
                      </span>
                      <span className="text-2xl font-black text-gray-900">
                        ₹{Number(product.currentBid).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-bold bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="mr-2">⏱</span>
                      <span
                        className={
                          isAuctionEnded ? "text-red-500" : "text-brand-600"
                        }
                      >
                        {calculateTimeLeft(product.auctionEndTime)}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`mt-6 w-full py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                      isAuctionEnded
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 hover:shadow-md transform hover:-translate-y-0.5"
                    }`}
                    disabled={isAuctionEnded}
                    onClick={() => handlePlaceBidClick(product)}
                  >
                    {isAuctionEnded ? "Auction Ended" : "Place Bid Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 text-lg">
            Try adjusting your search or browsing a different category.
          </p>
          <button
            className="mt-6 px-6 py-2 bg-brand-50 text-brand-700 font-bold rounded-lg hover:bg-brand-100 transition-colors"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setActiveTab("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Buy Now Confirmation Modal ── */}
      {buyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseBuyModal}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full relative z-10">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors z-20"
              onClick={handleCloseBuyModal}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Product image header */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={buyProduct.image}
                alt={buyProduct.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  {buyProduct.category}
                </span>
                <h3 className="text-2xl font-bold line-clamp-1">
                  {buyProduct.title}
                </h3>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Order summary */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Order Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Item</span>
                    <span className="font-semibold text-gray-800 line-clamp-1 max-w-[60%] text-right">
                      {buyProduct.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {buyProduct.category}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Total</span>
                    <span className="text-3xl font-black text-gray-900">
                      ₹{Number(buyProduct.fixedPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-gray-400 mb-5">
                You will be redirected to a secure Razorpay payment page to
                complete your purchase.
              </p>

              <div className="flex gap-4">
                <button
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  onClick={handleCloseBuyModal}
                >
                  Cancel
                </button>
                <button
                  disabled={buyLoading}
                  onClick={handleConfirmBuyNow}
                  className="flex-[2] px-4 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {buyLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Confirm & Pay"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bid Modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full relative z-10">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-black/30 bg-black/20 backdrop-blur-md p-2 rounded-full transition-colors z-20"
              onClick={handleCloseModal}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative h-56 bg-gray-100">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1 block">
                  {selectedProduct.category}
                </span>
                <h3 className="text-2xl font-bold line-clamp-2 leading-tight">
                  {selectedProduct.title}
                </h3>
                <div className="mt-3 inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg">
                  <p className="opacity-90 text-sm">
                    Current Bid:{" "}
                    <span className="font-bold text-yellow-400 text-lg">
                      ₹{Number(selectedProduct.currentBid).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-8 bg-brand-50 p-6 rounded-2xl border border-brand-100">
                <label className="block text-sm font-bold text-brand-800 mb-3 text-center">
                  Enter Your Maximum Bid (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-brand-600 font-black text-xl">₹</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={selectedProduct.currentBid + 0.01}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="block w-full pl-10 pr-4 py-4 border-2 border-brand-200 rounded-xl focus:ring-0 focus:border-brand-500 transition-colors text-2xl font-black text-gray-900 bg-white shadow-inner text-center"
                    placeholder={`${(selectedProduct.currentBid + 1).toFixed(0)}`}
                    autoFocus
                  />
                </div>
                <p className="mt-3 text-sm text-center font-medium text-brand-600/80">
                  Must be at least ₹
                  {(selectedProduct.currentBid + 1).toFixed(0)}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  className="w-1/3 px-4 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="w-2/3 px-4 py-4 bg-brand-600 text-white font-black rounded-xl hover:bg-brand-700 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  onClick={handleConfirmBid}
                >
                  Confirm Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionProducts;
