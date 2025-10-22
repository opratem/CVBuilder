import type React from 'react';
import type { CV } from '../../types/cv';

interface TechTemplateProps {
  cv: CV;
}

const TechTemplate: React.FC<TechTemplateProps> = ({ cv }) => {
  const { personalInfo, education, workExperience, skills, projects, certifications } = cv;

  // Group skills by category for better tech presentation
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div id="cv-template" className="bg-slate-50 w-full max-w-[21cm] min-h-[29.7cm] mx-auto overflow-hidden font-mono text-gray-900">
      {/* Tech Header */}
      <div className="bg-gray-900 text-green-400 px-8 py-6">
        <div className="border border-green-400 p-6 rounded">
          <div className="flex items-center mb-4">
            <span className="text-green-500 mr-2">$</span>
            <span className="text-white">whoami</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            {personalInfo.fullName || 'developer@localhost'}
          </h1>
          <h2 className="text-lg text-green-300 mb-4">
            // {personalInfo.jobTitle || 'Full Stack Developer'}
          </h2>

          {/* Contact as code block */}
          <div className="bg-gray-800 rounded p-4 border border-green-400/30">
            <div className="text-sm">
              <div className="text-blue-400">const <span className="text-white">contact</span> = &#123;</div>
              {personalInfo.email && (
                <div className="ml-4 text-green-300">email: <span className="text-yellow-300">"{personalInfo.email}"</span>,</div>
              )}
              {personalInfo.phone && (
                <div className="ml-4 text-green-300">phone: <span className="text-yellow-300">"{personalInfo.phone}"</span>,</div>
              )}
              {personalInfo.location && (
                <div className="ml-4 text-green-300">location: <span className="text-yellow-300">"{personalInfo.location}"</span>,</div>
              )}
              {personalInfo.github && (
                <div className="ml-4 text-green-300">github: <span className="text-yellow-300">"{personalInfo.github}"</span>,</div>
              )}
              {personalInfo.linkedin && (
                <div className="ml-4 text-green-300">linkedin: <span className="text-yellow-300">"{personalInfo.linkedin}"</span>,</div>
              )}
              <div className="text-blue-400">&#125;;</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 bg-white">
        {/* Code Comment Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-green-600 mr-2">//</span>
              About
            </h2>
            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-800 leading-relaxed font-sans">
                {personalInfo.summary}
              </p>
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {Object.keys(groupedSkills).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-green-600 mr-2">//</span>
              Tech Stack
            </h2>
            <div className="bg-gray-900 rounded-lg p-6 text-green-400 text-sm">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="text-blue-400 font-bold mb-2">// {category}</div>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="bg-gray-800 border border-green-400/30 rounded px-3 py-1 text-green-300">
                        {typeof skill.name === 'string' ? skill.name : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects as Code Blocks */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-green-600 mr-2">//</span>
              Projects
            </h2>
            {projects.map((project) => (
              <div key={project.id} className="mb-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
                  <span className="font-bold">{project.name}</span>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs transition-colors"
                    >
                      View Code
                    </a>
                  )}
                </div>
                <div className="p-4">
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-3">
                      <span className="text-gray-600 text-sm">Stack: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed font-sans">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-green-600 mr-2">//</span>
              Professional Experience
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-6 border-l-4 border-blue-500 pl-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-sans">{exp.position}</h3>
                    <h4 className="text-base font-semibold text-blue-600 font-sans">{exp.company}</h4>
                    {exp.location && <p className="text-sm text-gray-600 font-sans">{exp.location}</p>}
                  </div>
                  <div className="text-sm text-gray-700 mt-2 md:mt-0">
                    {exp.startDate && (
                      <div className="bg-gray-100 px-3 py-1 rounded font-mono">
                        {exp.startDate.replace('-', '/')} - {exp.isCurrentJob ? 'Present' : exp.endDate ? exp.endDate.replace('-', '/') : 'Present'}
                      </div>
                    )}
                  </div>
                </div>
                {exp.bulletPoints.length > 0 && (
                  <ul className="space-y-2 mt-3">
                    {exp.bulletPoints.map((point) => (
                      <li key={point.id} className="flex items-start font-sans">
                        <span className="text-green-600 mr-2 font-bold">{'>'}</span>
                        <span className="text-gray-800 leading-relaxed">{point.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education & Certifications Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 font-sans">
                    {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <p className="text-base font-semibold text-blue-600 font-sans">{edu.institution}</p>
                  <p className="text-sm text-gray-600 font-mono">
                    {edu.startDate && edu.endDate && `${edu.startDate.replace('-', '/')} - ${edu.endDate.replace('-', '/')}`}
                  </p>
                  {edu.description && <p className="text-gray-700 text-sm mt-2 font-sans">{edu.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-green-600 mr-2">//</span>
                Certifications
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 font-sans">{cert.name}</h3>
                  <p className="text-base text-blue-600 font-sans">{cert.issuer}</p>
                  {cert.date && <p className="text-sm text-gray-600 font-mono">{cert.date}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer as code comment */}
      <div className="bg-gray-900 text-green-400 px-8 py-4 text-sm">
        <div className="text-center">
          <span className="text-gray-500">// End of file - {personalInfo.fullName || 'developer'}.cv</span>
        </div>
      </div>
    </div>
  );
};

export default TechTemplate;
