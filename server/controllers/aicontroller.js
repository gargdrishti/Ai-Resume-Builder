import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { analyzeATS, enhanceJobDescription as improveJobDescription, enhanceSummary, extractResumeData } from '../services/localResumeAI.js';

// The routes and response keys are intentionally unchanged so the existing UI keeps working.
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent || !String(userContent).trim()) {
      return res.status(400).json({ message: 'missing required fields' });
    }
    return res.status(200).json({ enhancedContent: enhanceSummary(userContent) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent || !String(userContent).trim()) {
      return res.status(400).json({ message: 'missing required fields' });
    }
    return res.status(200).json({ enhancedContent: improveJobDescription(userContent) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;
    if (!resumeText || !String(resumeText).trim()) {
      return res.status(400).json({ message: 'missing required fields' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isPremium) {
      const existingCount = await Resume.countDocuments({ userId });
      if (existingCount >= 3) {
        return res.status(403).json({ message: 'Free tier limit reached. You can only create or upload up to 3 resumes. Please upgrade to Pro.' });
      }
    }

    const parsedData = extractResumeData(resumeText);
    const newResume = await Resume.create({
      userId,
      title: title || 'Untitled Resume',
      ...parsedData
    });
    return res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const analyzeResumeATS = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isPremium) {
      return res.status(403).json({ message: 'ATS analysis is a Pro feature. Please upgrade to Pro to unlock.' });
    }
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const atsAnalysis = analyzeATS(resume);
    resume.atsAnalysis = atsAnalysis;
    await resume.save();
    return res.status(200).json({ atsAnalysis });
  } catch (error) {
    console.error('Local ATS Analysis Error:', error);
    return res.status(400).json({ message: error.message });
  }
};
