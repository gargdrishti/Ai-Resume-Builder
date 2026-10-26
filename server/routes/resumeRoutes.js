import express from 'express';
import { 
  createResume, 
  deleteResume, 
  getResumeById, 
  getPublicResumeById, 
  updateResume,
  exportResumeToDocx,
  sendResumeEmail
} from '../controllers/resumeController.js';
import protect from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public route to retrieve a public resume by ID or Slug
router.get('/public/:resumeId', getPublicResumeById);

// Protected CRUD routes
router.post('/', protect, createResume);
router.delete('/:resumeId', protect, deleteResume);
router.get('/:resumeId', protect, getResumeById);
router.put('/', protect, upload.single('image'), updateResume);
router.get('/:resumeId/export/docx', protect, exportResumeToDocx);
router.post('/:resumeId/send-email', protect, sendResumeEmail);

export default router;
