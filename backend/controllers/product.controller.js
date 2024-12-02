import { redis } from "../lib/redis.js"; // Redis instance for caching
import cloudinary from "../lib/cloudinary.js"; // Cloudinary configuration
import Product from "../models/product.model.js"; // Mongoose model for Product

// Controller to fetch all products
export const getAllProducts = async (req, res) => {
  try {
    // Retrieve all products from MongoDB
    const products = await Product.find({});
    res.json({ products }); // Send the products as JSON response
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to fetch featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    // Check if featured products are cached in Redis
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      // If cached, return parsed data from Redis
      return res.json(JSON.parse(featuredProducts));
    }

    // If not cached, fetch from MongoDB
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // Cache the fetched products in Redis
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    // Optionally set an expiration time for cache:
    // await redis.set("featured_products", JSON.stringify(featuredProducts), "EX", 3600);

    res.json({ featuredProducts });
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    // Initialize Cloudinary upload response
    let cloudinaryResponse = null;

    // Upload image to Cloudinary if provided
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products", // Folder in Cloudinary
      });
    }

    // Create product in MongoDB
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url || "", // Use Cloudinary URL or empty string
      category,
    });

    res.status(201).json(product); // Send the created product as response
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to delete a product
export const deleteProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary if exists
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // Extract public ID
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error);
      }
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to fetch recommended products
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } }, // Randomly select 3 products
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);
    res.json({ products });
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to fetch products by category
export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    // Find products by category
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller to toggle the featured status of a product
export const toggledFeaturedProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (product) {
      // Toggle the isFeatured property
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();

      // Update Redis cache
      await updateFeaturedProductsCache();

      res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggledFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to update Redis cache for featured products
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean(); // Fetch plain objects
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error updating Redis cache for featured products", error);
  }
}
