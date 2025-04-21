import { Inngest } from "inngest";
import connectDb from "./db";
import User from "@/models/user.js";
import Order from "@/models/order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

/**
 * 🟢 Handle Clerk User Creation
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
        cartItems: {}, // 👈 Ensure default is set
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
 * 🟡 Handle Clerk User Update
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
 * 🔴 Handle Clerk User Deletion
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


//inngest function to create user's oders
export const createUserOrder=inngest.createFunction(
  {
    id: 'create-user-order',
  batchEvents: {
      maxSize: 5,
      timeout: '5s'
    }
  },
  {event:'order/created'},
  async({events})=>{
    const orders=events.map((event)=>{
      return{
      userId:event.data.userId,
      items:event.data.items,
      amount:event.data.amount,
      date:event.data.date
      }
    })

    await connectDb()
    await Order.insertMany(orders)
    return {success:true,processed:orders.length}
  }
)



createOrder.jsx


import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    getToken,
    cartItems,
    user,
    setCartItems
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

  const fetchUserAddresses = async () => {
    try {
      const token=await getToken()
      const{data}=await axios.get("/api/user/get-adress",{headers:{Authorization:`Bearer${token}`}})
      if(data.success){
        setUserAddresses(data.adresses)
        if(data.adresses.length>0){
          setSelectedAddress(data.adresses[0])
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    try {
      if (!selectedAddress) {
        return toast.error("Please select an address");
      }

      let cartItemArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key],
      }));
      cartItemArray = cartItemArray.filter((item) => item.quantity > 0);

      if (cartItemArray.length === 0) {
        return toast.error("Cart is empty");
      }

      const token = await getToken();

      const { data } = await axios.post(
        "/api/order/create",
        {
          items: cartItemArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        router.push("/order-placed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if(user){fetchUserAddresses()}
    
  }, [user]);

  const taxAmount = Math.floor(getCartAmount() * 0.02);
  const totalAmount = getCartAmount() + taxAmount;

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        {/* Address Selection */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Promo Code Input */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Cart Summary */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-gray-800">Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {taxAmount}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {totalAmount}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;

