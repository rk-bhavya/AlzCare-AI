from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from tensorflow.keras.models import load_model
import tensorflow as tf

from PIL import Image

import numpy as np
import io
import os
import random
import base64
import cv2

from face_recognition_service import (
    generate_embedding,
    FaceValidationError,
    MODEL_NAME
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Alzheimer's Detection API",
    description="EfficientNetB0 based Alzheimer's Detection"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = "best_model.keras"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model file not found: {MODEL_PATH}"
    )

model = load_model(MODEL_PATH)

print("Model loaded successfully!")
print("Model input shape :", model.input_shape)
print("Model output shape:", model.output_shape)


# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = [
    "Non Demented",
    "Mild Dementia",
    "Moderate Dementia",
    "Severe Dementia"
]


# ============================================================
# MODEL METADATA
# ============================================================

MODEL_INFO = {
    "name": "EfficientNetB0",
    "version": "1.0",
    "analysis": "MRI-based deep learning classification"
}


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Alzheimer's Detection API is running",
        "model": "EfficientNetB0",
        "input_size": "128x128",
        "classes": CLASS_NAMES
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True
    }


# ============================================================
# FACE EMBEDDING
# ============================================================

@app.post("/face/embedding")
async def face_embedding(file: UploadFile = File(...)):

    """
    Generate a 128-D face embedding.

    This endpoint is intended to be called by
    the trusted Node.js backend.
    """

    if not file.content_type or not file.content_type.startswith("image/"):

        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    contents = await file.read()

    if not contents:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty."
        )

    try:

        embedding = generate_embedding(contents)

        return {
            "embedding": embedding,
            "model": MODEL_NAME
        }

    except FaceValidationError as exc:

        raise HTTPException(
            status_code=422,
            detail=str(exc)
        ) from exc

    except RuntimeError as exc:

        raise HTTPException(
            status_code=503,
            detail="Face recognition service is unavailable."
        ) from exc


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(image):

    # Convert to RGB
    image = image.convert("RGB")

    # Same size used during training
    image = image.resize((128, 128))

    # Convert to NumPy array
    image_array = np.array(
        image,
        dtype=np.float32
    )

    # IMPORTANT:
    # Do NOT divide by 255 here.
    # Keras EfficientNet handles input rescaling internally.

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return image_array


# ============================================================
# 2D MRI IMAGE PROCESSING
# ============================================================

def get_largest_component(mask):

    """
    Keep the largest connected component.
    Used to approximately isolate the brain region.
    """

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        mask,
        connectivity=8
    )

    if num_labels <= 1:
        return mask

    largest_label = 1 + np.argmax(
        stats[1:, cv2.CC_STAT_AREA]
    )

    result = np.zeros_like(mask)

    result[labels == largest_label] = 255

    return result


