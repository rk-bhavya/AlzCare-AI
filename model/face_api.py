from fastapi import FastAPI, File, UploadFile, HTTPException
from face_recognition_service import generate_embedding, FaceValidationError

app = FastAPI(title="AlzCare Face Recognition Service")


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "AlzCare Face Recognition"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "face-recognition"
    }


@app.post("/embedding")
async def create_embedding(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        embedding = generate_embedding(contents)

        return {
            "success": True,
            "embedding": embedding
        }

    except FaceValidationError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Face recognition service failed."
        ) from exc