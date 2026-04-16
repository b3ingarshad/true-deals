import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const BASE_URL = "https://true-deals.vercel.app";

const CATEGORIES = ["electronics", "accessories", "fashion", "home", "art"];

const initialForm = {
  title: "",
  description: "",
  category: "",
  listingType: "auction",
  startingBid: "",
  auctionEndTime: "",
  fixedPrice: "",
  image: null,
};

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending"
  const [products, setProducts] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchPendingProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetches pending products and notifies Navbar bell to re-sync
  const fetchPendingProducts = async () => {
    setLoadingPending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/products/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPendingProducts(data);
        // Tell Navbar bell to refresh its count
        window.dispatchEvent(new CustomEvent("pendingCountUpdated"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddProduct = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("listingType", form.listingType);
      formData.append("image", form.image);

      if (form.listingType === "auction") {
        formData.append("startingBid", form.startingBid);
        formData.append("auctionEndTime", form.auctionEndTime);
      } else {
        formData.append("fixedPrice", form.fixedPrice);
      }

      const res = await fetch(`${BASE_URL}/api/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");

      toast.success("Product submitted! Waiting for admin approval.");
      fetchProducts();
      fetchPendingProducts();
      setForm(initialForm);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      listingType: product.listingType || "auction",
      startingBid: product.startingBid || "",
      auctionEndTime: product.auctionEndTime?.slice(0, 16) || "",
      fixedPrice: product.fixedPrice || "",
      image: null,
    });
  };

  const handleUpdateProduct = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);

      if (form.listingType === "auction") {
        formData.append("startingBid", form.startingBid);
        formData.append("auctionEndTime", form.auctionEndTime);
      } else {
        formData.append("fixedPrice", form.fixedPrice);
      }

      if (form.image) formData.append("image", form.image);

      const res = await fetch(
        `${BASE_URL}/api/products/${currentProduct._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Product updated!");
      fetchProducts();
      handleCancelEdit();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setForm(initialForm);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/api/products/${productToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      toast.success("Product deleted");
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/products/${productId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Product approved and is now live!");
      fetchPendingProducts(); // also fires pendingCountUpdated event
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/products/${productId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Product rejected");
      fetchPendingProducts(); // also fires pendingCountUpdated event
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 pl-2 border-l-4 border-teal-500">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage auction and fixed-price listings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Product List */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Products
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "all" ? "bg-teal-100 text-teal-700" : "bg-gray-200 text-gray-500"}`}
                >
                  {products.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === "pending"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending Approval
                {pendingProducts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 animate-pulse">
                    {pendingProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* All Products Table */}
            {activeTab === "all" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-teal-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Current Inventory
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">
                          Img
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.length > 0 ? (
                        products.map((product) => (
                          <tr
                            key={product._id}
                            className="hover:bg-gray-50/80 transition-colors group"
                          >
                            <td className="px-5 py-4">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150";
                                }}
                              />
                            </td>
                            <td className="px-5 py-4 max-w-xs">
                              <div className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                                {product.title}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 capitalize">
                                {product.category}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              {product.listingType === "fixed" ? (
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                                  🛒 Fixed
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full">
                                  🏷️ Auction
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-black text-gray-900">
                                {product.listingType === "fixed"
                                  ? `₹${Number(product.fixedPrice).toLocaleString()}`
                                  : `₹${Number(product.startingBid || 0).toLocaleString()}`}
                              </span>
                              {product.listingType !== "fixed" && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  starting bid
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                                  product.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : product.status === "ended"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {product.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Edit"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-16 text-center">
                            <div className="text-gray-300 mb-3">
                              <svg
                                className="w-16 h-16 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                              </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-500">
                              No products in inventory.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Approvals */}
            {activeTab === "pending" && (
              <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-amber-100 bg-amber-50/60 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Pending Approvals
                    {pendingProducts.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold ml-1">
                        {pendingProducts.length} waiting
                      </span>
                    )}
                  </h2>
                </div>

                {loadingPending ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
                  </div>
                ) : pendingProducts.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-lg font-bold text-gray-700">
                      All caught up!
                    </p>
                    <p className="text-gray-400 mt-1">
                      No listings waiting for approval.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-5 px-6 py-5 hover:bg-gray-50/60 transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="font-bold text-gray-900 line-clamp-1">
                              {product.title}
                            </div>
                            {product.listingType === "fixed" ? (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full flex-shrink-0">
                                🛒 Fixed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full flex-shrink-0">
                                🏷️ Auction
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                            {product.description}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                              {product.category}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              {product.listingType === "fixed"
                                ? `₹${Number(product.fixedPrice).toLocaleString()} (Fixed)`
                                : `₹${Number(product.startingBid).toLocaleString()} starting bid`}
                            </span>
                            {product.createdBy && (
                              <span className="text-xs text-gray-400">
                                by {product.createdBy.username}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleReject(product._id)}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm rounded-xl transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(product._id)}
                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-bold text-sm rounded-xl transition-colors shadow-sm"
                          >
                            ✓ Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Add / Edit Form */}
          <div className="lg:w-1/3">
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28 transition-all ${isEditing ? "ring-2 ring-teal-500 ring-offset-2" : ""}`}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                {isEditing ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>{" "}
                    Edit Product
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>{" "}
                    Add New Product
                  </>
                )}
              </h2>

              {/* Listing Type Toggle (only when adding) */}
              {!isEditing && (
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, listingType: "auction" }))
                    }
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      form.listingType === "auction"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    🏷️ Auction
                  </button>
                  <button
                    onClick={() =>
                      setForm((f) => ({ ...f, listingType: "fixed" }))
                    }
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      form.listingType === "fixed"
                        ? "bg-white text-slate-700 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    🛒 Fixed Price
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Vintage Camera"
                    value={form.title}
                    onChange={handleField}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Product details..."
                    value={form.description}
                    onChange={handleField}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleField}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auction fields */}
                {form.listingType === "auction" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Starting Bid (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-gray-500 pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="startingBid"
                          placeholder="0.00"
                          value={form.startingBid}
                          onChange={handleField}
                          min="0"
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Auction End Time
                      </label>
                      <input
                        type="datetime-local"
                        name="auctionEndTime"
                        value={form.auctionEndTime}
                        onChange={handleField}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </>
                )}

                {/* Fixed price field */}
                {form.listingType === "fixed" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Fixed Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-gray-500 pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="fixedPrice"
                        placeholder="0.00"
                        value={form.fixedPrice}
                        onChange={handleField}
                        min="1"
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Product Image{" "}
                    {isEditing && (
                      <span className="text-xs font-normal text-gray-400">
                        (optional)
                      </span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image: e.target.files[0] }))
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        className="flex-1 px-4 py-3 bg-white text-gray-700 font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={submitting}
                        className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition-all disabled:opacity-60"
                        onClick={handleUpdateProduct}
                      >
                        {submitting ? "Saving..." : "Update"}
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={submitting}
                      className="w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition-all disabled:opacity-60 flex justify-center items-center gap-2"
                      onClick={handleAddProduct}
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      {submitting ? "Submitting..." : "Submit for Approval"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-500 font-medium mb-8">
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900">
                &quot;{productToDelete?.title}&quot;
              </strong>
              ? This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition-all"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
