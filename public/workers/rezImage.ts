self.addEventListener('message', async (event) => {
    const { file, width, height } = event.data;

    try {
        // Use the file directly with createImageBitmap
        const bitmap = await createImageBitmap(file);
        const offscreencanvas = new OffscreenCanvas(width, height);
        const context = offscreencanvas.getContext('2d');

        context?.drawImage(bitmap, 0, 0, width, height);

        const blob = await offscreencanvas.convertToBlob({ quality: 0.5, type: 'image/bmp' });

        self.postMessage(blob, [blob]);
    } catch (e) {
        console.log("Error while resizing image.", e);
        self.postMessage("");
    }
});