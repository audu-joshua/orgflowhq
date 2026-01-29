import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_URL) {
    console.warn("CLOUDINARY_URL is not defined in environment variables");
}

cloudinary.config({
    secure: true
});

export default cloudinary;
