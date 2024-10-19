import Product from "../../model/product.js";

export const getProductByCategoryId = async (req, reply) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.find({ category: categoryId })
      .select("-category")
      .exec();
    return reply.send(products);
  } catch (error) {
    return reply.status(500).send({ message: "error occured", error });
  }
};
