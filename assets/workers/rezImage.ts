self.addEventListener('message', async (event) => {
    const { image, width, height } = event.data;

    try {
        const bitmap = await createImageBitmap(image);
        const offscreencanvas = new OffscreenCanvas(width, height);
        const context = offscreencanvas.getContext('2d');

        context?.drawImage(bitmap, 0, 0, width, height);

        const blob = await offscreencanvas.convertToBlob({ quality: 0.1, type: 'image/webp' });

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            // reader.result is a base64 data URL
            self.postMessage(reader.result);
        };
        reader.readAsDataURL(blob);
    } catch (e) {
        console.log("Error while resizing image.");
        self.postMessage("");
    }
});