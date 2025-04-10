import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";
import cors from 'cors'
import Razorpay from 'razorpay';

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  const app = Fastify();

  app.register(fastifySocketIO,{
    cors:{
      origin:'*'
    },
    pingInterval:10000,
    pingTimeout:5000,
    transports:['websocket']
  })

  await registerRoutes(app);
  await buildAdminRouter(app);

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`VEGiS started on Port: ${PORT}${admin.options.rootPath}`);
    }
  });
  const razorpay = new Razorpay({
    key_id: 'rzp_test_jmWIy0gRdpwakB',
    key_secret: 'FLxkdMJeMfXc0y9saiJae7Tv',
  });
  
  app.post('/api/payment/razorpay-order', async (req, res) => {
    const { amount } = req.body;
  
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `order_rcptid_${Date.now()}`,
    };
  
    try {
      const response = await razorpay.orders.create(options);
      res.json(response);
    } catch (err) {
      res.status(500).send('Something went wrong');
    }
  });
  
app.ready().then(()=>{
  app.io.on("connection",(socket)=>{
      console.log("user connected");
      socket.on("joinRoom",(orderId)=>{
        socket.join(orderId)
        console.log(`user joined room ${orderId}`);
        
      })
      socket.on('disconnect',()=>{
        console.log("user disconnected");
      })
  })
})

};

start();
