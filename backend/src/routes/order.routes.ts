import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/order.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import authMiddleware from "../middleware/auth.middleware";
import {
  sendOrderConfirmationEmail,
  sendOrderFailureEmail,
} from "../utils/emailService";
import mongoose from "mongoose";

const router = express.Router();

interface MyRequest extends express.Request {
  userId?: string;
}

router.post(
  "/",
  authMiddleware,
  [
    body("customerInfo")
      .notEmpty()
      .withMessage("Customer information is required"),
    body("product").notEmpty().withMessage("Product information is required"),
    body("totalAmount")
      .isNumeric()
      .withMessage("Total amount must be a number"),
  ],
  async (req: MyRequest, res: express.Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { customerInfo, product, totalAmount, status, orderNumber } =
        req.body;
      const userId = req.userId;

      const dbProduct = await Product.findById(product._id).session(session);
      if (!dbProduct) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Product not found" });
      }

      if (dbProduct.inventory < product.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Insufficient inventory",
          available: dbProduct.inventory,
        });
      }

      const user = await User.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ message: "User not found" });
      }

      if (user.wallet < totalAmount) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Insufficient wallet balance",
          currentBalance: user.wallet,
          requiredAmount: totalAmount,
        });
      }

      const order = new Order({
        userId,
        orderNumber,
        customerInfo,
        product: {
          _id: dbProduct._id,
          name: dbProduct.name,
          price: dbProduct.price,
          color: product.color,
          size: product.size,
          quantity: product.quantity,
          image: product.image,
        },
        totalAmount,
        status,
      });

      dbProduct.inventory -= product.quantity;

      user.wallet -= totalAmount;
      const transaction = {
        amount: totalAmount,
        type: "debit" as const,
        description: `Purchase of ${dbProduct.name}`,
        orderId: order._id,
        createdAt: new Date(),
      };
      user.transactions.push(transaction as any);

      await order.save({ session });

      if (status === "success") {
        await dbProduct.save({ session });
        await user.save({ session });
        await session.commitTransaction();
        await sendOrderConfirmationEmail(customerInfo.email, order);
      } else {
        await session.commitTransaction();
        await sendOrderFailureEmail(customerInfo.email, order);
        return res.status(200).json({
          message: `Status ${status}. Order couldn't be placed`,
          status,
          order,
        });
      }

      res.status(201).json({
        message: "Order created successfully",
        order: {
          ...order.toObject(),
          product: {
            ...order.product,
            inventory: dbProduct.inventory,
          },
          userBalance: user.wallet,
        },
        status: status,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Order creation error:", error);
      res.status(500).json({
        message: "Server error during order processing",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      session.endSession();
    }
  }
);


router.get("/:id", authMiddleware, async (req: MyRequest, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this order" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// router.get("/", authMiddleware, async (req: MyRequest, res) => {
//   try {
//     const orders = await Order.find({ userId: req.userId }).sort({
//       createdAt: -1,
//     });
//     res.json({ orders });
//   } catch (error) {
//     console.error("Get orders error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

export default router;
