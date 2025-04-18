'use client'
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";

const AddAddress = () => {

    const [address, setAddress] = useState({
        fullName: '',
        phoneNumber: '',
        pincode: '',
        area: '',
        city: '',
        state: '',
    })

    const onSubmitHandler = async (e) => {
        e.preventDefault();
    }

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between items-start bg-gray-50">
                <form onSubmit={onSubmitHandler} className="w-full md:max-w-lg bg-white p-8 rounded-xl shadow-md">
                    <p className="text-2xl md:text-3xl text-gray-700 font-semibold mb-6">
                        Add Shipping <span className="text-orange-600">Address</span>
                    </p>
                    <div className="space-y-5">
                        <input
                            className="px-4 py-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder:text-gray-400 shadow-sm"
                            type="text"
                            placeholder="Full name"
                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                            value={address.fullName}
                        />
                        <input
                            className="px-4 py-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder:text-gray-400 shadow-sm"
                            type="text"
                            placeholder="Phone number"
                            onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                            value={address.phoneNumber}
                        />
                        <input
                            className="px-4 py-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder:text-gray-400 shadow-sm"
                            type="text"
                            placeholder="Pin code"
                            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                            value={address.pincode}
                        />
                        <textarea
                            className="px-4 py-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder:text-gray-400 shadow-sm resize-none"
                            rows={4}
                            placeholder="Address (Area and Street)"
                            onChange={(e) => setAddress({ ...address, area: e.target.value })}
                            value={address.area}
                        ></textarea>
                        <div className="flex gap-4">
                            <input
                                className="px-4 py-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder:text-gray-400 shadow-sm"
                                type="text"
                                placeholder="City/District/Town"
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                value={address.city}
                            />
                            <input
                                className="px-4 py-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 placeholder:text-gray-400 shadow-sm"
                                type="text"
                                placeholder="State"
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                value={address.state}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-8 bg-orange-600 text-white py-3 rounded-md font-semibold tracking-wide hover:bg-orange-700 transition duration-200 shadow-md"
                    >
                        Save address
                    </button>
                </form>

                <Image
                    className="md:ml-16 mt-10 md:mt-0 w-full max-w-sm object-contain"
                    src={assets.my_location_image}
                    alt="my_location_image"
                />
            </div>
            <Footer />
        </>
    );
};

export default AddAddress;
