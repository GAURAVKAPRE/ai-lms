import express from "express";
import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * CREATE RAZORPAY ORDER
 */
router.post("/create-order", protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ❌ Free course protection
    if (course.price === 0) {
      return res.status(400).json({ message: "This course is free" });
    }

    // ❌ Instructor can't buy own course
    if (course.instructor.toString() === req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Instructor cannot buy own course" });
    }

    // ✅ FIXED receipt (≤ 40 chars)
    const options = {
      amount: course.price * 100, // paise
      currency: course.currency,
      receipt: `crs_${course._id.toString().slice(-6)}_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    // Save order in DB
    const payment = await Payment.create({
      userId: req.user._id,
      courseId: course._id,
      razorpayOrderId: order.id,
      amount: course.price,
      currency: course.currency,
      status: "created",
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/**
 * VERIFY RAZORPAY PAYMENT
 */
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1️⃣ Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // 2️⃣ Generate signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // 3️⃣ Compare signatures
    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 4️⃣ Mark payment as paid
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    // 5️⃣ Enroll user
    const user = await User.findById(payment.userId);
    if (!user.enrolledCourses.includes(payment.courseId)) {
      user.enrolledCourses.push(payment.courseId);
      await user.save();
    }

    res.status(200).json({
      message: "Payment verified & course enrolled",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

/**
 * GET LOGGED-IN USER PAYMENT HISTORY
 */
router.get("/my", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Fetch payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
});


export default router;
