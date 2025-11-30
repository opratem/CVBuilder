import type React from 'react';
import type { CV } from '../../types/cv';

interface ModernTemplateProps {
  cv: CV;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects } = cv;

  return (
    <div
      id="cv-template"
      className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden"
      style={{
        fontFamily: 'Georgia, "Times New Roman", Times, serif',
        fontSize: '10.5pt',
        lineHeight: '1.2',
        color: '#000000'
      }}
    >
      {/* Professional Header - Centered to match PDF */}
      <div className="px-12 py-8">
        <div className="text-center mb-3">
          <h1
            className="font-bold text-black mb-1"
            style={{
              fontSize: '20pt',
              lineHeight: '1.1',
              letterSpacing: '0',
              fontWeight: '700',
              margin: '0 0 4px 0'
            }}
          >
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p
            className="text-black"
            style={{
              fontSize: '12pt',
              lineHeight: '1.2',
              fontWeight: '400',
              margin: '0 0 8px 0'
            }}
          >
            {personalInfo.jobTitle || 'Your Job Title'}
          </p>
        </div>

        {/* Contact Information - Two lines to match PDF */}
        <div className="text-center mb-4">
          <p
            className="text-black"
            style={{
              fontSize: '10pt',
              lineHeight: '1.4',
              margin: '0 0 2px 0'
            }}
          >
            {personalInfo.email && personalInfo.phone && (
              <>{personalInfo.email} | {personalInfo.phone}</>
            )}
            {personalInfo.email && !personalInfo.phone && personalInfo.email}
            {!personalInfo.email && personalInfo.phone && personalInfo.phone}
          </p>
          {(personalInfo.github || personalInfo.linkedin) && (
            <p
              className="text-black"
              style={{
                fontSize: '10pt',
                lineHeight: '1.4',
                margin: '0',
                color: '#0000EE'
              }}
            >
              {personalInfo.github && personalInfo.github.replace('https://', '')}
              {personalInfo.github && personalInfo.linkedin && ' | '}
              {personalInfo.linkedin && personalInfo.linkedin.replace('https://', '')}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-12 pb-10 space-y-6">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <div>
            <h2
              className="font-bold text-black uppercase tracking-wider mb-3 border-b-2 border-black pb-1"
              style={{
                fontSize: '12pt',
                fontWeight: '700',
                letterSpacing: '0.5px',
                borderBottomWidth: '1px',
                borderBottomColor: '#000000',
                paddingBottom: '2px',
                marginBottom: '8px'
              }}
            >
              PROFESSIONAL SUMMARY
            </h2>
            <p
              className="text-black leading-relaxed"
              style={{
                fontSize: '10pt',
                lineHeight: '1.4',
                textAlign: 'justify',
                color: '#000000'
              }}
            >
              {personalInfo.summary}
            </p>
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
                  <p className="text-sm text-black font-semibold mb-2">
                    {Array.isArray(project.technologies)
                      ? project.technologies.join(', ')
                      : project.technologies}
                  </p>
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
