import type React from 'react';
import type { CV } from '../../types/cv';

interface CreativeTemplateProps {
  cv: CV;
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects, certifications } = cv;

  return (
    <div id="cv-template" className="bg-white w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden font-sans text-gray-900">
      {/* Creative Header with Gradient */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 text-white px-8 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-3 tracking-wide">
            {personalInfo.fullName || 'YOUR NAME'}
          </h1>
          <h2 className="text-2xl font-light mb-6 text-purple-100">
            {personalInfo.jobTitle || 'Creative Professional'}
          </h2>

          {/* Contact Info as Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {personalInfo.email && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                {personalInfo.location}
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                LinkedIn
              </div>
            )}
            {personalInfo.website && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                Portfolio
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Creative Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              About Me
            </h2>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
              <p className="text-gray-800 leading-relaxed text-lg font-medium italic">
                {personalInfo.summary}
              </p>
            </div>
          </div>
        )}

        {/* Portfolio Projects - Featured */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Featured Projects
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                      >
                        View
                      </a>
                    )}
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(Array.isArray(project.technologies) ? project.technologies : [project.technologies]).map((tech, index) => (
                        <span key={index} className="bg-white/80 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Professional Experience
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-6 relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded"></div>
                <div className="ml-6 bg-gray-50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{exp.position}</h3>
                      <h4 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {exp.company}
                      </h4>
                      {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                    </div>
                    <div className="text-sm text-gray-700 font-medium mt-2 md:mt-0">
                      {exp.startDate && (
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                          {exp.startDate.replace('-', '/')} - {exp.isCurrentJob ? 'Present' : exp.endDate ? exp.endDate.replace('-', '/') : 'Present'}
                        </div>
                      )}
                    </div>
                  </div>
                  {exp.bulletPoints.length > 0 && (
                    <ul className="space-y-2">
                      {exp.bulletPoints.map((point) => (
                        <li key={point.id} className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-800 leading-relaxed">{point.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills as Visual Elements */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div key={skill.id} className="relative group">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 rounded-full">
                    <div className="bg-white rounded-full px-4 py-2 group-hover:bg-purple-50 transition-colors">
                      <span className="text-gray-800 font-medium">
                        {typeof skill.name === 'string' ? skill.name : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certifications */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <p className="text-base font-semibold text-purple-700">{edu.institution}</p>
                  <p className="text-sm text-gray-600">
                    {edu.startDate && edu.endDate && `${edu.startDate.replace('-', '/')} - ${edu.endDate.replace('-', '/')}`}
                  </p>
                  {edu.description && <p className="text-gray-700 text-sm mt-2">{edu.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Certifications
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h3 className="text-base font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-base text-purple-700">{cert.issuer}</p>
                  {cert.date && <p className="text-sm text-gray-600">{cert.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate;
