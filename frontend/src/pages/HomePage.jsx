import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

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
  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl text-gray-300 mb-12">
          Discover the latest trends in eco-friendly fashion
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {!isLoading && products.length > 0 && (
          <FeaturedProducts featuredProducts={products} />
        )}
      </div>
    </div>
  );
};
export default HomePage;
