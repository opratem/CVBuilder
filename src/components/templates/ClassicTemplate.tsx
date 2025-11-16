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
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '13px',
        lineHeight: '1.4',
        color: '#000000'
      }}
    >
      {/* Header Section - Left aligned to match PDF */}
      <div className="px-12 py-10">
        <div className="text-left mb-6">
          <h1
            className="font-bold text-black mb-2"
            style={{
              fontSize: '32px',
              lineHeight: '1.1',
              letterSpacing: '-0.5px',
              fontWeight: '700',
              margin: '0 0 8px 0'
            }}
          >
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p
            className="text-black font-medium"
            style={{
              fontSize: '16px',
              lineHeight: '1.2',
              fontWeight: '500',
              margin: '0 0 16px 0'
            }}
          >
            {personalInfo.jobTitle || 'Your Job Title'}
          </p>
        </div>

        {/* Contact Information - Two Column Layout to match PDF */}
        <div className="py-4 my-6">
          <div className="grid grid-cols-2 gap-4 text-black text-sm">
            <div className="space-y-1">
              {personalInfo.email && <div>Email: {personalInfo.email}</div>}
              {personalInfo.phone && <div>Phone: {personalInfo.phone}</div>}
              {personalInfo.website && <div>Website: {personalInfo.website}</div>}
            </div>
            <div className="space-y-1">
              {personalInfo.location && <div>Location: {personalInfo.location}</div>}
              {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin}</div>}
              {personalInfo.github && <div>GitHub: {personalInfo.github}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-12 pb-12 space-y-8">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <div>
            <h2
              className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px',
                borderBottomWidth: '2px',
                borderBottomColor: '#000000',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              PROFESSIONAL SUMMARY
            </h2>
            <p
              className="text-black leading-relaxed"
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                textAlign: 'justify',
                color: '#333333'
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
              className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px',
                borderBottomWidth: '2px',
                borderBottomColor: '#000000',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              WORK EXPERIENCE
            </h2>
            {workExperience.map((exp, index) => (
              <div key={exp.id} className={`${index > 0 ? 'mt-6' : ''}`}>
                <div className="mb-2">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#000000'
                    }}
                  >
                    {exp.position}
                  </h3>
                  <div
                    className="text-black font-medium text-right mt-1"
                    style={{
                      fontSize: '13px',
                      fontWeight: '400',
                      color: '#000000'
                    }}
                  >
                    {exp.startDate ?
                      `${formatDate(exp.startDate)} - ${exp.isCurrentJob ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'Present'}` :
                      'Date range'}
                  </div>
                </div>
                <div className="mb-3">
                  <span
                    className="font-medium text-black italic"
                    style={{
                      fontSize: '14px',
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
                    className="list-disc text-black space-y-2 ml-6"
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: '#333333',
                      paddingLeft: '20px',
                      marginBottom: '16px'
                    }}
                  >
                    {exp.bulletPoints.map((point) => (
                      <li
                        key={point.id}
                        className="text-justify"
                        style={{
                          marginBottom: '6px',
                          lineHeight: '1.5'
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
              className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px',
                borderBottomWidth: '2px',
                borderBottomColor: '#000000',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              EDUCATION
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#000000'
                    }}
                  >
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <span
                    className="text-black font-medium"
                    style={{
                      fontSize: '13px',
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
                  className="font-semibold text-black mb-2"
                  style={{
                    fontSize: '14px',
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
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: '#333333'
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
              className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px',
                borderBottomWidth: '2px',
                borderBottomColor: '#000000',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              SKILLS
            </h2>
            <div
              className="text-black"
              style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#333333'
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
              className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px',
                borderBottomWidth: '2px',
                borderBottomColor: '#000000',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              PROJECTS
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '15px',
                      fontWeight: '600',
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
                    >
                      {project.url}
                    </a>
                  )}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <p
                    className="text-black mb-2"
                    style={{
                      fontSize: '12px',
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
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#333333'
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
              className="font-bold text-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px',
                borderBottomWidth: '2px',
                borderBottomColor: '#000000',
                paddingBottom: '4px',
                marginBottom: '16px'
              }}
            >
              CERTIFICATIONS
            </h2>
            {certifications.map((cert) => (
              <div key={cert.id} className="mb-3">
                <div className="flex justify-between items-start">
                  <h3
                    className="font-bold text-black"
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000'
                    }}
                  >
                    {cert.name}
                  </h3>
                  <span
                    className="text-black"
                    style={{
                      fontSize: '13px',
                      color: '#000000'
                    }}
                  >
                    {cert.date ? formatDate(cert.date) : ''}
                  </span>
                </div>
                <p
                  className="text-gray-700"
                  style={{
                    fontSize: '13px',
                    color: '#333333'
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
