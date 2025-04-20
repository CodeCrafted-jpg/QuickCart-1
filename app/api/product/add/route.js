import connectDb from '@/config/db';
import authSeller from '@/lib/authSeller';
import Product from '@/models/product';
import { getAuth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    console.log(userId)
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ success: false, message: 'Not an authorized seller' });
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const category = formData.get('category');
    const price = formData.get('price');
    const offerPrice = formData.get('offerPrice');

    // ✅ Important: Make sure frontend sends under key 'images'
    const files = formData.getAll('images');

    if (!files) {
      return NextResponse.json({ success: false, message: 'No files available' });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploadResults.map((res) => res.secure_url);

    await connectDb();

    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image: imageUrls,
      date: Date.now(),
    });

    return NextResponse.json({ success: true, message: 'Uploaded successfully', newProduct });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
