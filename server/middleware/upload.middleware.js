import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.mimetype);
    const isFile = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'].includes(file.mimetype);

    if (isImage || isFile) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

export const uploadAvatar = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single('avatar');

export const uploadFile = upload.single('file');
