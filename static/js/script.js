const MAX_FILE_SIZE = 100 * 1024 * 1024;
const analyzeBtn = document.getElementById('analyzeBtn');
const loaderContainer = document.getElementById('loaderContainer');
const resultContainer = document.getElementById('result-container');
const analysisResult = document.getElementById('analysis-result');
const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');
const processingOverlay = document.getElementById('processingOverlay');
const videoPreview = document.getElementById('videoPreview');

function displayResult(result) {
    const resultContainer = document.getElementById('analysis-result');
    const justificationElement = document.getElementById('justification');
    const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');
    
    // Display the main result
    resultContainer.innerHTML = `
        <h3>Analysis Result</h3>
        <p class="result-text ${result.isFake ? 'fake' : 'real'}">
            ${result.isFake ? '⚠️ This video appears to be FAKE' : '✅ This video appears to be REAL'}
        </p>
        <p class="confidence">Confidence: ${result.confidence}%</p>
    `;

    // Display the justification
    justificationElement.innerHTML = `
        <h4>Analysis Details:</h4>
        <p>${result.justification || 'No detailed analysis available.'}</p>
    `;

    analyzeAnotherBtn.style.display = 'block';
}

function resetForm() {
    document.getElementById('videoForm').reset();
    document.getElementById('frameDisplay').innerHTML = '';
    document.getElementById('videoPreview').src = '';
    document.getElementById('videoPreviewContainer').style.display = 'none';
    document.getElementById('analysis-result').innerHTML = '';
    document.getElementById('justification').innerHTML = '';
    document.getElementById('analyzeAnotherBtn').style.display = 'none';
    document.getElementById('downloadReportSection').style.display = 'none';
    document.getElementById('frameSection').style.display = 'none';

    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
    // DO NOT call videoPreview.load() here!
}

function handleVideoSubmit(event) {

    console.log("inside handlevideo submit")
    event.preventDefault();
    const fileInput = document.getElementById('videoFile');
    const file = fileInput.files[0];

    if (file.size > 100 * 1024 * 1024) {
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    document.getElementById('loaderContainer').style.display = 'block';

    const formData = new FormData();
    formData.append('video', file);

    // Show spinner loader
    document.getElementById('spinnerLoader').style.display = 'flex';
    // Optionally, show progress bar for upload
    document.getElementById('progressBarContainer').style.display = 'block';
    document.getElementById('progressBar').style.width = '0';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    // Update progress bar during upload
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            document.getElementById('progressBar').style.width = percent + '%';
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            document.getElementById('loaderContainer').style.display = 'none';
            document.getElementById('analysis-result').innerText = `Prediction: ${data.prediction} (${data.confidence})`;
            document.getElementById('justification').innerText = data.justification;
            document.getElementById('analyzeAnotherBtn').style.display = 'block';
            document.getElementById('spinnerLoader').style.display = 'none';
            document.getElementById('progressBarContainer').style.display = 'none';



            // Display frames
            const frameSection = document.getElementById('frameSection');
            const frameContainer = document.getElementById('frameDisplay');
            frameContainer.innerHTML = '';
            if (data.frames && data.frames.length > 0) {
                data.frames.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url + '?t=' + new Date().getTime();
                    img.alt = 'Extracted Frame';
                    img.className = 'frame-image';
                    frameContainer.appendChild(img);
                });
                frameSection.style.display = 'block';
            } else {
                frameSection.style.display = 'none';
            }
            console.log("Frames received:", data.frames);
            console.log("Frames analyzed:", data.frames_analyzed);
            console.log("Frame-wise probabilities:", data.frame_probs);
            console.log("Raw output vector:", data.raw_output);
            console.log("Landmark variance:", data.landmark_variance);
            console.log("Processing time (s):", data.processing_time);
            console.log("Model version:", data.model_version);

            // Show the download report section
            document.getElementById('downloadReportSection').style.display = 'flex';

            // Store the latest analysis data for the report
            window.latestAnalysisData = data;

            // Show confidence gauge
            const gaugeContainer = document.getElementById('confidenceGaugeContainer');
            const arc = document.getElementById('confidenceArc');
            const text = document.getElementById('confidenceText');
            if (data.confidence) {
                let conf = parseFloat(data.confidence); // e.g. "80.59%"
                if (isNaN(conf)) conf = parseFloat(data.confidence.replace('%',''));
                animateConfidenceGauge(Math.max(0, Math.min(100, conf)));
                const percent = Math.max(0, Math.min(100, conf));
                const circleLen = 2 * Math.PI * 52;
                arc.setAttribute('stroke-dasharray', circleLen);
                arc.setAttribute('stroke-dashoffset', circleLen - (circleLen * percent / 100));
                text.textContent = percent.toFixed(1) + '%';
                gaugeContainer.style.display = 'block';
            } else {
                gaugeContainer.style.display = 'none';
            }
        } else {
            document.getElementById('loaderContainer').style.display = 'none';
            alert("Error analyzing video: " + xhr.statusText);
        }
    };

    xhr.onerror = function() {
        document.getElementById('loaderContainer').style.display = 'none';
        alert("Error analyzing video: " + xhr.statusText);
    };

    xhr.send(formData);
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
            analysisResult.innerHTML = `<p>Analysis Complete: <strong>${data.prediction}</strong> ${data.confidence} confidence</p>`;
            // Add justification display
            const justificationElement = document.getElementById('justification');
            justificationElement.innerHTML = `
                <h4>Analysis Details:</h4>
                <p>${data.justification || 'No detailed analysis available.'}</p>
            `;
            resultContainer.style.display = 'block';
            analyzeAnotherBtn.style.display = 'block';
            document.getElementById('downloadReportSection').style.display = 'flex';
        } else {
            analysisResult.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
            resultContainer.style.display = 'block';
            analyzeAnotherBtn.style.display = 'block';
            document.getElementById('downloadReportSection').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loaderContainer.style.display = 'none';
        processingOverlay.style.display = 'none';
        analyzeBtn.classList.remove('is-loading');
        analyzeBtn.disabled = false;
        analysisResult.innerHTML = `<p style="color: red;">Analysis failed. Please try again.</p>`;
        resultContainer.style.display = 'block';
        analyzeAnotherBtn.style.display = 'block';
    });
}

