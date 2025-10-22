import { useMemo } from 'react';
import { useCVStore } from '../store/cvStore';

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export const useProgressTracking = (): ProgressStep[] => {
  const { cv } = useCVStore();

  return useMemo(() => {
    const steps: ProgressStep[] = [
      {
        id: 'personal',
        label: 'Personal Information',
        completed: !!(cv.personalInfo.fullName && cv.personalInfo.email && cv.personalInfo.jobTitle),
        required: true
      },
      {
        id: 'experience',
        label: 'Work Experience',
        completed: cv.workExperience.length > 0 && cv.workExperience.some(exp => exp.company && exp.position),
        required: true
      },
      {
        id: 'education',
        label: 'Education',
        completed: cv.education.length > 0 && cv.education.some(edu => edu.institution && edu.degree),
        required: true
      },
      {
        id: 'skills',
        label: 'Skills',
        completed: cv.skills.length > 0 && cv.skills.some(skill => skill.name.trim() !== ''),
        required: true
      },
      {
        id: 'projects',
        label: 'Projects',
        completed: cv.projects.length > 0 && cv.projects.some(project => project.name && project.description),
        required: false
      },
      {
        id: 'certifications',
        label: 'Certifications',
        completed: cv.certifications.length > 0 && cv.certifications.some(cert => cert.name && cert.organization),
        required: false
      },
      {
        id: 'extracurricular',
        label: 'Extracurricular',
        completed: cv.extracurricular.length > 0 && cv.extracurricular.some(ext => ext.title && ext.description),
        required: false
      }
    ];

    return steps;
  }, [cv]);
};
