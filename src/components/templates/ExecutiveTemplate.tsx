import type React from 'react';
import type { CV } from '../../types/cv';

interface ExecutiveTemplateProps {
  cv: CV;
}

const ExecutiveTemplate: React.FC<ExecutiveTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects, certifications } = cv;

  return (
    <div id="cv-template" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden font-serif text-gray-900">
      {/* Executive Header with Gold Accent */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-600 px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900">
              {personalInfo.fullName || 'YOUR NAME'}
            </h1>
            <h2 className="text-xl font-semibold text-amber-700 mb-4">
              {personalInfo.jobTitle || 'Executive Position'}
            </h2>
          </div>
          <div className="text-sm text-gray-700 lg:text-right">
            {personalInfo.email && (
              <div className="mb-1">
                <span className="font-medium">Email:</span> {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="mb-1">
                <span className="font-medium">Phone:</span> {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="mb-1">
                <span className="font-medium">Location:</span> {personalInfo.location}
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="mb-1">
                <span className="font-medium">LinkedIn:</span> {personalInfo.linkedin}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Executive Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-amber-600 pb-2">
              EXECUTIVE SUMMARY
            </h2>
            <p className="text-gray-800 leading-relaxed text-justify font-medium">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Professional Experience */}
        {workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-amber-600 pb-2">
              PROFESSIONAL EXPERIENCE
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <h4 className="text-base font-semibold text-amber-700">{exp.company}</h4>
                    {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-700 font-medium">
                    {exp.startDate && (
                      <div>
                        {exp.startDate.replace('-', '/')} - {exp.isCurrentJob ? 'Present' : exp.endDate ? exp.endDate.replace('-', '/') : 'Present'}
                      </div>
                    )}
                  </div>
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside text-gray-800 space-y-2 ml-4">
                    {exp.bulletPoints.map((point) => (
                      <li key={point.id} className="leading-relaxed">{point.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education & Certifications Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-amber-600 pb-2">
                EDUCATION
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <p className="text-base font-semibold text-amber-700">{edu.institution}</p>
                  <p className="text-sm text-gray-600">
                    {edu.startDate && edu.endDate && `${edu.startDate.replace('-', '/')} - ${edu.endDate.replace('-', '/')}`}
                  </p>
                  {edu.description && <p className="text-gray-700 text-sm mt-1">{edu.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-amber-600 pb-2">
                CERTIFICATIONS
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-3">
                  <h3 className="text-base font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-base text-amber-700">{cert.issuer}</p>
                  {cert.date && <p className="text-sm text-gray-600">{cert.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Core Competencies */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-amber-600 pb-2">
              CORE COMPETENCIES
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  <span className="text-gray-800 font-medium">
                    {typeof skill.name === 'string' ? skill.name : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-amber-600 pb-2">
              KEY PROJECTS & ACHIEVEMENTS
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-amber-700 hover:text-amber-900 underline"
                    >
                      View Project
                    </a>
                  )}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-sm text-amber-700 font-semibold mb-2">
                    Technologies: {project.technologies.join(', ')}
                  </p>
                )}
                <p className="text-gray-800 leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
