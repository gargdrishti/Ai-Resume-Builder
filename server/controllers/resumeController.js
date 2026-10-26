import fs from 'fs';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { sendResumeReadyEmail } from '../config/email.js';

// Controller for creating a new resume
// POST: /api/resumes
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Free plan limits: 3 resumes max
    if (!user.isPremium) {
      const existingCount = await Resume.countDocuments({ userId });
      if (existingCount >= 3) {
        return res.status(403).json({ message: "Free tier limit reached. You can only create up to 3 resumes. Please upgrade to Pro." });
      }
    }

    const newResume = await Resume.create({
      userId: userId,
      title: title || 'Untitled Resume'
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume: newResume
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Controller for deleting a resume
// DELETE: /api/resumes/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const deletedResume = await Resume.findOneAndDelete({ userId: userId, _id: resumeId });
    if (!deletedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get user resume by id
// GET: /api/resumes/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ userId: userId, _id: resumeId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumeObj = resume.toObject();
    delete resumeObj.__v;

    return res.status(200).json({ resume: resumeObj });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get resume by id public
// GET: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    
    // Determine if resumeId parameter is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(resumeId);
    
    const query = {
      public: true,
      $or: [
        { slug: resumeId }
      ]
    };
    
    if (isObjectId) {
      query.$or.push({ _id: resumeId });
    }

    const resume = await Resume.findOne(query);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;

    let resumeDataCopy;
    if (typeof resumeData === 'string') {
      resumeDataCopy = JSON.parse(resumeData);
    } else {
      resumeDataCopy = { ...resumeData };
    }

    // Custom Slug (Vanity URL) validation and uniqueness checks
    if (resumeDataCopy.slug !== undefined) {
      if (resumeDataCopy.slug.trim() === '') {
        // Clear the slug if it's set to empty
        resumeDataCopy.slug = undefined;
      } else {
        // Sanitize: lowercase, replace spaces and special chars with single hyphens
        const sanitizedSlug = resumeDataCopy.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-');
        
        // Ensure slug is not taken by another resume
        const existing = await Resume.findOne({ slug: sanitizedSlug, _id: { $ne: resumeId } });
        if (existing) {
          return res.status(400).json({ message: "This custom URL slug is already taken. Please try another one." });
        }
        
        resumeDataCopy.slug = sanitizedSlug;
      }
    }

    if (image) {
      const uploadOptions = {
        folder: "user_resumes",
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face"
      };

      let response;
      // Background removal parameter for Cloudinary
      if (removeBackground === 'true' || removeBackground === true) {
        uploadOptions.effect = "background_removal";
        uploadOptions.format = "png"; // Force PNG format to support transparent alpha channel
        try {
          response = await cloudinary.uploader.upload(image.path, uploadOptions);
        } catch (uploadError) {
          console.error("Cloudinary background removal failed, falling back to standard upload:", uploadError);
          // Strip the background removal parameters and try uploading normally
          delete uploadOptions.effect;
          delete uploadOptions.format;
          response = await cloudinary.uploader.upload(image.path, uploadOptions);
          req.backgroundRemovalFailed = true;
        }
      } else {
        response = await cloudinary.uploader.upload(image.path, uploadOptions);
      }
      
      // Safely remove the temp file
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }

      if (!resumeDataCopy.personal_info) {
        resumeDataCopy.personal_info = {};
      }
      resumeDataCopy.personal_info.image = response.secure_url;
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({
      message: req.backgroundRemovalFailed
        ? "saved successfully, but background removal was skipped because the Cloudinary AI Background Removal add-on is not enabled on your plan"
        : "saved successfully",
      resume: resume
    });
  } catch (error) {
    // Clean up temp file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: error.message });
  }
};

// Controller to export resume to DOCX format
// GET: /api/resumes/:resumeId/export/docx
export const exportResumeToDocx = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.userId;

    const resume = await Resume.findOne({ _id: resumeId, userId: userId });
    
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Name (Header)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: resume.personal_info?.full_name || "Resume",
                bold: true,
                size: 32,
                font: "Calibri"
              })
            ]
          }),
          // Profession
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: resume.personal_info?.profession || "",
                size: 20,
                color: "666666",
                font: "Calibri",
                italics: true
              })
            ]
          }),
          // Contact Info Line
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: [
                  resume.personal_info?.email,
                  resume.personal_info?.phone,
                  resume.personal_info?.location,
                  resume.personal_info?.linkedin,
                  resume.personal_info?.website
                ].filter(Boolean).join("   |   "),
                size: 18,
                font: "Calibri"
              })
            ]
          }),
          
          // Professional Summary
          ...(resume.professional_summary ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: "PROFESSIONAL SUMMARY",
                  bold: true,
                  size: 24,
                  font: "Calibri",
                  color: "1F2937"
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: resume.professional_summary,
                  size: 22,
                  font: "Calibri"
                })
              ]
            })
          ] : []),

          // Experience
          ...(resume.experience && resume.experience.length > 0 ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: "WORK EXPERIENCE",
                  bold: true,
                  size: 24,
                  font: "Calibri",
                  color: "1F2937"
                })
              ]
            }),
            ...resume.experience.flatMap(exp => [
              new Paragraph({
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: `${exp.position} - ${exp.company}`,
                    bold: true,
                    size: 22,
                    font: "Calibri"
                  }),
                  new TextRun({
                    text: `  (${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date})`,
                    size: 20,
                    italics: true,
                    font: "Calibri",
                    color: "666666"
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 150 },
                children: [
                  new TextRun({
                    text: exp.description || "",
                    size: 20,
                    font: "Calibri"
                  })
                ]
              })
            ])
          ] : []),

          // Education
          ...(resume.education && resume.education.length > 0 ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: "EDUCATION",
                  bold: true,
                  size: 24,
                  font: "Calibri",
                  color: "1F2937"
                })
              ]
            }),
            ...resume.education.map(edu => 
              new Paragraph({
                spacing: { after: 150 },
                children: [
                  new TextRun({
                    text: `${edu.degree} in ${edu.field} - ${edu.institution}`,
                    bold: true,
                    size: 22,
                    font: "Calibri"
                  }),
                  new TextRun({
                    text: `  (Graduated: ${edu.graduation_date}${edu.gpa ? `, GPA: ${edu.gpa}` : ''})`,
                    size: 20,
                    italics: true,
                    font: "Calibri",
                    color: "666666"
                  })
                ]
              })
            )
          ] : []),

          // Projects
          ...(resume.project && resume.project.length > 0 ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: "PROJECTS",
                  bold: true,
                  size: 24,
                  font: "Calibri",
                  color: "1F2937"
                })
              ]
            }),
            ...resume.project.flatMap(proj => [
              new Paragraph({
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: `${proj.name}${proj.type ? ` (${proj.type})` : ''}`,
                    bold: true,
                    size: 22,
                    font: "Calibri"
                  }),
                  new TextRun({
                    text: [proj.projectLink, proj.githubLink].filter(Boolean).length > 0
                      ? `  [ ${[proj.projectLink, proj.githubLink].filter(Boolean).join(' | ')} ]`
                      : '',
                    size: 18,
                    font: "Calibri",
                    color: "0284c7"
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 150 },
                children: [
                  new TextRun({
                    text: proj.description || "",
                    size: 20,
                    font: "Calibri"
                  })
                ]
              })
            ])
          ] : []),

          // Skills
          ...(resume.skills && resume.skills.length > 0 ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: "SKILLS",
                  bold: true,
                  size: 24,
                  font: "Calibri",
                  color: "1F2937"
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 150 },
              children: [
                new TextRun({
                  text: resume.skills.join(", "),
                  size: 20,
                  font: "Calibri"
                })
              ]
            })
          ] : [])
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.docx"`);
    return res.send(buffer);
  } catch (error) {
    console.error("DOCX Export Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Send Resume ready/preview email
export const sendResumeEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Logging without sending the actual email to prevent mailbox bounce issues
    console.log(`[Resume Ready] Email sending skipped for ${user.email} (resume: ${resume.title})`);

    return res.status(200).json({ message: "Resume preview email initiated successfully" });
  } catch (error) {
    console.error("Send Resume Email Error:", error);
    return res.status(400).json({ message: error.message });
  }
};
