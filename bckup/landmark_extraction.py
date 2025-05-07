import cv2
import dlib
import numpy as np

# Initialize dlib's face detector and shape predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor('E:\\Projects\\Deepfake Detection\\deepfake_detection\\shape_predictor_68_face_landmarks.dat')

def extract_landmarks_from_frame(frame):
    """
    Extracts 68 facial landmarks from a video frame.

    Parameters:
        frame (numpy.ndarray): Input video frame in BGR format.

    Returns:
        numpy.ndarray: Flattened array of 68 landmark points or None if no face is detected.
    """
    resized_frame = cv2.resize(frame, (frame.shape[1] // 2, frame.shape[0] // 2))  # Downscale for speed
    gray_resized = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2GRAY)
    gray_resized = cv2.equalizeHist(gray_resized)  # Enhance contrast

    faces = detector(gray_resized)
    if len(faces) == 0:
        return None  # No faces detected

    try:
        shape = predictor(gray_resized, faces[0])  # Use the first detected face
        landmarks = [(shape.part(n).x, shape.part(n).y) for n in range(68)]
        return np.array(landmarks).flatten()
    except Exception as e:
        print(f"Error processing landmarks: {e}")
        return None
