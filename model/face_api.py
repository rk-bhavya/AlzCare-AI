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
        "status": "ok"
    }


@app.post("/embedding")
async def create_embedding(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Empty image file."
            )

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

    except HTTPException:
        raise

    except Exception as exc:
        print("Face embedding error:", exc)
        raise HTTPException(
            status_code=500,
            detail="Face recognition service failed."
        )