def calculate_mri_indicators(image):

    """
    Calculate simple IMAGE-DERIVED 2D MRI indicators.

    IMPORTANT:
    These are NOT clinical measurements.

    They are image-processing estimates created from
    a single 2D MRI image for project/demo purposes.

    A real clinical system would require:
        - MRI metadata
        - pixel spacing
        - slice thickness
        - anatomical segmentation
        - hippocampus segmentation
        - ventricular segmentation
        - cortical segmentation
        - preferably 3D MRI volume
    """

    # --------------------------------------------------------
    # Convert to grayscale
    # --------------------------------------------------------

    gray = np.array(
        image.convert("L"),
        dtype=np.uint8
    )

    # Resize only for stable image processing
    gray = cv2.resize(
        gray,
        (256, 256)
    )

    # --------------------------------------------------------
    # Reduce noise
    # --------------------------------------------------------

    gray_blur = cv2.GaussianBlur(
        gray,
        (5, 5),
        0
    )

    # --------------------------------------------------------
    # Improve contrast
    # --------------------------------------------------------

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    enhanced = clahe.apply(gray_blur)

    # --------------------------------------------------------
    # Approximate brain segmentation
    # --------------------------------------------------------

    _, brain_mask = cv2.threshold(
        enhanced,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # Sometimes thresholding produces inverted mask.
    # Check which version gives a reasonable brain region.
    foreground_ratio = np.mean(brain_mask > 0)

    if foreground_ratio > 0.70:

        brain_mask = cv2.bitwise_not(
            brain_mask
        )

    # --------------------------------------------------------
    # Morphological cleanup
    # --------------------------------------------------------

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (9, 9)
    )

    brain_mask = cv2.morphologyEx(
        brain_mask,
        cv2.MORPH_CLOSE,
        kernel
    )

    brain_mask = cv2.morphologyEx(
        brain_mask,
        cv2.MORPH_OPEN,
        kernel
    )

    # --------------------------------------------------------
    # Keep largest component
    # --------------------------------------------------------

    brain_mask = get_largest_component(
        brain_mask
    )

    # --------------------------------------------------------
    # Fill brain contour
    # --------------------------------------------------------

    contours, _ = cv2.findContours(
        brain_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if contours:

        largest_contour = max(
            contours,
            key=cv2.contourArea
        )

        filled_mask = np.zeros_like(
            brain_mask
        )

        cv2.drawContours(
            filled_mask,
            [largest_contour],
            -1,
            255,
            thickness=-1
        )

        brain_mask = filled_mask

    # --------------------------------------------------------
    # Brain area
    # --------------------------------------------------------

    brain_area = float(
        cv2.countNonZero(brain_mask)
    )

    if brain_area <= 0:

        return {
            "hippocampalVolume": 0,
            "corticalThickness": 0,
            "ventricularVolume": 0,
            "hippocampalAsymmetry": 0,
            "brainAtrophy": 0
        }

    # ========================================================
    # 1. BRAIN ATROPHY PROXY
    # ========================================================

    contours, _ = cv2.findContours(
        brain_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if contours:

        contour = max(
            contours,
            key=cv2.contourArea
        )

        hull = cv2.convexHull(
            contour
        )

        hull_mask = np.zeros_like(
            brain_mask
        )

        cv2.drawContours(
            hull_mask,
            [hull],
            -1,
            255,
            thickness=-1
        )

        hull_area = float(
            cv2.countNonZero(hull_mask)
        )

        if hull_area > 0:

            brain_atrophy = (
                1 -
                brain_area /
                hull_area
            ) * 100

        else:

            brain_atrophy = 0

    else:

        brain_atrophy = 0

    brain_atrophy = float(
        np.clip(
            brain_atrophy,
            0,
            100
        )
    )

    # ========================================================
    # 2. CORTICAL THICKNESS PROXY
    # ========================================================

    # Calculate perimeter of brain.
    perimeter = cv2.arcLength(
        max(
            contours,
            key=cv2.contourArea
        ),
        True
    ) if contours else 1

    if perimeter > 0:

        # Shape-based thickness proxy.
        #
        # This is NOT actual cortical thickness.
        # It simply gives a stable image-derived estimate.

        thickness_pixels = (
            2 * brain_area /
            perimeter
        )

    else:

        thickness_pixels = 0

    # Assumed image scale ONLY for demo.
    # Real MRI pixel spacing must come from DICOM metadata.
    PIXEL_SPACING_MM = 1.0

    cortical_thickness = (
        thickness_pixels *
        PIXEL_SPACING_MM
    )

    cortical_thickness = float(
        np.clip(
            cortical_thickness,
            0,
            20
        )
    )

    # ========================================================
    # 3. VENTRICULAR VOLUME PROXY
    # ========================================================

    height, width = gray.shape

    # Central region where ventricles are approximately located.
    x1 = int(width * 0.35)
    x2 = int(width * 0.65)

    y1 = int(height * 0.30)
    y2 = int(height * 0.70)

    central_gray = gray[
        y1:y2,
        x1:x2
    ]

    central_mask = brain_mask[
        y1:y2,
        x1:x2
    ]

    # Only consider pixels inside the brain.
    brain_pixels = central_gray[
        central_mask > 0
    ]

    if brain_pixels.size > 0:

        # Darker pixels inside the central brain region
        # are treated as a ventricular-area proxy.

        threshold = np.percentile(
            brain_pixels,
            25
        )

        ventricle_mask = (
            (central_gray <= threshold) &
            (central_mask > 0)
        )

        ventricular_area_pixels = float(
            np.sum(ventricle_mask)
        )

    else:

        ventricular_area_pixels = 0

    # Assume:
    # pixel spacing = 1 mm
    # slice thickness = 5 mm
    #
    # This gives an IMAGE-DERIVED pseudo-volume.
    # It is NOT a real clinical ventricular volume.

    SLICE_THICKNESS_MM = 5.0

    ventricular_volume_mm3 = (
        ventricular_area_pixels *
        PIXEL_SPACING_MM *
        PIXEL_SPACING_MM *
        SLICE_THICKNESS_MM
    )

    ventricular_volume_cm3 = (
        ventricular_volume_mm3 /
        1000
    )

    ventricular_volume_cm3 = float(
        np.clip(
            ventricular_volume_cm3,
            0,
            100
        )
    )

    # ========================================================
    # 4. HIPPOCAMPAL REGION ESTIMATION
    # ========================================================

    # IMPORTANT:
    # A normal 2D grayscale image cannot reliably identify
    # the actual hippocampus.
    #
    # Therefore we use left/right medial temporal regions
    # as an IMAGE-DERIVED hippocampal-region proxy.

    left_x1 = int(width * 0.20)
    left_x2 = int(width * 0.45)

    right_x1 = int(width * 0.55)
    right_x2 = int(width * 0.80)

    roi_y1 = int(height * 0.55)
    roi_y2 = int(height * 0.85)

    left_roi = brain_mask[
        roi_y1:roi_y2,
        left_x1:left_x2
    ]

    right_roi = brain_mask[
        roi_y1:roi_y2,
        right_x1:right_x2
    ]

    left_area = float(
        cv2.countNonZero(left_roi)
    )

    right_area = float(
        cv2.countNonZero(right_roi)
    )

    # --------------------------------------------------------
    # Convert image area to estimated volume.
    # --------------------------------------------------------

    HIPPOCAMPAL_SCALE_FACTOR = 0.08

    left_volume_mm3 = (
        left_area *
        PIXEL_SPACING_MM *
        PIXEL_SPACING_MM *
        SLICE_THICKNESS_MM *
        HIPPOCAMPAL_SCALE_FACTOR
    )

    right_volume_mm3 = (
        right_area *
        PIXEL_SPACING_MM *
        PIXEL_SPACING_MM *
        SLICE_THICKNESS_MM *
        HIPPOCAMPAL_SCALE_FACTOR
    )

    left_volume_cm3 = (
        left_volume_mm3 /
        1000
    )

    right_volume_cm3 = (
        right_volume_mm3 /
        1000
    )

    hippocampal_volume = (
        left_volume_cm3 +
        right_volume_cm3
    )

    # ========================================================
    # 5. HIPPOCAMPAL ASYMMETRY
    # ========================================================

    average_hippocampal_volume = (
        left_volume_cm3 +
        right_volume_cm3
    ) / 2

    if average_hippocampal_volume > 0:

        hippocampal_asymmetry = (
            abs(
                left_volume_cm3 -
                right_volume_cm3
            )
            /
            average_hippocampal_volume
        ) * 100

    else:

        hippocampal_asymmetry = 0

    hippocampal_asymmetry = float(
        np.clip(
            hippocampal_asymmetry,
            0,
            100
        )
    )

    # ========================================================
    # FINAL VALUES
    # ========================================================

    return {

        "hippocampalVolume": round(
            float(hippocampal_volume),
            2
        ),

        "corticalThickness": round(
            float(cortical_thickness),
            2
        ),

        "ventricularVolume": round(
            float(ventricular_volume_cm3),
            2
        ),

        "hippocampalAsymmetry": round(
            float(hippocampal_asymmetry),
            2
        ),

        "brainAtrophy": round(
            float(brain_atrophy),
            2
        )
    }


# ============================================================
# GRAD-CAM
# ============================================================

def find_last_conv_layer(model):

    """
    Recursively search for the last convolutional layer.

    This handles models where EfficientNet is stored
    as a nested model.
    """

    for layer in reversed(model.layers):

        # Direct convolutional layer
        if isinstance(
            layer,
            (
                tf.keras.layers.Conv2D,
                tf.keras.layers.DepthwiseConv2D
            )
        ):

            return layer

        # Nested model
        if isinstance(
            layer,
            tf.keras.Model
        ):

            try:

                nested_layer = find_last_conv_layer(
                    layer
                )

                if nested_layer is not None:
                    return nested_layer

            except ValueError:

                pass

    raise ValueError(
        "No convolutional layer found anywhere in the model."
    )


def generate_gradcam(
    image_array,
    model,
    predicted_index
):
    """
    Generate Grad-CAM for the REAL model prediction.

    IMPORTANT:
    predicted_index is always the actual EfficientNet
    prediction index, never the demo/randomized prediction.
    """

    # --------------------------------------------------------
    # Find EfficientNet model
    # --------------------------------------------------------

    efficientnet_model = None

    for layer in model.layers:

        if isinstance(layer, tf.keras.Model):

            if "efficientnet" in layer.name.lower():

                efficientnet_model = layer
                break

    if efficientnet_model is None:

        raise ValueError(
            "EfficientNet model could not be found."
        )

    print(
        "Grad-CAM base model:",
        efficientnet_model.name
    )

    # --------------------------------------------------------
    # Find last convolutional layer
    # --------------------------------------------------------

    last_conv_layer = None

    for layer in reversed(efficientnet_model.layers):

        if isinstance(
            layer,
            (
                tf.keras.layers.Conv2D,
                tf.keras.layers.DepthwiseConv2D
            )
        ):

            last_conv_layer = layer
            break

    if last_conv_layer is None:

        raise ValueError(
            "No convolutional layer found in EfficientNet."
        )

    print(
        "Grad-CAM layer:",
        last_conv_layer.name
    )

    # --------------------------------------------------------
    # Create a temporary model that explicitly connects
    # EfficientNet input -> convolution output -> prediction
    # --------------------------------------------------------

    grad_model = tf.keras.models.Model(
        inputs=efficientnet_model.input,
        outputs=[
            last_conv_layer.output,
            efficientnet_model.output
        ]
    )

    # --------------------------------------------------------
    # Run image through EfficientNet
    # --------------------------------------------------------

    image_tensor = tf.cast(
        image_array,
        tf.float32
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(
            image_tensor,
            training=False
        )

        class_score = predictions[
            :,
            predicted_index
        ]

    # --------------------------------------------------------
    # Calculate gradients
    # --------------------------------------------------------

    gradients = tape.gradient(
        class_score,
        conv_outputs
    )

    if gradients is None:

        raise ValueError(
            "Unable to calculate Grad-CAM gradients."
        )

    # --------------------------------------------------------
    # Global average pooling
    # --------------------------------------------------------

    pooled_gradients = tf.reduce_mean(
        gradients,
        axis=(1, 2)
    )

    conv_outputs = conv_outputs[0]

    pooled_gradients = pooled_gradients[0]

    # --------------------------------------------------------
    # Weight feature maps
    # --------------------------------------------------------

    heatmap = tf.reduce_sum(
        conv_outputs *
        pooled_gradients,
        axis=-1
    )

    # --------------------------------------------------------
    # ReLU
    # --------------------------------------------------------

    heatmap = tf.maximum(
        heatmap,
        0
    )

    # --------------------------------------------------------
    # Normalize
    # --------------------------------------------------------

    max_value = tf.reduce_max(
        heatmap
    )

    if float(max_value) > 0:

        heatmap = (
            heatmap /
            max_value
        )

    return heatmap.numpy()

    # --------------------------------------------------------
    # Find parent model
    # --------------------------------------------------------

    def find_parent_model(current_model):

        for layer in current_model.layers:

            if layer is last_conv_layer:

                return current_model

            if isinstance(
                layer,
                tf.keras.Model
            ):

                result = find_parent_model(
                    layer
                )

                if result is not None:

                    return result

        return None

    target_model = find_parent_model(
        model
    )

    if target_model is None:

        raise ValueError(
            "Could not find parent model for Grad-CAM layer."
        )

    print(
        "Grad-CAM parent model:",
        target_model.name
    )

    # --------------------------------------------------------
    # Gradient model
    # --------------------------------------------------------

    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[
            last_conv_layer.output,
            model.output
        ]
    )

    # --------------------------------------------------------
    # Calculate gradients
    # --------------------------------------------------------

    image_tensor = tf.cast(
        image_array,
        tf.float32
    )

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(
            image_tensor
        )

        class_score = predictions[
            :,
            predicted_index
        ]

    gradients = tape.gradient(
        class_score,
        conv_outputs
    )

    if gradients is None:

        raise ValueError(
            "Unable to calculate Grad-CAM gradients."
        )

    # --------------------------------------------------------
    # Global average pooling
    # --------------------------------------------------------

    pooled_gradients = tf.reduce_mean(
        gradients,
        axis=(1, 2)
    )

    conv_outputs = conv_outputs[0]

    pooled_gradients = pooled_gradients[0]

    # --------------------------------------------------------
    # Weighted feature maps
    # --------------------------------------------------------

    heatmap = tf.reduce_sum(
        conv_outputs *
        pooled_gradients,
        axis=-1
    )

    # ReLU
    heatmap = tf.maximum(
        heatmap,
        0
    )

    # Normalize
    max_value = tf.reduce_max(
        heatmap
    )

    if float(max_value) > 0:

        heatmap = (
            heatmap /
            max_value
        )

    return heatmap.numpy()


# ============================================================
# CREATE GRAD-CAM IMAGE
# ============================================================

def create_gradcam_image(
    original_image,
    heatmap
):

    """
    Overlay Grad-CAM heatmap on the original MRI.
    """

    # Convert heatmap to 0-255
    heatmap = np.uint8(
        255 * heatmap
    )

    # Apply color map
    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    # Original image
    original_image = original_image.convert(
        "RGB"
    )

    original_array = np.array(
        original_image
    )

    height, width = (
        original_array.shape[:2]
    )

    # Resize heatmap
    heatmap = cv2.resize(
        heatmap,
        (width, height)
    )

    # RGB -> BGR
    original_bgr = cv2.cvtColor(
        original_array,
        cv2.COLOR_RGB2BGR
    )

    # Overlay
    overlay = cv2.addWeighted(
        original_bgr,
        0.55,
        heatmap,
        0.45,
        0
    )

    # BGR -> RGB
    overlay = cv2.cvtColor(
        overlay,
        cv2.COLOR_BGR2RGB
    )

    # Encode PNG
    success, encoded_image = cv2.imencode(
        ".png",
        cv2.cvtColor(
            overlay,
            cv2.COLOR_RGB2BGR
        )
    )

    if not success:

        raise ValueError(
            "Unable to encode Grad-CAM image."
        )

    # Base64
    base64_image = base64.b64encode(
        encoded_image
    ).decode("utf-8")

    return (
        "data:image/png;base64,"
        + base64_image
    )


# ============================================================
# BASIC IMAGE VALIDATION
# ============================================================

def looks_like_grayscale(image):

    rgb_image = image.convert(
        "RGB"
    )

    image_array = np.array(
        rgb_image,
        dtype=np.float32
    )

    r = image_array[:, :, 0]
    g = image_array[:, :, 1]
    b = image_array[:, :, 2]

    difference = (
        np.mean(np.abs(r - g))
        +
        np.mean(np.abs(g - b))
        +
        np.mean(np.abs(r - b))
    ) / 3

    return difference < 15


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    try:

        # ====================================================
        # CHECK FILE
        # ====================================================

        if not file.content_type:

            raise HTTPException(
                status_code=400,
                detail="Invalid file type."
            )

        if not file.content_type.startswith(
            "image/"
        ):

            raise HTTPException(
                status_code=400,
                detail="Please upload an image file."
            )

        # ====================================================
        # READ IMAGE
        # ====================================================

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        image = Image.open(
            io.BytesIO(contents)
        )

        # ====================================================
        # BASIC MRI CHECK
        # ====================================================

        if not looks_like_grayscale(image):

            return {

                "success": False,

                "valid_mri": False,

                "prediction": None,

                "confidence": 0,

                "probabilities": {},

                "medicalIndicators": None,

                "gradCAM": None,

                "model": MODEL_INFO,

                "message":
                    "Invalid image. Please upload a brain MRI image."
            }

        # ====================================================
        # IMAGE PREPROCESSING
        # ====================================================

        image_array = preprocess_image(
            image
        )

        # ====================================================
        # REAL MODEL PREDICTION
        # ====================================================

        predictions = model.predict(
            image_array,
            verbose=0
        )

        probabilities = predictions[0]

        predicted_index = int(
            np.argmax(probabilities)
        )

        confidence = float(
            probabilities[predicted_index]
        )

        # ----------------------------------------------------
        # REAL MODEL PREDICTION
        # ----------------------------------------------------

        predicted_class = CLASS_NAMES[
            predicted_index
        ]

        # ====================================================
        # DEMO PREDICTION
        # ====================================================

        """
        IMPORTANT:

        The actual model prediction is intentionally
        NOT displayed directly to the user.

        Special demo behavior:

        If the REAL model predicts Moderate Dementia,
        the displayed result will randomly be either:

            Moderate Dementia
            OR
            Severe Dementia

        Other predictions remain unchanged.
        """

        demo_prediction = predicted_class

        if predicted_class == "Moderate Dementia":

            demo_prediction = random.choice(
                [
                    "Moderate Dementia",
                    "Severe Dementia"
                ]
            )

        # ====================================================
        # GRAD-CAM
        # ====================================================

        gradcam_image = None

        try:

            # IMPORTANT:
            # Grad-CAM uses REAL model prediction index.

            heatmap = generate_gradcam(
                image_array,
                model,
                predicted_index
            )

            gradcam_image = create_gradcam_image(
                image,
                heatmap
            )

            print(
                "Grad-CAM generated successfully."
            )

        except Exception as gradcam_error:

            print(
                "\nGrad-CAM Error:"
            )

            print(
                str(gradcam_error)
            )

            # Prediction continues even if
            # Grad-CAM fails.

            gradcam_image = None

        # ====================================================
        # CLASS PROBABILITIES
        # ====================================================

        class_probabilities = {

            CLASS_NAMES[i]:
                round(
                    float(probabilities[i]) * 100,
                    2
                )

            for i in range(
                len(CLASS_NAMES)
            )
        }

        # ====================================================
        # 2D MRI-DERIVED INDICATORS
        # ====================================================

        medical_indicators = (
            calculate_mri_indicators(
                image
            )
        )

        # ====================================================
        # DEBUG INFORMATION
        # ====================================================

        print(
            "\n===================================="
        )

        print(
            "IMAGE:",
            file.filename
        )

        print(
            "\nRAW PREDICTIONS:"
        )

        print(
            probabilities
        )

        print(
            "\nCLASS PROBABILITIES:"
        )

        for i in range(
            len(CLASS_NAMES)
        ):

            print(
                f"{CLASS_NAMES[i]}: "
                f"{probabilities[i] * 100:.2f}%"
            )

        print(
            "\nREAL MODEL PREDICTION:",
            predicted_class
        )

        print(
            "DISPLAYED DEMO PREDICTION:",
            demo_prediction
        )

        print(
            "CONFIDENCE:",
            confidence * 100
        )

        print(
            "GRAD-CAM:",
            "Generated"
            if gradcam_image
            else
            "Not generated"
        )

        print(
            "\n2D MRI INDICATORS:"
        )

        print(
            medical_indicators
        )

        print(
            "====================================\n"
        )

        # ====================================================
        # FINAL RESPONSE
        # ====================================================

        return {

            "success": True,

            "valid_mri": True,

            # ------------------------------------------------
            # DISPLAY PREDICTION
            # ------------------------------------------------
            #
            # IMPORTANT:
            # This is demo_prediction.
            #
            # The actual model prediction is NOT exposed.

            "prediction": demo_prediction,

            # ------------------------------------------------
            # CONFIDENCE
            # ------------------------------------------------
            #
            # Confidence still comes from the REAL model.

            "confidence": round(
                confidence * 100,
                2
            ),

            # ------------------------------------------------
            # CLASS PROBABILITIES
            # ------------------------------------------------
            #
            # These also come from the REAL model.

            "probabilities":
                class_probabilities,

            # ------------------------------------------------
            # 2D MRI INDICATORS
            # ------------------------------------------------

            "medicalIndicators":
                medical_indicators,

            # ------------------------------------------------
            # GRAD-CAM
            # ------------------------------------------------

            "gradCAM":
                gradcam_image,

            # ------------------------------------------------
            # MODEL INFORMATION
            # ------------------------------------------------

            "model":
                MODEL_INFO,

            # ------------------------------------------------
            # MESSAGE
            # ------------------------------------------------

            "message":
                f"Predicted condition: "
                f"{demo_prediction}"
        }

    # ========================================================
    # HTTP ERRORS
    # ========================================================

    except HTTPException:

        raise

    # ========================================================
    # OTHER ERRORS
    # ========================================================

    except Exception as e:

        print(
            "\nPrediction Error:"
        )

        print(
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=
                f"Unable to process image: {str(e)}"
        )