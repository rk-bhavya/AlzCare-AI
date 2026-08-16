from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import os


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
# CONFIRMED FROM YOUR DATASET
# ============================================================

CLASS_NAMES = [
    "Mild Dementia",
    "Moderate Dementia",
    "Non Demented",
    "Very Mild Dementia"
]


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
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(image):

    # Convert to RGB
    image = image.convert("RGB")

    # Same size used during training
    image = image.resize((128, 128))

    # Convert to numpy
    image_array = np.array(
        image,
        dtype=np.float32
    )

    # DO NOT divide by 255 here.
    # Keras EfficientNet handles its input rescaling.

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return image_array


# ============================================================
# BASIC IMAGE VALIDATION
# ============================================================

def looks_like_grayscale(image):

    rgb_image = image.convert("RGB")

    image_array = np.array(
        rgb_image,
        dtype=np.float32
    )

    r = image_array[:, :, 0]
    g = image_array[:, :, 1]
    b = image_array[:, :, 2]

    difference = (
        np.mean(np.abs(r - g)) +
        np.mean(np.abs(g - b)) +
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

        # ----------------------------------------------------
        # CHECK FILE
        # ----------------------------------------------------

        if not file.content_type:

            raise HTTPException(
                status_code=400,
                detail="Invalid file type."
            )

        if not file.content_type.startswith("image/"):

            raise HTTPException(
                status_code=400,
                detail="Please upload an image file."
            )


        # ----------------------------------------------------
        # READ IMAGE
        # ----------------------------------------------------

        contents = await file.read()

        if not contents:

            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty."
            )

        image = Image.open(
            io.BytesIO(contents)
        )


        # ----------------------------------------------------
        # BASIC MRI CHECK
        # ----------------------------------------------------

        if not looks_like_grayscale(image):

            return {
                "success": False,
                "valid_mri": False,
                "prediction": None,
                "confidence": 0,
                "message": (
                    "Invalid image. "
                    "Please upload a brain MRI image."
                )
            }


        # ----------------------------------------------------
        # PREPROCESS
        # ----------------------------------------------------

        image_array = preprocess_image(image)


        # ----------------------------------------------------
        # MODEL PREDICTION
        # ----------------------------------------------------

        predictions = model.predict(
            image_array,
            verbose=0
        )

        probabilities = predictions[0]


        # ----------------------------------------------------
        # FIND PREDICTED CLASS
        # ----------------------------------------------------

        predicted_index = int(
            np.argmax(probabilities)
        )

        confidence = float(
            probabilities[predicted_index]
        )

        predicted_class = CLASS_NAMES[
            predicted_index
        ]


        # ----------------------------------------------------
        # PRINT DEBUG INFORMATION
        # ----------------------------------------------------

        print("\n====================================")
        print("IMAGE:", file.filename)

        print("\nRAW PREDICTIONS:")
        print(probabilities)

        print("\nCLASS PROBABILITIES:")

        for i in range(len(CLASS_NAMES)):

            print(
                f"{CLASS_NAMES[i]}: "
                f"{probabilities[i] * 100:.2f}%"
            )

        print("\nPREDICTED INDEX:", predicted_index)
        print("PREDICTED CLASS:", predicted_class)

        print(
            "CONFIDENCE:",
            confidence * 100
        )

        print("====================================\n")


        # ----------------------------------------------------
        # RETURN PROBABILITIES
        # ----------------------------------------------------

        class_probabilities = {

            CLASS_NAMES[i]:
            round(
                float(probabilities[i]) * 100,
                2
            )

            for i in range(len(CLASS_NAMES))
        }


        # ----------------------------------------------------
        # FINAL RESPONSE
        # ----------------------------------------------------

        return {

            "success": True,

            "valid_mri": True,

            "prediction": predicted_class,

            "confidence": round(
                confidence * 100,
                2
            ),

            "probabilities":
                class_probabilities,

            "message":
                f"Predicted condition: {predicted_class}"
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

        print("\nPrediction Error:")
        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Unable to process image: {str(e)}"
        )