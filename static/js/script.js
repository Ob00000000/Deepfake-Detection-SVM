const MAX_FILE_SIZE = 100 * 1024 * 1024; // Max file size: 100MB
const analyzeBtn = document.getElementById('analyzeBtn');
const loaderContainer = document.querySelector('.loader-container');
const resultContainer = document.getElementById('result-container');
const errorMessage = document.getElementById('error-message');

function handleVideoSubmit(event) {
    event.preventDefault();
    const videoInput = document.getElementById('videoFile');
    const file = videoInput.files[0];

    // Check for file size exceeding the limit
    if (file && file.size > MAX_FILE_SIZE) {
        errorMessage.style.display = 'block'; // Show error message
        videoInput.value = ''; // Clear input field
        return;
    }

    errorMessage.style.display = 'none'; // Hide error message when valid

    if (file) {
        // Show loading states
        loaderContainer.style.display = 'flex';
        analyzeBtn.classList.add('is-loading');
        analyzeBtn.disabled = true; // Disable button to prevent multiple clicks

        resultContainer.style.display = 'none'; // Hide result container until analysis is complete
        uploadVideo(file); // Call upload function
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
        // Hide loader
        loaderContainer.style.display = 'none';
        analyzeBtn.classList.remove('is-loading');
        analyzeBtn.disabled = false; // Re-enable the button

        if (data.status === 'success') {
            // Display the results after analysis
            resultContainer.innerHTML = `
                <p>Analysis Complete: <strong>${data.prediction}</strong> - ${data.confidence} confidence</p>
                <p>Reason: ${data.reason}</p>
            `;
            resultContainer.style.display = 'block'; // Show result container
        } else {
            // Handle error case and display message
            resultContainer.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
            resultContainer.style.display = 'block'; // Show result container with error message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loaderContainer.style.display = 'none'; // Hide loader
        analyzeBtn.classList.remove('is-loading');
        analyzeBtn.disabled = false; // Re-enable the button

        resultContainer.innerHTML = `<p style="color: red;">Analysis failed. Please try again.</p>`;
        resultContainer.style.display = 'block'; // Show result container with error message
    });
}

// Bind the form submission handler
document.getElementById('videoForm').addEventListener('submit', handleVideoSubmit);
