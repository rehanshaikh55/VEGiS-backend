import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { Customer } from "../model/user.js";
import { DeliveryPartner } from "../model/user.js";
import { Admin } from "../model/user.js";
import { Branch } from "../model/branch.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import {dark,light,noSidebar} from "@adminjs/themes"
import Category from "../model/category.js";
import Product from "../model/product.js";
AdminJS.registerAdapter(AdminJSMongoose);

export const admin = new AdminJS({
  resources:[
     {
      resource:Customer,
      options:{
        listlistProperties: ['phone', 'role', 'isActivated'],
        filterProperties: ['phone', 'role', ],
      }
     },
     {
      resource:DeliveryPartner,
      options:{
        listlistProperties: ['phone', 'role', 'isActivated'],
        filterProperties: ['phone', 'role', ],
      }
     },
     {
      resource:Admin,
      options:{
        listlistProperties: ['email', 'role', 'isActivated'],
        filterProperties: ['email', 'role', ],
      }
     },
     {
      resource:Branch
     },
     {
      resource:Category
     },
     {
      resource:Product
     },
  ],
  branding:{
    companyName:"VEGiS",
    withMadeWithLove:false,
    favicon:"https://res.cloudinary.com/dhyg6igyw/image/upload/v1726832269/mv6kfnszzjmggoyfyjd9.ico",
    logo:"https://res.cloudinary.com/dhyg6igyw/image/upload/v1726832374/xurkrptjzcegfflohmlj.png"
  },
  defaultTheme:dark.id,
  availableThemes:[dark,light,noSidebar],
 rootPath:'/admin'
  
});

export const buildAdminRouter= async(app)=>{
await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
         authenticate,
         cookiePassword:COOKIE_PASSWORD,
         cookieName:"adminjs"
    },
    app,
    {
        store:sessionStore,
        saveUnintialized:true,
        secret:COOKIE_PASSWORD,
        cookie:{
          httpOnly:process.env.NODE_ENV === "production",
          secure:process.env.NODE_ENV === "production",
        }
    }
)
}