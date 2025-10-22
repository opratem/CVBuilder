import type React from 'react';
import type { CV } from '../../types/cv';

interface AcademicTemplateProps {
  cv: CV;
}

const AcademicTemplate: React.FC<AcademicTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects, certifications, extracurricular } = cv;

  return (
    <div id="cv-template" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden font-serif text-gray-900">
      {/* Academic Header */}
      <div className="text-center py-8 px-8 border-b-2 border-green-600">
        <h1 className="text-4xl font-bold mb-3 text-gray-900">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <h2 className="text-xl text-green-700 mb-4 font-medium">
          {personalInfo.jobTitle || 'Academic Researcher'}
        </h2>

        {/* Contact Information in Academic Style */}
        <div className="text-sm text-gray-700 space-y-1">
          {personalInfo.email && (
            <div>Email: {personalInfo.email}</div>
          )}
          {personalInfo.phone && (
            <div>Phone: {personalInfo.phone}</div>
          )}
          {personalInfo.location && (
            <div>Address: {personalInfo.location}</div>
          )}
          {personalInfo.linkedin && (
            <div>LinkedIn: {personalInfo.linkedin}</div>
          )}
          {personalInfo.website && (
            <div>Website: {personalInfo.website}</div>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Research Interests / Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
              RESEARCH INTERESTS
            </h2>
            <p className="text-gray-800 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Education - Most Important for Academic CVs */}
        {education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
              EDUCATION
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </h3>
                    <p className="text-base font-semibold text-green-700">{edu.institution}</p>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {edu.startDate && edu.endDate && (
                      <div>
                        {edu.startDate.replace('-', '/')} - {edu.endDate.replace('-', '/')}
                      </div>
                    )}
                  </div>
                </div>
                {edu.description && (
                  <p className="text-gray-700 leading-relaxed italic mt-2">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Academic Experience */}
        {workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
              ACADEMIC & PROFESSIONAL EXPERIENCE
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <h4 className="text-base font-semibold text-green-700">{exp.company}</h4>
                    {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {exp.startDate && (
                      <div>
                        {exp.startDate.replace('-', '/')} - {exp.isCurrentJob ? 'Present' : exp.endDate ? exp.endDate.replace('-', '/') : 'Present'}
                      </div>
                    )}
                  </div>
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul className="list-disc list-outside text-gray-800 space-y-2 ml-6">
                    {exp.bulletPoints.map((point) => (
                      <li key={point.id} className="leading-relaxed">{point.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Research Projects / Publications */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
              RESEARCH PROJECTS & PUBLICATIONS
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-900 underline font-medium"
                    >
                      View Publication
                    </a>
                  )}
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    <span className="font-semibold">Methods & Tools:</span> {project.technologies.join(', ')}
                  </p>
                )}
                <p className="text-gray-800 leading-relaxed text-justify">{project.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills & Competencies */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
              SKILLS & COMPETENCIES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div key={skill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="font-medium text-gray-900">
                    {typeof skill.name === 'string' ? skill.name : ''}
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(skill.level || 3) * 20}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {skill.level === 1 ? 'Basic' :
                       skill.level === 2 ? 'Intermediate' :
                       skill.level === 3 ? 'Advanced' :
                       skill.level === 4 ? 'Expert' :
                       'Proficient'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Awards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
                CERTIFICATIONS & LICENSES
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <h3 className="text-base font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-base text-green-700 font-medium">{cert.issuer}</p>
                  {cert.date && <p className="text-sm text-gray-600">{cert.date}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Professional Activities */}
          {extracurricular.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-green-600 pb-2">
                PROFESSIONAL ACTIVITIES
              </h2>
              {extracurricular.map((activity) => (
                <div key={activity.id} className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <h3 className="text-base font-bold text-gray-900">{activity.activity}</h3>
                  {activity.organization && (
                    <p className="text-base text-green-700 font-medium">{activity.organization}</p>
                  )}
                  {activity.startDate && (
                    <p className="text-sm text-gray-600">
                      {activity.startDate.replace('-', '/')} - {activity.isOngoing ? 'Present' : activity.endDate ? activity.endDate.replace('-', '/') : 'Present'}
                    </p>
                  )}
                  {activity.description && (
                    <p className="text-gray-700 text-sm mt-2">{activity.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* References Statement */}
        <div className="text-center py-4 border-t border-gray-300">
          <p className="text-gray-600 italic">
            References available upon request
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademicTemplate;
