import { Branch } from "../../model/branch.js";
import Order from "../../model/order.js";
import { Customer, DeliveryPartner } from "../../model/user.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerData = await Customer.findById(userId);
    const branchDate = await Branch.find(branch);

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
        longtitude: customerData.liveLocation.longitude,
        address: customerData.address || "no adress available",
      },
      pickupLocation: {
        latitude: branch.liveLocation.latitude,
        longtitude: branch.liveLocation.longitude,
        address: branch.address || "no adress available",
      },
    });
    const savedOrder = await newOrder.save();
    return reply.status(201).send(savedOrder);
  } catch (error) {
    return reply.status(500).send({ message: "error occured", error });
  }
};

export const confirmOrder = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    const { deliveryPersonLocation } = req.body;

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
    order.deliveryLocation = {
      latitude: deliveryPersonLocation?.latitude,
      longitude: deliveryPersonLocation?.longitude,
      address: deliveryPersonLocation?.address || "",
    };

    await order.save();
    return reply.send(order);
  } catch (error) {
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
    order.deliveryLocation = deliveryPersonLocation;

    await order.save();
    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "failed to update order", error });
  }
};

export const getOrder = async (req,reply)=>{
  try {
      const {status,customerId,deliveryPartnerId,branchId} = req.query;
      let query={}
      if(status){
        query.status = status
      }
      if(customerId){
        query.customer = customerId
      }
      if(deliveryPartnerId){
        query.deliveryPartner = status
        query.branch = status
      }



      const orders = await Order.find(query).populate(
        "customer branch items.item deliveryPartner"
      )
      reply.send(orders)
  } catch (error) {
    return reply.status(500).send({ message: "failed to get order", error });
  }
}