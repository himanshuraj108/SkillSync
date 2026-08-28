import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'avatars');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ensure local upload directory exists
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export const uploadToCloudinary = async (fileBuffer, folder, options = {}, mimetype = 'image/jpeg') => {
    // Try Cloudinary first
    try {
        const b64 = fileBuffer.toString('base64');
        const dataURI = `data:${mimetype};base64,${b64}`;
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(dataURI, {
                folder,
                resource_type: 'auto',
                ...options,
            }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
        return { url: result.secure_url, public_id: result.public_id, storage: 'cloudinary' };
    } catch (cloudErr) {
        console.warn('[Cloudinary] Upload failed, falling back to local storage:', cloudErr.message);
        // Fallback: save to local disk and serve via /uploads
        return saveLocally(fileBuffer, folder, mimetype);
    }
};

export const saveLocally = (fileBuffer, folder, mimetype = 'image/jpeg') => {
    const ext = mimetype.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const subDir = path.join(LOCAL_UPLOAD_DIR, '..', folder.replace('skillswap/', ''));

    if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
    }

    const filePath = path.join(subDir, filename);
    fs.writeFileSync(filePath, fileBuffer);

    // Return a local URL accessible via the static /uploads route
    const relPath = path.relative(path.join(__dirname, '..', 'uploads'), filePath).replace(/\\/g, '/');
    const url = `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/${relPath}`;
    return { url, public_id: `local/${folder}/${filename}`, storage: 'local' };
};

export default cloudinary;
