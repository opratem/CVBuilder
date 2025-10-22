import type React from 'react';
import type { CV } from '../../types/cv';

interface ModernTemplateProps {
  cv: CV;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects } = cv;

  return (
    <div id="cv-template" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden font-sans text-black">
      {/* Professional Header - Clean and ATS-friendly */}
      <div className="text-center py-8 px-8">
        <h1 className="text-4xl font-bold mb-2 tracking-wide text-black">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <p className="text-lg mb-6 text-black font-medium">
          {personalInfo.jobTitle || 'Your Job Title'}
        </p>

        {/* Contact Information - Clean horizontal layout with separators */}
        <div className="text-sm text-black">
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            personalInfo.linkedin,
            personalInfo.website,
            personalInfo.github
          ].filter(Boolean).join(' | ')}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide border-b border-black pb-1">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-black leading-relaxed text-justify">{personalInfo.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wide border-b border-black pb-1">
              WORK EXPERIENCE
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-6">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-black">{exp.position}</h3>
                  <span className="text-sm text-black font-medium">
                    {exp.startDate ?
                      `${exp.startDate.replace('-', '/')} - ${exp.isCurrentJob ? 'Present' : exp.endDate ? exp.endDate.replace('-', '/') : 'Present'}` :
                      'Date range'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-base font-semibold text-black">{exp.company}</span>
                  {exp.location && <span className="text-sm text-black">{exp.location}</span>}
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside text-black space-y-1 ml-4">
                    {exp.bulletPoints.map((point) => (
                      <li key={point.id} className="leading-relaxed text-sm">{point.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wide border-b border-black pb-1">
              EDUCATION
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-black">
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <span className="text-sm text-black font-medium">
                    {edu.startDate && edu.endDate ?
                      `${edu.startDate.replace('-', '/')} - ${edu.endDate.replace('-', '/')}` :
                      'Date range'}
                  </span>
                </div>
                <p className="text-base font-semibold text-black mb-2">{edu.institution}</p>
                {edu.description && <p className="text-black leading-relaxed text-sm">{edu.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wide border-b border-black pb-1">
              SKILLS
            </h2>
            <div className="text-black text-sm leading-relaxed">
              {skills.map((skill, index) => (
                <span key={skill.id}>
                  {typeof skill.name === 'string' ? skill.name : ''}
                  {index < skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-black mb-4 uppercase tracking-wide border-b border-black pb-1">
              PROJECTS
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-black">{project.name}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline">
                      {project.url}
                    </a>
                  )}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-sm text-black font-semibold mb-2">{project.technologies.join(', ')}</p>
                )}
                <p className="text-black leading-relaxed text-sm">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
