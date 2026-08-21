import mongoose from "mongoose";

const faceRecognitionEventSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: "FamilyMember", default: null },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientDevice", required: true },
  recognized: { type: Boolean, required: true, index: true },
  distance: { type: Number, default: null },
}, { timestamps: true });
faceRecognitionEventSchema.index({ patientId: 1, createdAt: -1 });
export default mongoose.model("FaceRecognitionEvent", faceRecognitionEventSchema);
