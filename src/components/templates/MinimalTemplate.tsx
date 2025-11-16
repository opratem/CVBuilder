import React from 'react';
import type { CV } from '../../types/cv';

interface MinimalTemplateProps {
  cv: CV;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects } = cv;

  return (
    <div id="cv-template" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1 text-gray-900">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-lg text-gray-600 mb-3">
          {personalInfo.jobTitle || 'Your Job Title'}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 my-4"></div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <p className="text-gray-700">{personalInfo.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            EXPERIENCE
          </h2>
          {workExperience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-gray-900">{exp.position}</h3>
                <span className="text-sm text-gray-600">
                  {exp.startDate ?
                    `${exp.startDate.replace('-', '/')} - ${exp.isCurrentJob ? 'Present' : exp.endDate ? exp.endDate.replace('-', '/') : 'Present'}` :
                    'Date range'}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-gray-700">{exp.company}</span>
                {exp.location && <span className="text-sm text-gray-600">{exp.location}</span>}
              </div>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {exp.bulletPoints.map((point) => (
                  <li key={point.id}>{point.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            EDUCATION
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-gray-900">
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </h3>
                <span className="text-sm text-gray-600">
                  {edu.startDate && edu.endDate ?
                    `${edu.startDate.replace('-', '/')} - ${edu.endDate.replace('-', '/')}` :
                    'Date range'}
                </span>
              </div>
              <p className="text-gray-700 mb-1">{edu.institution}</p>
              {edu.description && <p className="text-gray-700 text-sm">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            SKILLS
          </h2>
          <p className="text-gray-700">
            {skills.map((skill, index) => (
              <React.Fragment key={skill.id}>
                {skill.name}{index < skills.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </p>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
            PROJECTS
          </h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    {project.url}
                  </a>
                )}
              </div>
              {project.technologies && project.technologies.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  {Array.isArray(project.technologies)
                    ? project.technologies.join(', ')
                    : project.technologies}
                </p>
              )}
              <p className="text-gray-700 text-sm">{project.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinimalTemplate;
