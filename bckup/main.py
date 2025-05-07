from dataset_processing import process_dataset
from model_training import train_model
import joblib

if __name__ == "__main__":
    # Paths to real and fake folders
    real_folder = "E:\\Projects\\Deepfake Detection\\data\\real_videos"
    fake_folder = "E:\\Projects\\Deepfake Detection\\data\\deepfake_videos"

    # Step 1: Process the dataset to extract features and labels
    print("Extracting features from dataset...")
    X, y = process_dataset(real_folder, fake_folder, frame_skip=30, max_frames=50)
    print(f"Feature extraction completed. Total samples: {len(X)}")

    # Step 2: Train a model on the extracted features
    print("Training model...")
    model = train_model(X, y)

    # Step 3: Save the trained model for later use
    model_path = "E:\Projects\Deepfake Detection\svm_face_classifier.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
