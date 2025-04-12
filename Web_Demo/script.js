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
            
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link and corresponding page
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            document.getElementById(page).classList.add('active');
            
            // Close mobile menu if open
            navLinksContainer.classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navLinksContainer.classList.toggle('active');
    });
    
    // File Upload
    uploadArea.addEventListener('click', function() {
        fileUpload.click();
    });
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = 'transparent';
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    fileUpload.addEventListener('change', function() {
        if (this.files.length) {
            handleFile(this.files[0]);
        }
    });
    
    removeFileBtn.addEventListener('click', function() {
        resetFileUpload();
    });
    
    // Predict Button
    predictBtn.addEventListener('click', function() {
        if (!currentFile) return;
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        predictBtn.disabled = true;
        
        // Simulate prediction process
        setTimeout(() => {
            predictGenre();
        }, 2000);
    });
    
    // Functions
    function handleFile(file) {
        // Check if file is audio
        if (!file.type.startsWith('audio/')) {
            showToast('Please upload an audio file');
            return;
        }
        
        currentFile = file;
        fileName.textContent = file.name;
        
        // Show file preview
        uploadArea.style.display = 'none';
        filePreview.style.display = 'flex';
        
        // Simulate upload progress
        progressContainer.style.display = 'block';
        simulateUpload();
    }
    
    function resetFileUpload() {
        currentFile = null;
        fileUpload.value = '';
        
        // Reset UI
        uploadArea.style.display = 'block';
        filePreview.style.display = 'none';
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        predictBtn.disabled = true;
        
        // Reset button state
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
    
    function predictGenre() {
        // This is a mock function that would be replaced with actual API call
        // to a backend service that performs the genre classification
        
        const genres = [
            'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 
            'Electronic', 'R&B', 'Country', 'Reggae', 'Metal'
        ];
        
        // Generate a consistent result based on the file name
        const hash = currentFile.name.split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0);
        }, 0);
        
        const predictedGenre = genres[hash % genres.length];
        
        // Display result
        genreResult.textContent = predictedGenre;
        resultContainer.style.display = 'block';
        
        // Reset button state
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        predictBtn.disabled = false;
        
        showToast(`Prediction complete: ${predictedGenre}`, 'success');
    }
    
    function showToast(message, type = 'error') {
        toastMessage.textContent = message;
        
        // Set icon based on type
        const icon = toast.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
            icon.style.color = 'var(--success-color)';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = 'var(--error-color)';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = 'var(--warning-color)';
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Animate progress bar
        const progress = toast.querySelector('.toast-progress');
        progress.style.width = '100%';
        progress.style.transition = 'width 3s linear';
        
        setTimeout(() => {
            progress.style.width = '0%';
        }, 100);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});