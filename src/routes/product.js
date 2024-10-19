import { getAllCategories } from "../controller/product/category.js";
import { getProductByCategoryId } from "../controller/product/product.js";

export const categoryRoutes = async (fastify, options) => {
  fastify.get("/categories", getAllCategories);
};

export const productRoutes = async (fastify, options) => {
  fastify.get("/products/:categoryId", getProductByCategoryId);
};
