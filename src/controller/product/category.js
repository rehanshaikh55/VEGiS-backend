import Category from "../../model/category.js";

export const getAllCategories = async (req, reply) => {
  try {
    const category = await Category.find();
    return reply.send(category);
  } catch (error) {
    return reply.status(500).send({ message: "error oagagagaccured", error });
  }
};