function previewVideo() {
    document.getElementById('analysis-result').innerHTML = '';
    document.getElementById('justification').innerHTML = '';
    document.getElementById('frameDisplay').innerHTML = '';
    document.getElementById('downloadReportSection').style.display = 'none';
    document.getElementById('frameSection').style.display = 'none';
    const videoFileInput = document.getElementById('videoFile');
    const videoPreview = document.getElementById('videoPreview');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');
    const errorMessage = document.getElementById('error-message');
    const file = videoFileInput.files[0];

    if (file) {
        if (file.size > MAX_FILE_SIZE) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = '⚠️ File size exceeds limit!';
            // Optionally, hide the video preview
            videoPreviewContainer.style.display = 'none';
            return;
        } else {
            errorMessage.style.display = 'none';
        }

        const videoURL = URL.createObjectURL(file);
        videoPreview.src = videoURL;

        videoPreview.onloadeddata = () => {
            console.log("Video is ready to play.");
            videoPreviewContainer.style.display = 'block';
            videoPreview.style.display = 'block';
        };

        videoPreview.onerror = () => {
            console.error("⚠️ Video preview failed — possibly unsupported codec.");
            errorMessage.style.display = 'block';
            errorMessage.textContent = '⚠️ Cannot preview this video. Unsupported format or corrupted file.';
            videoPreviewContainer.style.display = 'none';
        };

        videoPreview.load();
    } else {
        videoPreview.src = '';
        videoPreviewContainer.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-theme');
        if (body.classList.contains('light-theme')) {
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        } else {
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        }
    });

    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('videoFile');

    // Highlight drop area on drag over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('dragover');
        }, false);
    });

    // Remove highlight on drag leave/drop
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            previewVideo(); // Optionally preview the video
        }
    });

    // Optional: clicking the drop area opens file dialog
    dropArea.addEventListener('click', () => fileInput.click());
});

