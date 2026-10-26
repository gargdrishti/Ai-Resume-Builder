import express from 'express';
import { 
  enhanceProfessionalSummary, 
  enhanceJobDescription, 
  uploadResume,
  analyzeResumeATS
} from '../controllers/aicontroller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// AI helper routes (all protected under authentication)
router.post('/enhance-summary', protect, enhanceProfessionalSummary);
router.post('/enhance-job', protect, enhanceJobDescription);
router.post('/upload-resume', protect, uploadResume);
router.post('/analyze-ats/:resumeId', protect, analyzeResumeATS);

export default router;
