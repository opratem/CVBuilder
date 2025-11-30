import type React from 'react';
import type { CV } from '../../types/cv';

interface ClassicTemplateProps {
  cv: CV;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects, certifications } = cv;

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    if (day) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[Number.parseInt(month) - 1]} ${year}`;
    }
    return `${month}/${year}`;
  };

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
      {/* Header Section - Centered to match PDF */}
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
              WORK EXPERIENCE
            </h2>
            {workExperience.map((exp, index) => (
              <div key={exp.id} className={`${index > 0 ? 'mt-4' : ''}`}>
                <div className="mb-1">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '11pt',
                      fontWeight: '700',
                      color: '#000000'
                    }}
                  >
                    {exp.position}
                  </h3>
                  <div
                    className="text-black font-medium text-right mt-0"
                    style={{
                      fontSize: '9pt',
                      fontWeight: '400',
                      color: '#000000'
                    }}
                  >
                    {exp.startDate ?
                      `${formatDate(exp.startDate)} - ${exp.isCurrentJob ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'Present'}` :
                      'Date range'}
                  </div>
                </div>
                <div className="mb-2">
                  <span
                    className="font-medium text-black italic"
                    style={{
                      fontSize: '10pt',
                      fontWeight: '400',
                      color: '#000000',
                      fontStyle: 'italic'
                    }}
                  >
                    {exp.company}{exp.location && ` | ${exp.location}`}
                  </span>
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul
                    className="list-disc text-black space-y-1 ml-5"
                    style={{
                      fontSize: '10pt',
                      lineHeight: '1.4',
                      color: '#000000',
                      paddingLeft: '15px',
                      marginBottom: '12px'
                    }}
                  >
                    {exp.bulletPoints.map((point) => (
                      <li
                        key={point.id}
                        className="text-justify"
                        style={{
                          marginBottom: '4px',
                          lineHeight: '1.4'
                        }}
                      >
                        {point.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
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
              EDUCATION
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '11pt',
                      fontWeight: '700',
                      color: '#000000'
                    }}
                  >
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <span
                    className="text-black font-medium"
                    style={{
                      fontSize: '9pt',
                      fontWeight: '400',
                      color: '#000000'
                    }}
                  >
                    {edu.startDate && edu.endDate ?
                      `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}` :
                      'Date range'}
                  </span>
                </div>
                <p
                  className="font-semibold text-black mb-1"
                  style={{
                    fontSize: '10pt',
                    fontWeight: '500',
                    color: '#000000'
                  }}
                >
                  {edu.institution}
                </p>
                {edu.description && (
                  <p
                    className="text-gray-700"
                    style={{
                      fontSize: '10pt',
                      lineHeight: '1.4',
                      color: '#000000'
                    }}
                  >
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
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
              SKILLS
            </h2>
            <div
              className="text-black"
              style={{
                fontSize: '10pt',
                lineHeight: '1.4',
                color: '#000000'
              }}
            >
              {skills.map((skill, index) => (
                <span key={skill.id}>
                  {skill.name}{index < skills.length - 1 ? ' • ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
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
              PROJECTS
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '11pt',
                      fontWeight: '700',
                      color: '#000000'
                    }}
                  >
                    {project.name}
                  </h3>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      style={{ fontSize: '9pt' }}
                    >
                      {project.url}
                    </a>
                  )}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <p
                    className="text-black mb-1"
                    style={{
                      fontSize: '9pt',
                      color: '#000000'
                    }}
                  >
                    {Array.isArray(project.technologies)
                      ? project.technologies.join(', ')
                      : project.technologies}
                  </p>
                )}
                <p
                  className="text-gray-700"
                  style={{
                    fontSize: '10pt',
                    lineHeight: '1.4',
                    color: '#000000'
                  }}
                >
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
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
              CERTIFICATIONS
            </h2>
            {certifications.map((cert) => (
              <div key={cert.id} className="mb-2">
                <div className="flex justify-between items-start">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '11pt',
                      fontWeight: '700',
                      color: '#000000'
                    }}
                  >
                    {cert.name}
                  </h3>
                  <span
                    className="text-black"
                    style={{
                      fontSize: '9pt',
                      color: '#000000'
                    }}
                  >
                    {cert.date ? formatDate(cert.date) : ''}
                  </span>
                </div>
                <p
                  className="text-gray-700"
                  style={{
                    fontSize: '10pt',
                    color: '#000000'
                  }}
                >
                  {cert.issuer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
