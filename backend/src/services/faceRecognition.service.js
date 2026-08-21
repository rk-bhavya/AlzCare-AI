const FACE_SERVICE_URL = process.env.FACE_RECOGNITION_SERVICE_URL || "http://localhost:8000";
// Normalized SFace embeddings: 0.6 is a conservative Euclidean threshold.
export const FACE_DISTANCE_THRESHOLD = Number(process.env.FACE_RECOGNITION_DISTANCE_THRESHOLD || 1.05);

export class FaceRecognitionServiceError extends Error {
  constructor(message, status = 503) { super(message); this.status = status; }
}

export const generateFaceEmbedding = async (file) => {
  if (!file?.buffer) throw new FaceRecognitionServiceError("A face image is required.", 400);
  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.mimetype || "image/jpeg" }), file.originalname || "face.jpg");
  let response;
  try {
    response = await fetch(`${FACE_SERVICE_URL}/face/embedding`, { method: "POST", body: form, signal: AbortSignal.timeout(20000) });
  } catch {
    throw new FaceRecognitionServiceError("Face recognition service is unavailable. Please try again later.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload.embedding)) {
    throw new FaceRecognitionServiceError(payload.detail || "Unable to generate a face profile from this image.", response.status === 422 ? 400 : 503);
  }
  return { embedding: payload.embedding, model: payload.model || "opencv-sface-128" };
};

export const euclideanDistance = (left, right) => {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || left.length === 0) return Infinity;
  return Math.sqrt(left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0));
};

export const recognizeFace = (queryEmbedding, familyMembers) => {
  const candidates = familyMembers
    .filter((member) => Array.isArray(member.faceEmbedding) && member.faceEmbedding.length === queryEmbedding.length)
    .map((member) => ({ member, distance: euclideanDistance(queryEmbedding, member.faceEmbedding) }))
    .sort((a, b) => a.distance - b.distance);
  const bestMatch = candidates[0] || null;
  return { bestMatch, recognized: Boolean(bestMatch && bestMatch.distance <= FACE_DISTANCE_THRESHOLD) };
};
