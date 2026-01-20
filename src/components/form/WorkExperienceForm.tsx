import type React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import BulletPoints from '../ui/BulletPoints';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

const WorkExperienceForm: React.FC = () => {
  const {
    cv,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    addBulletPoint,
    updateBulletPoint,
    removeBulletPoint,
    reorderBulletPoints
  } = useCVStore();
  const { workExperience } = cv;

  const handleAddExperience = () => {
    addWorkExperience();
  };

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateWorkExperience(id, { [name]: value });
  };

  const handleCurrentJobChange = (id: string, isCurrentJob: boolean) => {
    const currentExp = workExperience.find(exp => exp.id === id);
    updateWorkExperience(id, {
      isCurrentJob,
      endDate: isCurrentJob ? '' : currentExp?.endDate || ''
    });
  };

  const handleDateChange = (id: string, field: 'startDate' | 'endDate', date: Date | null) => {
    const formattedDate = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '';
    updateWorkExperience(id, { [field]: formattedDate });
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
          <Briefcase className="mr-2" /> Work Experience
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddExperience}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Experience
        </Button>
      </div>

      {workExperience.length === 0 ? (
        <div className="text-center py-4 text-text-muted">
          <p>No work experience added yet. Click the button above to add your work history.</p>
        </div>
      ) : (
        workExperience.map((exp, index) => (
          <div
            key={exp.id}
            className={`p-4 rounded-lg glass-surface ${index > 0 ? 'mt-4' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Experience #{index + 1}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeWorkExperience(exp.id)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Company"
                  name="company"
                  value={exp.company}
                  onChange={(e) => handleChange(exp.id, e)}
                  placeholder="Example Company"
                  fullWidth
                  required
                />
              </div>

              <Input
                label="Position"
                name="position"
                value={exp.position}
                onChange={(e) => handleChange(exp.id, e)}
                placeholder="Software Engineer"
                fullWidth
                required
              />

              <Input
                label="Location"
                name="location"
                value={exp.location}
                onChange={(e) => handleChange(exp.id, e)}
                placeholder="New York, NY"
                fullWidth
              />

              <DatePicker
                label="Start Date"
                selected={parseDate(exp.startDate)}
                onChange={(date) => handleDateChange(exp.id, 'startDate', date)}
                dateFormat="month-year"
                placeholder="Select start date"
                fullWidth
                required
              />

              <div className="space-y-2">
                <DatePicker
                  label="End Date"
                  selected={parseDate(exp.endDate)}
                  onChange={(date) => handleDateChange(exp.id, 'endDate', date)}
                  dateFormat="month-year"
                  placeholder="Select end date"
                  fullWidth
                  required={!exp.isCurrentJob}
                  disabled={exp.isCurrentJob}
                />
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={exp.isCurrentJob}
                    onChange={(e) => handleCurrentJobChange(exp.id, e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent bg-surface-input"
                  />
                  <span>I currently work here</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description & Responsibilities
                </label>
                <BulletPoints
                  points={exp.bulletPoints}
                  onChange={(points) => reorderBulletPoints(exp.id, points)}
                  onAdd={() => addBulletPoint(exp.id)}
                  onRemove={(pointId) => removeBulletPoint(exp.id, pointId)}
                  onUpdate={(pointId, text) => updateBulletPoint(exp.id, pointId, text)}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WorkExperienceForm;
