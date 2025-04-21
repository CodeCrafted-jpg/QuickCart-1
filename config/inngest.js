import { Inngest } from "inngest";
import connectDb from "./db";
import User from "@/models/user.js";
import Order from "@/models/order";

// Create an Inngest client
export const inngest = new Inngest({ id: "quickcart-next" });

/**
 * 🟢 Sync new users from Clerk to DB
 */
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        imageUrl: image_url,
        cartItems: {},
      };

      await step.run("connect-db", async () => {
        await connectDb();
      });

      await step.run("create-user", async () => {
        await User.create(userData);
      });

      return { success: true };
    } catch (error) {
      console.error("User creation failed:", error);
      return { success: false, error: error.message };
    }
  }
);

/**
 * 🟡 Sync user updates from Clerk
 */
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        imageUrl: image_url,
      };

      await step.run("connect-db", async () => {
        await connectDb();
      });

      await step.run("update-user", async () => {
        await User.findByIdAndUpdate(id, userData);
      });

      return { success: true };
    } catch (error) {
      console.error("User update failed:", error);
      return { success: false, error: error.message };
    }
  }
);

/**
 * 🔴 Handle Clerk user deletion
 */
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    try {
      const { id } = event.data;

      if (!id) throw new Error("User ID is missing from event data.");

      await step.run("connect-db", async () => {
        await connectDb();
      });

      await step.run("delete-user", async () => {
        await User.findOneAndDelete({ _id: id });
      });

      return { success: true, deletedUserId: id };
    } catch (error) {
      console.error("User deletion failed:", error);
      return { success: false, error: error.message };
    }
  }
);

/**
 * 🛒 Handle new order creation
 */
export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  { event: "order/created" },
  async ({ events, step }) => {
    try {
      await step.run("connect-db", async () => {
        await connectDb();
      });

      const orders = events.map((event) => ({
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address, // ✅ fixed spelling
        date: event.data.date,
      }));

      await step.run("insert-orders", async () => {
        await Order.insertMany(orders);
      });

      return { success: true, processed: orders.length };
    } catch (error) {
      console.error("Order processing failed:", error);
      return { success: false, error: error.message };
    }
  }
);
