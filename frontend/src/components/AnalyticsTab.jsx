import { motion } from "framer-motion"; // For smooth animations on page load
import { useEffect, useState } from "react"; // React hooks for state and side-effects
import axios from "../lib/axios"; // Axios for making HTTP requests
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react"; // Icons from lucide-react
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // Recharts for rendering the line chart

const AnalyticsTab = () => {
  // State variables for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });

  // Loading state to handle loading indicators
  const [isLoading, setIsLoading] = useState(true);

  // Error handling state
  const [error, setError] = useState(null);

  // State to store daily sales data for chart rendering
  const [dailySalesData, setDailySalesData] = useState([]);

  // State to store top-performing products
  const [topProducts, setTopProducts] = useState([]);

  // Fetch analytics and top products data from API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get("/analytics");
        setAnalyticsData(response.data.analyticsData);
        setDailySalesData(response.data.dailySalesData);

        // Check the response for top products
        const topProductsResponse = await axios.get("/analytics/top-products");
        console.log("Top Products Data:", topProductsResponse.data); // Log the response
        setTopProducts(topProductsResponse.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // If there's an error, display it
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // If data is still loading, show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Array of statistics to display in cards (total users, products, sales, revenue)
  const stats = [
    {
      title: "Total Users",
      value: analyticsData.users,
      icon: Users,
      color: "from-emerald-500 to-teal-700",
    },
    {
      title: "Total Products",
      value: analyticsData.products,
      icon: Package,
      color: "from-emerald-500 to-green-700",
    },
    {
      title: "Total Sales",
      value: analyticsData.totalSales,
      icon: ShoppingCart,
      color: "from-emerald-500 to-cyan-700",
    },
    {
      title: "Total Revenue",
      value: `$${analyticsData.totalRevenue.toFixed(2)}`, // Format totalRevenue to 2 decimal places
      icon: DollarSign,
      color: "from-emerald-500 to-lime-700",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Render the analytics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <AnalyticsCard key={index} {...stat} />
        ))}
      </div>
      {/* Render Line Chart for daily sales and revenue */}
      <motion.div
        className="bg-gray-800/60 rounded-lg p-6 shadow-lg mb-8" // Adding margin-bottom for space below the chart
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#D1D5DB" />
            <YAxis yAxisId="left" stroke="#D1D5DB" />
            <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" />
            <Tooltip />
            <Legend />
            {/* Line for Sales */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#10B981"
              activeDot={{ r: 8 }}
              name="Sales"
            />
            {/* Line for Revenue */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
      {/* Add more space between chart and table */}
      <div className="mb-8" /> {/* Spacer div for additional space */}
      {/* Display Top Products Table */}
      {/* Top Products */}
      <motion.div
        className="bg-gray-800/60 rounded-lg p-6 shadow-lg mt-8" // Add margin top for space between chart and table
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <h2 className="text-2xl font-bold text-center text-emerald-600 mb-4">
          Top Products by Sales
        </h2>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                Product Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                Total Sales
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">
                Total Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length > 0 ? (
              topProducts.map((product) => (
                <tr key={product.id}>
                  {" "}
                  {/* Ensure you're using a unique identifier */}
                  <td className="px-4 py-2 text-white">{product.name}</td>
                  <td className="px-4 py-2 text-white">{product.totalSales}</td>
                  <td className="px-4 py-2 text-white">
                    ${product.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-2 text-center text-white">
                  No top products available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

// Card component for displaying each statistic (users, products, sales, revenue)
const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);

export default AnalyticsTab;
