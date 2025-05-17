
# 🎭 Deepfake Detection using SVM and Facial Landmarks

This project is a Deepfake Detection web application that uses facial landmarks extracted from video frames and classifies them as **Real** or **Fake** using a Support Vector Machine (SVM) model.

## 📌 Features

- Upload a video for deepfake analysis
- Frame-wise facial landmark extraction
- SVM-based binary classification (Real vs Fake)
- Displays prediction, confidence score, and reasoning
- Real-time loader and result display in UI

---

## 🧠 Tech Stack

| Component        | Technology                |
|------------------|---------------------------|
| Frontend         | HTML, CSS, JavaScript     |
| Backend          | Flask (Python)            |
| Model            | SVM (scikit-learn)        |
| Face Detection   | dlib                      |
| Feature Extraction | 68-point facial landmarks |
| Hosting          | Localhost (Flask dev server) |

---

## 🗂 Project Structure

```
Deepfake-Detection/
│
├──process/
    └──dataset_processing.py   # Processing on dataset
    └──landmark_extracion.py   # Exctracting landmarks
    └──main.py                 # Building model
    └──model_training.py       # Training model
    └──video_processing.py     # Video processing
├──Deepfake_detection/
    └──shape_predictor_68_face_landmarks.dat # Pretrained model for extracting landmarks
├──model/
    └──svm_face_classifier.pkl # Backup model (pre-trained)
├── app.py                     # Flask backend server
├── svm_face_classifier.pkl    # Trained SVM model
├── templates/
│   └── index.html             # Main web interface
├── static/
│   ├── css/
│   │   └── styles.css         # UI styling
│   └── js/
│       └── script.js          # Upload/analysis logic
├── uploads/                   # Uploaded videos
└── README.md                  # Project documentation
```

---

## 📥 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Ob00000000/deepfake-detection.git
cd deepfake-detection
```

### 2. Install dependencies

Make sure Python 3.7+ is installed. Then run:

```bash
pip install -r requirements.txt
```

**Required packages:**

```txt
flask
flask-cors
opencv-python
dlib
numpy
scikit-learn
joblib
```
- **If you are having truble with building the dlib wheel then try installing the binary distribution of lib**
[Download from here](https://github.com/z-mahmud22/Dlib_Windows_Python3.x)

### 3. Download Pretrained Models

- **68-point landmark predictor** (required by dlib):  
  [Download from here](http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2)  
  Extract and place in the project directory.

- **SVM Model:**  
  Ensure `svm_face_classifier.pkl` is available in the root directory.

---

## 🚀 Running the App

```bash
python app.py
```

Then open your browser and visit:

```
http://127.0.0.1:5000/
```

---

## 🔍 How It Works

1. **Video Upload** – User uploads a short video (max 100MB).
2. **Frame Sampling** – Every 30th frame is selected up to a limit (50 frames max).
3. **Facial Landmark Detection** – 68 landmarks are extracted using dlib.
4. **Feature Averaging** – Features across frames are averaged.
5. **Classification** – The averaged features are classified using a trained SVM.
6. **Result** – The prediction, confidence score, and reasoning are displayed.

---

## 📊 Model Details

- **Algorithm:** Support Vector Machine (SVM)
- **Input:** 68-point facial landmarks per frame
- **Trained with:** Real and fake video samples
- **Confidence Score:** Derived from decision function output

---

## ⚠️ Limitations

- Works best with frontal face videos
- Requires good lighting and clear face visibility
- Real-time video detection not supported yet

---

## 📃 License

This project is for educational and research purposes only.
