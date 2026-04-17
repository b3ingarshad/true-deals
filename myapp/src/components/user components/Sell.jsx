import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const BASE_URL = "https://true-deals.vercel.app";

const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "accessories", label: "Accessories" },
  { value: "fashion", label: "Fashion" },
  { value: "home", label: "Home" },
  { value: "art", label: "Art" },
];

const AUCTION_DURATIONS = [
  { value: 1, label: "1 Day" },
  { value: 3, label: "3 Days" },
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
];

const initialForm = {
  productName: "",
  description: "",
  selectedCategory: "",
  image: null,
  // auction
  startingBid: "",
  auctionDuration: 1,
  // fixed
  fixedPrice: "",
};

const AuctionPage = () => {
  const [listingType, setListingType] = useState("auction"); // "auction" | "fixed"
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false); // for fixed-price success state
  const [products, setProducts] = useState([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => forceUpdate((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => {
    setForm(initialForm);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", form.productName);
      formData.append("description", form.description);
      formData.append("category", form.selectedCategory);
      formData.append("listingType", listingType);
      formData.append("image", form.image);

      if (listingType === "auction") {
        formData.append("startingBid", form.startingBid);
        formData.append(
          "auctionEndTime",
          new Date(
            Date.now() + form.auctionDuration * 24 * 60 * 60 * 1000,
          ).toISOString(),
        );
      } else {
        formData.append("fixedPrice", form.fixedPrice);
      }

      const res = await fetch(`${BASE_URL}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (listingType === "auction") {
        toast.success("Auction listed successfully!");
        fetchProducts();
        resetForm();
      } else {
        setSubmitted(true); // show pending state
      }
    } catch (error) {
      toast.error(error.message || "Failed to list product");
    } finally {
      setSubmitting(false);
    }
  };

  // Bid modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

  const handlePlaceBidClick = (product) => {
    setSelectedProduct(product);
    setBidAmount("");
  };

  const handleCloseModal = () => setSelectedProduct(null);

  const handleConfirmBid = async () => {
    if (!bidAmount) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/bids/${selectedProduct._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: bidAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Bid placed successfully!");
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.message || "Bid failed");
    }
  };

  const getTimeRemaining = (endTime) => {
    const total = new Date(endTime) - new Date();
    if (total <= 0) return "Auction Ended";
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Separate products by listing type for display
  const auctionProducts = products.filter((p) => p.listingType !== "fixed");
  const fixedProducts = products.filter((p) => p.listingType === "fixed");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen font-sans">
      {/* ── Listing Type Toggle ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          List a Product
        </h1>
        <p className="text-gray-500 mb-6">
          Choose how you want to sell your item on TrueDeals.
        </p>

        <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button
            onClick={() => {
              setListingType("auction");
              resetForm();
            }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              listingType === "auction"
                ? "bg-white text-brand-700 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🏷️ Auction Listing
          </button>
          <button
            onClick={() => {
              setListingType("fixed");
              resetForm();
            }}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              listingType === "fixed"
                ? "bg-white text-brand-700 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🛒 Fixed Price Listing
          </button>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16 border border-gray-100 flex flex-col md:flex-row">
        {/* Left Panel */}
        <div
          className={`text-white p-10 md:w-1/3 flex flex-col justify-center relative overflow-hidden ${
            listingType === "auction"
              ? "bg-gradient-to-br from-brand-600 to-brand-800"
              : "bg-gradient-to-br from-slate-700 to-slate-900"
          }`}
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

          {listingType === "auction" ? (
            <>
              <div className="text-5xl mb-4 relative z-10">🏷️</div>
              <h2 className="text-3xl font-extrabold mb-4 relative z-10">
                Auction Listing
              </h2>
              <p className="text-brand-100 mb-6 relative z-10 leading-relaxed">
                Let buyers compete and drive your price up! Set a starting bid
                and watch the offers roll in.
              </p>
              <ul className="space-y-2 relative z-10 text-sm text-brand-100">
                <li className="flex items-center gap-2">
                  <span className="text-brand-300">✓</span> Price can increase
                  via bidding
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-300">✓</span> Goes live
                  immediately
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-300">✓</span> Choose auction
                  duration
                </li>
              </ul>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4 relative z-10">🛒</div>
              <h2 className="text-3xl font-extrabold mb-4 relative z-10">
                Fixed Price Listing
              </h2>
              <p className="text-slate-300 mb-6 relative z-10 leading-relaxed">
                Set your price and sell instantly. No bidding wars — buyers pay
                exactly what you ask.
              </p>
              <ul className="space-y-2 relative z-10 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Fixed,
                  non-negotiable price
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span> Requires admin
                  approval first
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Buyers can purchase
                  instantly
                </li>
              </ul>
            </>
          )}
        </div>

        {/* Right Panel — Form or Success */}
        <div className="p-10 md:w-2/3 bg-gray-50/50">
          {/* Fixed price post-submit success */}
          {submitted && listingType === "fixed" ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-4xl mb-6 shadow-inner">
                ⏳
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                Listing Submitted!
              </h3>
              <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
                Your fixed-price listing has been sent for admin review. It will
                go live on the marketplace once approved — usually within 24
                hours.
              </p>
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow transition-all"
              >
                List Another Product
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => handleField("productName", e.target.value)}
                    placeholder="e.g. Vintage Camera"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={form.selectedCategory}
                    onChange={(e) =>
                      handleField("selectedCategory", e.target.value)
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm"
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleField("description", e.target.value)}
                  placeholder="Describe your product in detail..."
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auction-specific fields */}
                {listingType === "auction" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Starting Bid (₹)
                      </label>
                      <input
                        type="number"
                        value={form.startingBid}
                        onChange={(e) =>
                          handleField("startingBid", e.target.value)
                        }
                        required
                        min="1"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Auction Duration
                      </label>
                      <select
                        value={form.auctionDuration}
                        onChange={(e) =>
                          handleField("auctionDuration", Number(e.target.value))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm"
                      >
                        {AUCTION_DURATIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Fixed price field */}
                {listingType === "fixed" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fixed Price (₹)
                    </label>
                    <input
                      type="number"
                      value={form.fixedPrice}
                      onChange={(e) =>
                        handleField("fixedPrice", e.target.value)
                      }
                      required
                      min="1"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white shadow-sm"
                    />
                    <p className="mt-1.5 text-xs text-amber-600 font-medium flex items-center gap-1">
                      <span>⚠️</span> Listing will be reviewed by admin before
                      going live
                    </p>
                  </div>
                )}

                <div className={listingType === "fixed" ? "" : ""}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleField("image", e.target.files[0])}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${
                    listingType === "auction"
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 focus:ring-brand-500"
                      : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 focus:ring-slate-500"
                  } disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {submitting
                    ? "Submitting..."
                    : listingType === "auction"
                      ? "List for Auction"
                      : "Submit for Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── Product Listings ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Marketplace
            </h2>
            <p className="text-gray-500 mt-2">
              Browse auctions and fixed-price listings
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-500">Be the first to list an item!</p>
          </div>
        ) : (
          <>
            {/* Auction Products */}
            {auctionProducts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🏷️</span>
                  <h3 className="text-xl font-bold text-gray-800">
                    Live Auctions
                  </h3>
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-sm font-bold rounded-full">
                    {auctionProducts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {auctionProducts.map((product) => (
                    <div
                      className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 overflow-hidden group transition-all duration-300 flex flex-col"
                      key={product._id}
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
                        <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          AUCTION
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                          {product.bidCount || 0} Bids
                        </div>
                        {product.status === "ended" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg rotate-12 uppercase tracking-widest border-2 border-white/20 shadow-xl">
                              Ended
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 block">
                          {product.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {product.title}
                        </h3>
                        <div className="flex-grow"></div>
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-500">
                              Current Bid
                            </span>
                            <span className="text-2xl font-black text-gray-900">
                              ₹{Number(product.currentBid).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="mr-2">⏱</span>
                            <span
                              className={
                                getTimeRemaining(product.auctionEndTime) ===
                                "Auction Ended"
                                  ? "text-red-500"
                                  : "text-brand-600"
                              }
                            >
                              {getTimeRemaining(product.auctionEndTime)}
                            </span>
                          </div>
                        </div>
                        <button
                          className={`mt-6 w-full py-3 rounded-xl font-bold transition-all ${
                            product.status === "ended"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white"
                          }`}
                          disabled={product.status === "ended"}
                          onClick={() => handlePlaceBidClick(product)}
                        >
                          {product.status === "ended"
                            ? "Auction Ended"
                            : "Place Bid Now"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fixed Price Products */}
            {fixedProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🛒</span>
                  <h3 className="text-xl font-bold text-gray-800">Buy Now</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full">
                    {fixedProducts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {fixedProducts.map((product) => (
                    <div
                      className="bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 overflow-hidden group transition-all duration-300 flex flex-col"
                      key={product._id}
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
                        <div className="absolute top-3 left-3 bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          FIXED PRICE
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                          {product.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex-grow"></div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-end mb-4">
                            <span className="text-sm text-gray-500">Price</span>
                            <span className="text-2xl font-black text-gray-900">
                              ₹{Number(product.fixedPrice).toLocaleString()}
                            </span>
                          </div>
                          <button className="w-full py-3 rounded-xl font-bold transition-all bg-slate-800 text-white hover:bg-slate-900 hover:shadow-md transform hover:-translate-y-0.5">
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Bid Modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full relative z-10">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors z-20"
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
            <div className="relative h-48 bg-gray-100">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <h3 className="text-2xl font-bold line-clamp-1">
                  {selectedProduct.title}
                </h3>
                <p className="opacity-90 mt-1">
                  Current Bid:{" "}
                  <span className="font-bold text-brand-400">
                    ₹{Number(selectedProduct.currentBid).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Bid Amount (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={selectedProduct.currentBid + 0.01}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="block w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-brand-500 transition-colors text-lg font-bold bg-gray-50"
                    placeholder={`Min. ${Math.ceil(selectedProduct.currentBid + 1)}`}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Must be higher than ₹
                  {Number(selectedProduct.currentBid).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  className="flex-1 px-4 py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  className="flex-[2] px-4 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
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

export default AuctionPage;
