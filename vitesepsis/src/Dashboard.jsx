import { useState, useEffect } from "react";
import { Bell, Search, Menu, User, Settings, LogOut, Lock, Mail, ChevronDown, Home, Activity, FileText, Users, HelpCircle } from "lucide-react";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New patient data uploaded", time: "5 minutes ago", unread: true },
    { id: 2, message: "System update scheduled for tomorrow", time: "2 hours ago", unread: true },
    { id: 3, message: "Your report has been reviewed", time: "Yesterday", unread: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock user data
  const userData = {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.org",
    role: "Senior Physician",
    department: "Internal Medicine",
    avatar: "/api/placeholder/150/150",
    joinDate: "January 2023",
    recentPatients: 12,
    completedReports: 35
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate API call
    setTimeout(() => {
      if (username === "demo" && password === "password") {
        setIsLoggedIn(true);
        setLoading(false);
      } else {
        setError("Invalid username or password. Try demo/password.");
        setLoading(false);
      }
    }, 1000);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
    if (showNotifications) setShowNotifications(false);
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      unread: false
    })));
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => notification.unread).length;

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Medical Dashboard</h2>
            <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded font-medium text-white ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Demo credentials: username "demo" / password "password"</p>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 Medical Dashboard System</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard layout (after login)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and menu button */}
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-blue-600 ml-2">MedDashboard</h1>
            </div>
            
            {/* Search bar */}
            <div className="hidden md:block flex-1 max-w-md ml-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search patients, records, or reports..."
                />
              </div>
            </div>
            
            {/* Notification and Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-1 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                  onClick={toggleNotifications}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 hover:bg-gray-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <span className="bg-blue-500 h-2 w-2 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-100 text-center">
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={toggleProfileDropdown}
                >
                  <img 
                    className="h-8 w-8 rounded-full"
                    src="/api/placeholder/32/32"
                    alt="User avatar"
                  />
                  <span className="hidden md:inline-block ml-2 text-gray-700">{userData.name}</span>
                  <ChevronDown size={16} className="ml-1 text-gray-500" />
                </button>
                
                {profileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <a 
                        href="#profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab("profile");
                          toggleProfileDropdown();
                        }}
                      >
                        <User size={16} className="mr-2" />
                        Your Profile
                      </a>
                      <a 
                        href="#settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </a>
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar navigation */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} md:block md:w-64 bg-white shadow-md`}>
          <nav className="mt-5 px-2">
            <a 
              href="#dashboard" 
              className={`group flex items-center px-2 py-2 text-sm rounded-md ${
                activeTab === "dashboard" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("dashboard");
                setShowMobileMenu(false);
              }}
            >
              <Home size={20} className="mr-3" />
              Dashboard
            </a>
            <a 
              href="#patients" 
              className={`mt-1 group flex items-center px-2 py-2 text-sm rounded-md ${
                activeTab === "patients" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("patients");
                setShowMobileMenu(false);
              }}
            >
              <Users size={20} className="mr-3" />
              Patients
            </a>
            <a 
              href="#reports" 
              className={`mt-1 group flex items-center px-2 py-2 text-sm rounded-md ${
                activeTab === "reports" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("reports");
                setShowMobileMenu(false);
              }}
            >
              <FileText size={20} className="mr-3" />
              Reports
            </a>
            <a 
              href="#analytics" 
              className={`mt-1 group flex items-center px-2 py-2 text-sm rounded-md ${
                activeTab === "analytics" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("analytics");
                setShowMobileMenu(false);
              }}
            >
              <Activity size={20} className="mr-3" />
              Analytics
            </a>
            <a 
              href="#profile" 
              className={`mt-1 group flex items-center px-2 py-2 text-sm rounded-md ${
                activeTab === "profile" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("profile");
                setShowMobileMenu(false);
              }}
            >
              <User size={20} className="mr-3" />
              Profile
            </a>
            <a 
              href="#help" 
              className={`mt-1 group flex items-center px-2 py-2 text-sm rounded-md ${
                activeTab === "help" 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("help");
                setShowMobileMenu(false);
              }}
            >
              <HelpCircle size={20} className="mr-3" />
              Help & Support
            </a>
          </nav>
          <div className="px-4 mt-8">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">System Status</p>
              <div className="flex items-center mt-1">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-gray-600 ml-2">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Dashboard content */}
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium text-gray-500 mb-2">Total Patients</h3>
                  <p className="text-3xl font-bold text-gray-800">124</p>
                  <p className="text-sm text-green-600 mt-2">+12% from last month</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium text-gray-500 mb-2">New Reports</h3>
                  <p className="text-3xl font-bold text-gray-800">35</p>
                  <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium text-gray-500 mb-2">Critical Cases</h3>
                  <p className="text-3xl font-bold text-gray-800">5</p>
                  <p className="text-sm text-red-600 mt-2">2 new alerts</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium text-gray-500 mb-2">Data Accuracy</h3>
                  <p className="text-3xl font-bold text-gray-800">98.2%</p>
                  <p className="text-sm text-blue-600 mt-2">+0.6% improvement</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText size={16} className="text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        New patient report uploaded for <span className="font-medium">Patient #42781</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User size={16} className="text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        Dr. Michael Lee commented on <span className="font-medium">Report #89023</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertTriangle size={16} className="text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        Alert triggered for <span className="font-medium">Patient #38291</span> - Sepsis risk increased
                      </p>
                      <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View all activity</a>
                </div>
              </div>
            </div>
          )}
          
          {/* Profile content */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h2>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-blue-600 h-32 relative">
                  {/* Profile banner */}
                  <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                      <img 
                        src="/api/placeholder/96/96" 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border-4 border-white"
                      />
                      <span className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 pt-16">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{userData.name}</h3>
                      <p className="text-gray-600">{userData.role}, {userData.department}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-700">{userData.email}</span>
                        </div>
                        <div className="flex items-center">
                          <User size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-700">Staff ID: MD-5692</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-700">Member since {userData.joinDate}</span>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-500 mt-6 mb-3">Account Settings</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Two-factor authentication</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Email notifications</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">SMS alerts</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Disabled</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Activity Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Recent Patients</p>
                          <p className="text-2xl font-bold text-blue-700">{userData.recentPatients}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Completed Reports</p>
                          <p className="text-2xl font-bold text-green-700">{userData.completedReports}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-gray-500 mt-6 mb-3">Recent Patients</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-gray-50 rounded flex justify-between">
                          <span className="text-gray-700">Patient #42781</span>
                          <span className="text-gray-500 text-sm">15 min ago</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded flex justify-between">
                          <span className="text-gray-700">Patient #38291</span>
                          <span className="text-gray-500 text-sm">3 hours ago</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded flex justify-between">
                          <span className="text-gray-700">Patient #40125</span>
                          <span className="text-gray-500 text-sm">Yesterday</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">System Access</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Patient Records</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Lab Results</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Reports Management</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Analytics Dashboard</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Admin Panel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Other tabs would go here */}
          {activeTab !== "dashboard" && activeTab !== "profile" && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FileText size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Content for "{activeTab}" coming soon</h3>
              <p className="text-gray-600">This section is under development. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Clock(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertTriangle(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}