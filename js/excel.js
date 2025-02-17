document.addEventListener('DOMContentLoaded', function () {
    const uploadExcelBtn = document.getElementById('uploadExcelBtn');
    const excelUpload = document.getElementById('excelUpload');
    const progressIndicator = document.getElementById('progressIndicator');

    if (uploadExcelBtn && excelUpload) {
        uploadExcelBtn.addEventListener('click', () => excelUpload.click());

        excelUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    // Generate images for each row in the Excel file
                    let completed = 0;
                    jsonData.forEach((row, index) => {
                        setTimeout(() => {
                            generateImage(row, index);
                            completed++;
                            progressIndicator.textContent = `${Math.round((completed / jsonData.length) * 100)}%`;
                        }, index * 1000); // Delay each image generation by 1 second
                    });
                };
                reader.readAsArrayBuffer(file);
            }
        });
    }

    // Function to generate an image for a given row of data
    function generateImage(row, index) {
        // Create a canvas element to generate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions (e.g., 1080x1920 for Instagram)
        canvas.width = 1080;
        canvas.height = 1920;

        // Add background color or image
        ctx.fillStyle = '#ffffff'; // White background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add heading text
        ctx.fillStyle = '#000000'; // Black text
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(row.heading || 'Default Heading', canvas.width / 2, 200);

        // Add bullet points
        ctx.font = '40px Arial';
        const bulletPoints = row.bulletPoints ? row.bulletPoints.split(',') : [];
        bulletPoints.forEach((point, i) => {
            ctx.fillText(`• ${point.trim()}`, canvas.width / 2, 400 + i * 60);
        });

        // Add footer text
        ctx.font = '30px Arial';
        ctx.fillText(row.footer || 'Default Footer', canvas.width / 2, canvas.height - 100);

        // Convert canvas to image and trigger download
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `image_${index + 1}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
        }, 'image/png');
    }
});