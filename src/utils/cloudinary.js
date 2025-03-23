import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const key = process.env.CLOUDINARY_API_KEY
console.log("key", key);


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
            }
        )
        console.log("file has been succesfully uploaded to cloudinary", response.url);


        return response;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);

        // Safely delete the local file if upload fails
        try {
             fs.unlinkSync(localFilePath);

        } catch (unlinkError) {
            console.error("Failed to delete local file:", unlinkError);
        }

        return null;
    }
}

export { uploadOnCloudinary }


