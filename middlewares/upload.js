import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

const upload = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [
        { width: 800, height: 800, crop: "limit" }, // ✅ optional optimization
      ],
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 2 * 1024 * 1024, // ✅ 2MB limit (screenshots ke liye perfect)
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, JPEG, PNG images allowed"), false);
      }
    },
  });
};

export default upload;
