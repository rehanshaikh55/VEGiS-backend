import { Branch } from "../../model/branch.js";
import Order from "../../model/order.js";
import { Customer, DeliveryPartner } from "../../model/user.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);

    if (!customerData) {
      return reply.status(404).send({ message: "user not found", error });
    }

    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),

      branch: branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "no adress available",
      },
      pickupLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "no adress available",
      },
    });
    let savedOrder = await newOrder.save();
    savedOrder = await savedOrder.populate([
    
      {path:"items.item"},
      
    ])
  

    return reply.status(201).send(savedOrder);
  } catch (error) {
    console.log(error);
    
    return reply.status(500).send({ message: "error occured", error });
  }
};

export const confirmOrder = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation  } = req.body;
    console.log(req.body);
    

    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply
        .status(404)
        .send({ message: "delivery Partner Doesnt exist" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "order Doesnt exist" });
    }
    if (order.status !== "available") {
      return reply.status(400).send({ message: "order Doesnt available" });
    }
    order.status = "confirmed";

    order.deliveryPartner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "",
    };
    
      req.server.io.to(orderId).emit("orderConfirmed",order)

    await order.save();
    return reply.send(order);
  } catch (error) {
    console.log(error);
    
    
    return reply
      .status(500)
      .send({ message: "failed to confirm order", error });
  }
};
export const updateOrderStatus = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;
    const deliveryPerson = await DeliveryPartner.findById(userId);
    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery person not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({ message: "order Doesnt exist" });
    }
    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(400).send({ message: "order can not be updated" });
    }
    if (order.deliveryPartner.toString() !== userId) {
      return reply.status(403).send({ message: "unauthorized" });
    }
    order.status = status;

    order.deliveryPartner = userId;
    order.deliveryPersonLocation = deliveryPersonLocation;
          
    await order.save();
    req.server.io.to(orderId).emit("liveTrackingUpdate",order)

    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "failed to update order", error });
  }
};

export const getOrder = async (req, reply) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }

    const orders = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );
    reply.send(orders);
  } catch (error) {
    return reply.status(500).send({ message: "failed to get order", error });
  }
};
export const getOrderById = async (req, reply) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "customer branch items.item deliveryPartner"
    );
    if (!order) {
      return reply.statud(404).send({ message: "order not found" });
    }
    reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "failed to get order", error });
  }
};
