"""Face detection and 128-D embedding generation for AlzCare.

Uses OpenCV Zoo's YuNet face detector and SFace embedding model. One image is
processed in memory and is neither logged nor persisted.
"""
import io
import os
import numpy as np
from PIL import Image, UnidentifiedImageError

MODEL_NAME = "opencv-sface-128"
_detector = None
_recognizer = None
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "face_models")


class FaceValidationError(ValueError):
    pass


def generate_embedding(contents: bytes):
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise FaceValidationError("Please upload a valid image file.") from exc

    # Reject tiny / nearly blank uploads before expensive inference.
    if min(image.size) < 160:
        raise FaceValidationError("Image is too small. Please upload a clear front-facing photo.")
    pixels = np.asarray(image)
    if float(np.std(pixels)) < 8:
        raise FaceValidationError("Image quality is too low. Please upload a clear front-facing photo.")

    global _detector, _recognizer
    try:
        import cv2
        if _detector is None:
            detector_path = os.path.join(_MODEL_DIR, "face_detection_yunet_2023mar.onnx")
            recognizer_path = os.path.join(_MODEL_DIR, "face_recognition_sface_2021dec.onnx")
            if not os.path.exists(detector_path) or not os.path.exists(recognizer_path):
                raise RuntimeError("Face recognition model files are not installed.")
            _detector = cv2.FaceDetectorYN.create(detector_path, "", (320, 320), 0.6, 0.3, 5000)
            _recognizer = cv2.FaceRecognizerSF.create(recognizer_path, "")
    except ImportError as exc:
        raise RuntimeError("Face recognition dependencies are not installed. Use Python 3.11 and model/requirements.txt.") from exc

    # PIL gives RGB; OpenCV inference expects BGR.
    bgr = cv2.cvtColor(pixels, cv2.COLOR_RGB2BGR)
    height, width = bgr.shape[:2]
    _detector.setInputSize((width, height))
    _, faces = _detector.detect(bgr)
    if faces is None or len(faces) == 0:
        raise FaceValidationError("No face detected. Please upload a clear front-facing photo.")
    if len(faces) > 1:
        raise FaceValidationError("Multiple faces detected. Please upload a photo containing only this family member.")
    face = faces[0]
    x, y, face_width, face_height = face[:4].astype(int)
    if min(face_width, face_height) < 80:
        raise FaceValidationError("Face is too small or unclear. Please move closer and try again.")
    if face[-1] < 0.65:
        raise FaceValidationError("Unable to generate a clear face profile. Please try another photo.")
    aligned = _recognizer.alignCrop(bgr, face)
    embedding = _recognizer.feature(aligned).flatten().astype(float)
    return (embedding / np.linalg.norm(embedding)).tolist()
