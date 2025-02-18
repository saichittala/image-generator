document.addEventListener('DOMContentLoaded', function () {
    function handleActiveOption(optionsContainer, activeClass, disableClass) {
        if (!optionsContainer) return;

        const options = optionsContainer.querySelectorAll('.active-option, .disable-option');
        options.forEach(option => {
            option.addEventListener('click', function () {
                options.forEach(opt => opt.classList.remove(activeClass));
                options.forEach(opt => opt.classList.add(disableClass));
                this.classList.remove(disableClass);
                this.classList.add(activeClass);
            });
        });
    }

    handleActiveOption(document.getElementById('socialMedia'), 'active-option', 'disable-option');
    handleActiveOption(document.getElementById('aspectRatio'), 'active-option', 'disable-option');
    handleActiveOption(document.getElementById('qualityOptions'), 'active-option', 'disable-option');

    const addBulletBtn = document.getElementById('addBulletBtn');
    const bulletPointsContainer = document.getElementById('bulletPointsContainer');
    const previewBulletPoints = document.getElementById('previewBulletPoints');

    if (addBulletBtn) {
        addBulletBtn.addEventListener('click', function () {
            const newBullet = document.createElement('div');
            newBullet.className = 'creator-option-1 bullet-point';
            newBullet.innerHTML = `
                <span class="options-label-text">Bullet Point</span>
                <div class="input-with-delete">
                    <input type="text" class="input-field bullet-input" placeholder="Enter your text here">
                    <img class="delete-bullet" src="img/delete.svg" alt="">
                </div>
            `;
            bulletPointsContainer.appendChild(newBullet);

            const newPreviewBullet = document.createElement('div');
            newPreviewBullet.className = 'bullet-points-sub';
            newPreviewBullet.innerHTML = `
                <img src="img/checkbox-bullet.svg" alt="" class="checkbox-icon">
                <span class="bullet-point-text" id="previewBulletPoints" onclick="enableEdit('previewBulletPoints')">Bullet Points</span>
            `;
            previewBulletPoints.appendChild(newPreviewBullet);

            const deleteBullet = newBullet.querySelector('.delete-bullet');
            deleteBullet.addEventListener('click', function () {
                newBullet.remove();
                newPreviewBullet.remove();
            });

            const bulletInput = newBullet.querySelector('.bullet-input');
            bulletInput.addEventListener('input', function () {
                newPreviewBullet.querySelector('.bullet-point-text').textContent = this.value || "Bullet Points";
            });
        });
    }

    const toggleCheckboxesBtn = document.getElementById('toggleCheckboxesBtn');
    if (toggleCheckboxesBtn) {
        toggleCheckboxesBtn.addEventListener('click', function () {
            document.querySelectorAll('.checkbox-icon').forEach(checkbox => {
                checkbox.style.display = checkbox.style.display === 'none' ? 'inline-block' : 'none';
            });
        });
    }

    function updateText(inputId, previewId, defaultText) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input && preview) {
            input.addEventListener('input', function () {
                preview.textContent = this.value || defaultText;
            });
        }
    }

    updateText('headingInput', 'previewHeading', "Start a car wash business");
    updateText('footerInput', 'previewFooter', "Please Follow this page for more content");

    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageUpload = document.getElementById('imageUpload');
    const previewImage = document.getElementById('previewImage');

    if (uploadImageBtn && imageUpload && previewImage) {
        uploadImageBtn.addEventListener('click', () => imageUpload.click());

        imageUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => previewImage.src = e.target.result;
                reader.readAsDataURL(file);
            }
        });
    }

    let qualityScale = 1;

    const qualityOptions = document.getElementById('qualityOptions');
    if (qualityOptions) {
        qualityOptions.addEventListener('click', function (event) {
            const selectedQuality = event.target.dataset.value;
            qualityScale = { 'hd': 1, '2k': 2, '4k': 4, '8k': 8 }[selectedQuality] || 1;
            console.log(`Selected quality: ${selectedQuality}, scale: ${qualityScale}`);
        });
    }

    const downloadBtn = document.getElementById('downloadBtn');
    const previewContainer = document.getElementById('previewContainer');

    if (downloadBtn && previewContainer) {
        downloadBtn.addEventListener('click', function () {
            // Force reflow to ensure DOM updates are captured
            document.body.clientHeight;

            const containerWidth = previewContainer.offsetWidth;
            const containerHeight = previewContainer.offsetHeight;

            const targetHeight = containerWidth * (16 / 9);
            previewContainer.style.transform = `scale(${qualityScale})`;
            previewContainer.style.height = `${targetHeight / qualityScale}px`;

            html2canvas(previewContainer, {
                width: containerWidth * qualityScale,
                height: targetHeight * qualityScale,
                scale: qualityScale,
                useCORS: true,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'Generated-IMG.png';
                link.href = canvas.toDataURL('image/png');
                link.click();

                previewContainer.style.height = `${containerHeight}px`;
                previewContainer.style.transform = 'scale(1)';
            });
        });
    }

    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const logoUpload = document.getElementById('logoUpload');
    if (uploadLogoBtn && logoUpload && previewContainer) {
        uploadLogoBtn.addEventListener('click', () => logoUpload.click());

        logoUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const existingLogo = previewContainer.querySelector('.logo-in-preview');
                    if (existingLogo) existingLogo.remove();

                    const logoImage = document.createElement('img');
                    logoImage.src = e.target.result;
                    logoImage.className = 'logo-in-preview';
                    Object.assign(logoImage.style, { position: 'absolute', top: '5px', left: '5px', maxWidth: '50px', maxHeight: '50px', zIndex: '1' });

                    previewContainer.appendChild(logoImage);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    document.querySelectorAll('.bullet-point .delete-bullet').forEach(deleteBtn => {
        deleteBtn.addEventListener('click', function () {
            const bullet = this.closest('.bullet-point');
            if (bullet) bullet.remove();
            document.querySelector('#previewBulletPoints .bullet-points-sub:first-child')?.remove();
        });
    });
});
