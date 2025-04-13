document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');

    const uploadArea = document.getElementById('upload-area');
    const fileUpload = document.getElementById('file-upload');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const predictBtn = document.getElementById('predict-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const resultContainer = document.getElementById('result-container');
    const genreResult = document.getElementById('genre-result');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    let currentFile = null;

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            document.getElementById(page).classList.add('active');
            navLinksContainer.classList.remove('active');
        });
    });

    hamburger.addEventListener('click', function() {
        navLinksContainer.classList.toggle('active');
    });

    // File Upload Handlers
    uploadArea.addEventListener('click', () => fileUpload.click());
    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.backgroundColor = 'transparent';
    });

    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.backgroundColor = 'transparent';
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length) handleFile(fileUpload.files[0]);
    });

    removeFileBtn.addEventListener('click', resetFileUpload);

    predictBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const file = fileUpload.files[0];

        if (!file) return;
        resultContainer.style.display = 'none';  // Reset previous result

        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        predictBtn.disabled = true;

        const formData = new FormData();
        formData.append('musicFile', file);
        

        try {
            console.log('Sending request to server...');
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: formData
            });
            console.log('Response status:', response.status);  // Log the response status
            if (!response.ok) {
                showToast("Server error occurred. Please try again.");
                return;
            }
            console.log('Response received from server.');
            const data = await response.json();
            console.log('Response:', data);  // Log the result to check if it's correct

            if (data.genre) {
                genreResult.textContent = data.genre;
                resultContainer.style.display = 'block';
            } else {
                showToast(data.error || "Prediction failed.");
            }

        } catch (error) {
            showToast("Failed to connect to server. Please check and try again.");
        } finally {
            btnLoader.style.display = 'none';
            btnText.style.display = 'inline-block';
            predictBtn.disabled = false;
            btnText.textContent = 'Predict Genre';
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('audio/')) {
            showToast('Please upload an audio file.');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        uploadArea.style.display = 'none';
        filePreview.style.display = 'flex';
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';  // Hide old prediction

        simulateUpload();
    }

    function resetFileUpload() {
        currentFile = null;
        fileUpload.value = '';

        uploadArea.style.display = 'block';
        filePreview.style.display = 'none';
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        predictBtn.disabled = true;

        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }

    function simulateUpload() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    predictBtn.disabled = false;
                }, 500);
            }
        }, 100);
    }

    function showToast(message, type = 'error') {
        toastMessage.textContent = message;
        const icon = toast.querySelector('i');

        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                icon.style.color = 'var(--success-color)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                icon.style.color = 'var(--error-color)';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                icon.style.color = 'var(--warning-color)';
                break;
        }

        toast.classList.add('show');
        const progress = toast.querySelector('.toast-progress');
        progress.style.width = '100%';
        progress.style.transition = 'width 3s linear';
        setTimeout(() => { progress.style.width = '0%'; }, 100);
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
});