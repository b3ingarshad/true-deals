import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Confirm modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUser.name,
          email: newUser.email,
          password: "123456",
        }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);
      setUsers([...users, data.user]);
      setNewUser({ name: "", email: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/users/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setShowConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setNewUser({ name: user.username, email: user.email });
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/users/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: newUser.name,
            email: newUser.email,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setUsers(
        users.map((u) =>
          u._id === currentUser._id
            ? { ...u, username: newUser.name, email: newUser.email }
            : u
        )
      );
      setIsEditing(false);
      setCurrentUser(null);
      setNewUser({ name: "", email: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setNewUser({ name: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 pl-2 border-l-4 border-teal-500">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 font-medium mt-1">Manage system users, permissions, and roles</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: User List */}
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Registered Users <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs ml-2">{users.length}</span>
              </h2>
            </div>

            <div className="overflow-x-auto flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold font-mono">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {user.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleEdit(user)}
                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                                    title="Edit Profile"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(user)}
                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                                </>
                              )}
                              {user.role === 'admin' && (
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1">Protected</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-16 text-center">
                          <p className="text-lg font-medium text-gray-500">No users found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column: Add/Edit Form */}
          <div className="lg:w-1/3">
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28 transition-all ${isEditing ? 'ring-2 ring-teal-500 ring-offset-2' : ''}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {isEditing ? (
                  <><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Edit User</>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-teal-500"></span> Add New User</>
                )}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. john@example.com"
                    value={newUser.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
                
                {!isEditing && (
                  <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm font-medium p-3 rounded-xl mt-2 flex gap-3 items-start">
                    <svg className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    New users are automatically assigned the default password "123456" and the role "user".
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  {isEditing ? (
                    <>
                      <button 
                        className="flex-1 px-4 py-3 bg-white text-gray-700 font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-4 focus:ring-gray-100" 
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/30 transform hover:-translate-y-0.5" 
                        onClick={handleUpdateUser}
                      >
                        Update User
                      </button>
                    </>
                  ) : (
                    <button 
                      className="w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-gray-900/30 transform hover:-translate-y-0.5 flex justify-center items-center gap-2" 
                      onClick={handleAddUser}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                      Register User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCancelDelete}></div>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Suspend User</h3>
            <p className="text-gray-500 font-medium mb-8">
              Are you sure you want to permanently delete <strong className="text-gray-900">{userToDelete?.username}</strong>'s account? All associated data will be removed.
            </p>
            <div className="flex gap-4">
              <button 
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                onClick={handleDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
