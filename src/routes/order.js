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
    fastify.post('/payment/razorpay-order', async (req, reply) => {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt#1",
            payment_capture: 1,
        };
        try {
            const response = await razorpay.orders.create(options);
            return reply.send(response);
        } catch (error) {
            return reply.status(500).send({ message: "failed to create order", error });
        }
    })
}