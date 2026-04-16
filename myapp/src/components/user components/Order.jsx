import { useEffect, useState } from "react";

const BASE_URL = "https://true-deals.vercel.app";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "Refunded":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen font-sans">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 mt-2">Track the status of your purchased items.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center max-w-2xl mx-auto mt-10">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
          <p className="text-gray-500 mb-8 text-lg">
            When you win an auction and complete payment, your purchased items will appear here.
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => (window.location.href = "/products")}
          >
            Browse Auctions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((order) => (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group" key={order._id}>
              
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                <span className="font-mono text-sm font-bold text-gray-500">
                  #{order.orderNumber}
                </span>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusClass(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={`${BASE_URL}/uploads/${order.product?.image}`}
                    alt={order.product?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=No+Image" }}
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{order.product?.title}</h3>
                  <p className="text-2xl font-black text-brand-600 mb-6">
                    ₹{Number(order.amount).toLocaleString()}
                  </p>

                  <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Order Status</span>
                      <span className="font-semibold text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Ordered On</span>
                      <span className="font-medium text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
