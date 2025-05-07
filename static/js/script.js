const MAX_FILE_SIZE = 100 * 1024 * 1024;
const analyzeBtn = document.getElementById('analyzeBtn');
const loaderContainer = document.getElementById('loaderContainer');
const resultContainer = document.getElementById('result-container');
const processingOverlay = document.getElementById('processingOverlay');
const videoPreview = document.getElementById('videoPreview');

function handleVideoSubmit(event) {
    event.preventDefault();
    const videoInput = document.getElementById('videoFile');
    const errorMessage = document.getElementById('error-message');
    const file = videoInput.files[0];

    if (file && file.size > MAX_FILE_SIZE) {
        errorMessage.style.display = 'block';
        videoInput.value = '';
        return;
    }

    errorMessage.style.display = 'none';

    if (file) {
        loaderContainer.style.display = 'flex';
        processingOverlay.style.display = 'flex';
        analyzeBtn.classList.add('is-loading');
        analyzeBtn.disabled = true;

        uploadVideo(file);
    }
}

function uploadVideo(file) {
    const formData = new FormData();
    formData.append('video', file);

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loaderContainer.style.display = 'none';
        processingOverlay.style.display = 'none';
        analyzeBtn.classList.remove('is-loading');
        analyzeBtn.disabled = false;

        if (data.status === 'success') {
            resultContainer.innerHTML = `<p>Analysis Complete: <strong>${data.prediction}</strong> - ${data.confidence} confidence</p>`;
            resultContainer.style.display = 'block';
        } else {
            resultContainer.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
            resultContainer.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loaderContainer.style.display = 'none';
        processingOverlay.style.display = 'none';
        analyzeBtn.classList.remove('is-loading');
        analyzeBtn.disabled = false;
        resultContainer.innerHTML = `<p style="color: red;">Analysis failed. Please try again.</p>`;
        resultContainer.style.display = 'block';
    });
}

function previewVideo() {
    const videoFileInput = document.getElementById('videoFile');
    const videoPreview = document.getElementById('videoPreview');
    const file = videoFileInput.files[0];

    if (file) {
        const videoURL = URL.createObjectURL(file);
        videoPreview.src = videoURL;
        videoPreview.load(); // force reload
        videoPreview.style.display = 'block';
    } else {
        videoPreview.src = '';
        videoPreview.style.display = 'none';
    }
}
