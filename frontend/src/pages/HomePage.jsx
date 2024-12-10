import CategoryItem from "../components/CategoryItem";

const categories = [
  { href: "/groceries", name: "Groceries", imageUrl: "/groceries.jpg" },
  { href: "/beverages", name: "Beverages", imageUrl: "/beverages.jpg" },
  { href: "/snacks", name: "Snacks", imageUrl: "/snacks.jpg" },
  {
    href: "/cleaning-supplies",
    name: "Cleaning Supplies",
    imageUrl: "/cleaning-supplies.jpg",
  },
  {
    href: "/personal-care",
    name: "Personal Care",
    imageUrl: "/personal-care.jpg",
  },
  {
    href: "/household-items",
    name: "Household Items",
    imageUrl: "/household-items.jpg",
  },
  { href: "/electronics", name: "Electronics", imageUrl: "/electronics.jpg" },
  { href: "/kitchenware", name: "Kitchenware", imageUrl: "/kitchenware.jpg" },
  { href: "/toiletries", name: "Toiletries", imageUrl: "/toiletries.jpg" },
  {
    href: "/health-wellness",
    name: "Health & Wellness",
    imageUrl: "/health-wellness.jpg",
  },
  {
    href: "/pet-supplies",
    name: "Pet Supplies",
    imageUrl: "/pet-supplies.jpg",
  },
  {
    href: "/baby-products",
    name: "Baby Products",
    imageUrl: "/baby-products.jpg",
  },
  { href: "/stationery", name: "Stationery", imageUrl: "/stationery.png" },
  {
    href: "/frozen-foods",
    name: "Frozen Foods",
    imageUrl: "/frozen-foods.jpg",
  },
  { href: "/alcohol", name: "Alcohol", imageUrl: "/alcohol.jpg" },
];

const HomePage = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          Discover everything you need, from groceries to household essentials.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem key={category.name} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
