import cv2
import numpy as np
from landmark_extraction import extract_landmarks_from_frame

def extract_features_from_video(video_path, frame_skip=30, max_frames=50):
    """
    Extracts features from a video by averaging facial landmark features across a subset of frames.

    Parameters:
        video_path (str): Path to the video file.
        frame_skip (int): Number of frames to skip between processing.
        max_frames (int): Maximum number of frames to process per video.

    Returns:
        numpy.ndarray: Averaged feature vector or None if no valid frames are processed.
    """
    cap = cv2.VideoCapture(video_path)
    features = []
    frame_count = 0
    processed_frames = 0

    while cap.isOpened() and processed_frames < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_skip == 0:  # Process every `frame_skip` frame
            landmarks = extract_landmarks_from_frame(frame)
            if landmarks is not None:
                features.append(landmarks)
                processed_frames += 1

        frame_count += 1

    cap.release()
    if len(features) > 0:
        return np.mean(features, axis=0)  # Average features across frames
    else:
        return None
