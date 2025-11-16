import type React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { FolderGit2, Plus, Trash2 } from 'lucide-react';

const ProjectsForm: React.FC = () => {
  const { cv, addProject, updateProject, removeProject } = useCVStore();
  const { projects } = cv;

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // For technologies, keep as string during editing
    if (name === 'technologies') {
      updateProject(id, { technologies: value as any }); // Temporarily store as string
    } else {
      updateProject(id, { [name]: value });
    }
  };

  const handleTechnologiesBlur = (id: string, value: string) => {
    // Only convert to array when user leaves the field (onBlur)
    const techArray = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    updateProject(id, { technologies: techArray });
  };

  const handleAddProject = () => {
    addProject({
      name: '',
      description: '',
      technologies: [],
      url: ''
    });
  };

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FolderGit2 className="mr-2" /> Projects
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddProject}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>No projects added yet. Click the button above to add your projects.</p>
        </div>
      ) : (
        projects.map((project, index) => (
          <div
            key={project.id}
            className={`p-4 rounded-lg border border-gray-200 ${index > 0 ? 'mt-4' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Project #{index + 1}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeProject(project.id)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Project Name"
                  name="name"
                  value={project.name}
                  onChange={(e) => handleChange(project.id, e)}
                  placeholder="My Awesome Project"
                  fullWidth
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Technologies Used (separate with commas)"
                  name="technologies"
                  value={Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || '')}
                  onChange={(e) => handleChange(project.id, e)}
                  onBlur={(e) => handleTechnologiesBlur(project.id, e.target.value)}
                  placeholder="React, Node.js, MongoDB, Python"
                  fullWidth
                  autoComplete="off"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Project Link"
                  name="url"
                  type="url"
                  value={project.url || ''}
                  onChange={(e) => handleChange(project.id, e)}
                  placeholder="https://github.com/username/project"
                  fullWidth
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Description"
                  name="description"
                  value={project.description}
                  onChange={(e) => handleChange(project.id, e)}
                  placeholder="Describe the project, your role, and the technologies used."
                  rows={3}
                  fullWidth
                  required
                />
              </div>
            </div>
          </div>
        ))
      )}
    </Card>
  );
};

export default ProjectsForm;
