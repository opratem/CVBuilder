import type React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

const classOptions = [
  { value: 'first', label: 'First Class' },
  { value: 'upperSecond', label: 'Second Class Upper' },
  { value: 'lowerSecond', label: 'Second Class Lower' },
  { value: 'third', label: 'Third Class' },
  { value: 'pass', label: 'Pass' },
  { value: 'other', label: 'Other' }
];

const EducationForm: React.FC = () => {
  const { cv, addEducation, updateEducation, removeEducation } = useCVStore();
  const { education } = cv;

  const handleAddEducation = () => {
    addEducation({
      institution: '',
      degree: '',
      classOfDegree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateEducation(id, { [name]: value });
  };

  const handleDateChange = (id: string, field: 'startDate' | 'endDate', date: Date | null) => {
    const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '';
    updateEducation(id, { [field]: formattedDate });
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [year, month] = dateString.split('-');
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <GraduationCap className="mr-2" /> Education
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddEducation}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-4 text-text-muted">
          <p>No education added yet. Click the button above to add your educational background.</p>
        </div>
      ) : (
        education.map((edu, index) => (
          <div
            key={edu.id}
            className={`p-4 rounded-lg glass-surface ${index > 0 ? 'mt-4' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Education #{index + 1}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Institution"
                  name="institution"
                  value={edu.institution}
                  onChange={(e) => handleChange(edu.id, e)}
                  placeholder="University of Example"
                  fullWidth
                  required
                />
              </div>

              <Input
                label="Degree"
                name="degree"
                value={edu.degree}
                onChange={(e) => handleChange(edu.id, e)}
                placeholder="Bachelor of Science"
                fullWidth
                required
              />

              <Input
                label="Field of Study"
                name="fieldOfStudy"
                value={edu.fieldOfStudy}
                onChange={(e) => handleChange(edu.id, e)}
                placeholder="Computer Science"
                fullWidth
              />

              <Select
                label="Class of Degree"
                name="classOfDegree"
                value={edu.classOfDegree}
                onChange={(e) => handleChange(edu.id, e)}
                options={classOptions}
                fullWidth
              />

              <DatePicker
                label="Start Date"
                selected={parseDate(edu.startDate)}
                onChange={(date) => handleDateChange(edu.id, 'startDate', date)}
                dateFormat="month-year"
                placeholder="Select start date"
                fullWidth
                required
              />

              <DatePicker
                label="End Date"
                selected={parseDate(edu.endDate)}
                onChange={(date) => handleDateChange(edu.id, 'endDate', date)}
                dateFormat="month-year"
                placeholder="Select end date"
                fullWidth
                required
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Description"
                  name="description"
                  value={edu.description}
                  onChange={(e) => handleChange(edu.id, e)}
                  placeholder="Relevant coursework, achievements, or projects"
                  rows={3}
                  fullWidth
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EducationForm;
