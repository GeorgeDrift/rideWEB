/**
 * Upload vehicle image
 */
exports.uploadVehicleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Return the relative URL path to the uploaded image
        const imageUrl = `/uploads/vehicles/${req.file.filename}`;

        console.log(`✅ Vehicle image uploaded: ${imageUrl}`);
        res.json({ imageUrl });
    } catch (err) {
        console.error('Upload vehicle image error:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Upload post image (for ride share or hire posts)
 */
exports.uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Return the relative URL path to the uploaded image
        const imageUrl = `/uploads/vehicles/${req.file.filename}`;

        console.log(`✅ Post image uploaded: ${imageUrl}`);
        res.json({ imageUrl });
    } catch (err) {
        console.error('Upload post image error:', err);
        res.status(500).json({ error: err.message });
    }
};