document.addEventListener('DOMContentLoaded', function() {
    // console.log("clickeddddddd")
    const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');
    if (analyzeAnotherBtn) {
        analyzeAnotherBtn.addEventListener('click', resetForm);
    }

    const downloadSection = document.getElementById('downloadReportSection');
    const downloadBtn = document.getElementById('downloadReportBtn');

    // Show the download button after analysis
    function showDownloadReport() {
        if (downloadSection) downloadSection.style.display = 'flex';
    }

    // Example: Call showDownloadReport() after analysis is done
    // In your handleVideoSubmit .then(data => { ... })
    // After showing justification/result:
    // showDownloadReport();

    // Download report logic
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const data = window.latestAnalysisData;
            if (!data) return;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('DeepFake Detection Detailed Report', 105, 18, { align: 'center' });

            // Main Results
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            let y = 30;
            doc.text(`Prediction: `, 10, y);
            doc.setFont('helvetica', 'bold');
            doc.text(`${data.prediction}`, 45, y);
            doc.setFont('helvetica', 'normal');
            y += 8;
            doc.text(`Confidence: `, 10, y);
            doc.setFont('helvetica', 'bold');
            doc.text(`${data.confidence}`, 45, y);
            doc.setFont('helvetica', 'normal');
            y += 8;
            doc.text('Justification:', 10, y);
            y += 7;
            doc.setFontSize(11);
            doc.text(doc.splitTextToSize(data.justification, 180), 14, y);
            y += doc.getTextDimensions(doc.splitTextToSize(data.justification, 180)).h + 4;

            // Analysis Details
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Analysis Details:', 10, y);
            doc.setFont('helvetica', 'normal');
            y += 8;
            doc.text(`Frames analyzed: ${data.frames_analyzed}`, 14, y);
            y += 8;
            doc.text(`Landmark variance: ${data.landmark_variance}`, 14, y);
            y += 8;
            doc.text(`Processing time (s): ${data.processing_time}`, 14, y);
            y += 8;
            doc.text(`Model version: ${data.model_version}`, 14, y);
            y += 10;

            // Raw Output Vector
            doc.setFont('helvetica', 'bold');
            doc.text('Raw output vector:', 10, y);
            doc.setFont('helvetica', 'normal');
            doc.text(JSON.stringify(data.raw_output), 60, y);
            y += 10;

            // Frame-wise Probabilities Table
            if (data.frame_probs && data.frame_probs.length) {
                doc.setFont('helvetica', 'bold');
                doc.text('Frame-wise Probabilities:', 10, y);
                y += 7;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                doc.text('Frame', 14, y);
                doc.text('Real (%)', 40, y);
                doc.text('Fake (%)', 70, y);
                y += 5;
                doc.setLineWidth(0.1);
                doc.line(14, y, 100, y);
                y += 4;
                data.frame_probs.forEach((prob, idx) => {
                    if (y > 270) { // Add new page if needed
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`${idx + 1}`, 14, y);
                    doc.text(`${(prob[0]*100).toFixed(2)}`, 40, y);
                    doc.text(`${(prob[1]*100).toFixed(2)}`, 70, y);
                    y += 6;
                });
            }

            doc.save('deepfake_detailed_report.pdf');
        });
    }
});

function animateConfidenceGauge(targetPercent) {
    const arc = document.getElementById('confidenceArc');
    const text = document.getElementById('confidenceText');
    const gaugeContainer = document.getElementById('confidenceGaugeContainer');
    const circleLen = 2 * Math.PI * 52;
    let current = 0;
    gaugeContainer.style.display = 'flex';

    function animate() {
        if (current < targetPercent) {
            current += 1;
            if (current > targetPercent) current = targetPercent;
            arc.setAttribute('stroke-dasharray', circleLen);
            arc.setAttribute('stroke-dashoffset', circleLen - (circleLen * current / 100));
            text.textContent = current.toFixed(0) + '%';
            requestAnimationFrame(animate);
        } else {
            arc.setAttribute('stroke-dasharray', circleLen);
            arc.setAttribute('stroke-dashoffset', circleLen - (circleLen * targetPercent / 100));
            text.textContent = targetPercent.toFixed(1) + '%';
        }
    }
    animate();
}