import { Customer, DeliveryPartner } from "../../model/user.js";

import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  return { accessToken, refreshToken };
};
export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });
      await customer.save();
    }

    const { accessToken, refreshToken } = generateToken(customer);
    return reply.send({
      message: customer
        ? " Login Successfull"
        : "customer created and logged in",
      accessToken,
      refreshToken,
      customer,
    });
  } catch (error) {
    return reply.status(400).send({ message: "error occurred", error });
  }
};
export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;
    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      return reply.status(404).send({ message: "Delivery Partner not found" });
    }
    const isMatched = password === deliveryPartner.password;
    if (!isMatched) {
      return reply.status(400).send({ message: "password is wrong" });
    }
    const { accessToken, refreshToken } = generateToken(deliveryPartner);
    return reply.send({
      message: " Login Successfull",
      accessToken,
      refreshToken,
      deliveryPartner,
    });
  } catch (error) {
    return reply.status(400).send({ message: "error occurred", error });
  }
};
export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return reply.send({ message: "refresh token is required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let user;

    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.status(403).send({ message: "invailed role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "error occerred" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
    return reply.send({
      message: "token refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return reply.status(403).send({ message: "error occerred" });
  }
};

export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;
    let user;
    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(403).send({ message: "invailed role" });
    }
    if (!user) {
      return reply.status(404).send({ message: " user not found" });
    }
    return reply.send({
        message:"user fetched",
        user
    })
  } catch (error) {
    return reply.status(500).send({ message: "error occerred", error });
  }
};
