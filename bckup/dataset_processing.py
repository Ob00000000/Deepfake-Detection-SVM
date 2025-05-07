import os
import numpy as np
from multiprocessing import Pool
from video_processing import extract_features_from_video

def process_video_wrapper(args):
    """Wrapper for multiprocessing."""
    return extract_features_from_video(*args)

def process_dataset(real_folder, fake_folder, frame_skip=30, max_frames=50):
    """
    Processes videos from the real and fake folders to extract features and labels.

    Parameters:
        real_folder (str): Path to the folder containing real videos.
        fake_folder (str): Path to the folder containing fake videos.
        frame_skip (int): Number of frames to skip between processing.
        max_frames (int): Maximum number of frames to process per video.

    Returns:
        tuple: Features (X) and labels (y).
    """
    X, y = [], []
    video_paths = []

    # Process real videos
    for video_file in os.listdir(real_folder):
        video_paths.append((os.path.join(real_folder, video_file), frame_skip, max_frames))
        y.append(0)  # Label: 0 for real

    # Process fake videos
    for video_file in os.listdir(fake_folder):
        video_paths.append((os.path.join(fake_folder, video_file), frame_skip, max_frames))
        y.append(1)  # Label: 1 for fake

    # Process videos in parallel
    print("Processing videos in parallel...")
    with Pool() as pool:
        features = pool.map(process_video_wrapper, video_paths)

    # Filter out None results
    X = [f for f in features if f is not None]
    y = [label for i, label in enumerate(y) if features[i] is not None]

    return np.array(X), np.array(y)
