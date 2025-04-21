//inngest function to create user's orders
export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order',
    batchEvents: {
      maxSize: 5,
      timeout: '5s',
    },
  },
  { event: 'order/created' },
  async ({ events }) => {
    const orders = events.map((event) => ({
      userId: event.data.userId,
      items: event.data.items,
      amount: event.data.amount,
      address: event.data.address, // ✅ fixed spelling
      date: event.data.date,
    }));

    await connectDb();
    await Order.insertMany(orders);

    return { success: true, processed: orders.length };
  }
);
