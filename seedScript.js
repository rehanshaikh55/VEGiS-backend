import mongoose from "mongoose";
import Product from "./src/model/product.js";
import Category from "./src/model/category.js";
import "dotenv/config"
import { categories, products } from "./seedData.js";

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        await Product.deleteMany({});
        await Category.deleteMany({});
        const categoryDocs = await Category.insertMany(categories)
        const categoryMap = categoryDocs.reduce((map,category)=>{
            map[category.name]=category._id;
            return map;
        },{});

      const productWithCategoryIds = products.map((product)=>({
          ...product,
          category:categoryMap[product.category]
      })) 
await Product.insertMany(productWithCategoryIds)
console.log("database seed successfully");

    } catch (error) {
        console.log("error in seeding data",error);
        
        
    }finally{
        mongoose.connection.close()
    }
}


seedDatabase();