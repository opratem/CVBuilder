import React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import TextArea from '../ui/TextArea';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Award, Plus, Trash2 } from 'lucide-react';

const ExtracurricularForm: React.FC = () => {
  const { cv, addExtracurricular, updateExtracurricular, removeExtracurricular } = useCVStore();
  const { extracurricular } = cv;

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateExtracurricular(id, { [name]: value });
  };

  const handleDateChange = (id: string, field: string, date: Date | null) => {
    updateExtracurricular(id, { [field]: date ? date.toISOString().split('T')[0] : '' });
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      return new Date(dateString + 'T00:00:00');
    } catch {
      return null;
    }
  };

  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Award className="mr-2" /> Extracurricular Activities
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => addExtracurricular({
            title: '',
            organization: '',
            startDate: '',
            endDate: '',
            description: ''
          })}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Activity
        </Button>
      </div>

      {extracurricular.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>No extracurricular activities added yet. Click the button above to add your activities.</p>
        </div>
      ) : (
        extracurricular.map((activity, index) => (
          <div
            key={activity.id}
            className={`p-4 rounded-lg glass-surface ${index > 0 ? 'mt-4' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Activity #{index + 1}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeExtracurricular(activity.id)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Activity Title"
                  name="title"
                  value={activity.title || ''}
                  onChange={(e) => handleChange(activity.id, e)}
                  placeholder="Student Council President"
                  fullWidth
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Organization"
                  name="organization"
                  value={activity.organization || ''}
                  onChange={(e) => handleChange(activity.id, e)}
                  placeholder="University Student Council"
                  fullWidth
                  required
                />
              </div>

              <DatePicker
                label="Start Date"
                selected={parseDate(activity.startDate || '')}
                onChange={(date) => handleDateChange(activity.id, 'startDate', date)}
                dateFormat="month-year"
                placeholder="Select start date"
                fullWidth
                required
              />

              <DatePicker
                label="End Date"
                selected={parseDate(activity.endDate || '')}
                onChange={(date) => handleDateChange(activity.id, 'endDate', date)}
                dateFormat="month-year"
                placeholder="Present (if ongoing)"
                fullWidth
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Description"
                  name="description"
                  value={activity.description || ''}
                  onChange={(e) => handleChange(activity.id, e)}
                  placeholder="Describe your role, responsibilities, and achievements"
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

export default ExtracurricularForm;
