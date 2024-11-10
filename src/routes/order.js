import { confirmOrder, createOrder, getOrder, getOrderById, updateOrderStatus } from "../controller/order/order.js";
import { verifyToken } from "../middleware/auth.js"


export const orderRouter = async(fastify,option)=>{
    fastify.addHook('preHandler',async(request,reply)=>{

        const isAuthenticated = await verifyToken(request,reply);
        if(!isAuthenticated){
            return reply.code(401).send({message:"unauthorized"})
        }
            
    })
    fastify.post('/order',createOrder)
    fastify.get('/order',getOrder)
    fastify.patch('/order/:orderId/status',updateOrderStatus)
    fastify.post('/order/:orderId/confirm',confirmOrder)
    fastify.get('/order/:orderId',getOrderById)
}