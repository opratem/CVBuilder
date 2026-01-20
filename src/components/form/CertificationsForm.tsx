import React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import DatePicker from '../ui/DatePicker';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Award, Plus, Trash2 } from 'lucide-react';

const CertificationsForm: React.FC = () => {
  const { cv, addCertification, updateCertification, removeCertification } = useCVStore();
  const { certifications } = cv;

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCertification(id, { [name]: value });
  };

  const handleDateChange = (id: string, field: string, date: Date | null) => {
    updateCertification(id, { [field]: date ? date.toISOString().split('T')[0] : '' });
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
          <Award className="mr-2" /> Certifications
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={() => addCertification({
            name: '',
            issuer: '',
            date: '',
            expiryDate: '',
            credentialId: '',
            credentialUrl: ''
          })}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>No certifications added yet. Click the button above to add your certifications.</p>
        </div>
      ) : (
        certifications.map((cert, index) => (
          <div
            key={cert.id}
            className={`p-4 rounded-lg glass-surface ${index > 0 ? 'mt-4' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Certification #{index + 1}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeCertification(cert.id)}
                className="flex items-center"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Certification Name"
                  name="name"
                  value={cert.name || ''}
                  onChange={(e) => handleChange(cert.id, e)}
                  placeholder="AWS Certified Solutions Architect"
                  fullWidth
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Issuing Organization"
                  name="issuer"
                  value={cert.issuer || ''}
                  onChange={(e) => handleChange(cert.id, e)}
                  placeholder="Amazon Web Services"
                  fullWidth
                  required
                />
              </div>

              <DatePicker
                label="Issue Date"
                selected={parseDate(cert.date || '')}
                onChange={(date) => handleDateChange(cert.id, 'date', date)}
                dateFormat="full"
                placeholder="Select issue date"
                fullWidth
                required
              />

              <DatePicker
                label="Expiry Date"
                selected={parseDate(cert.expiryDate || '')}
                onChange={(date) => handleDateChange(cert.id, 'expiryDate', date)}
                dateFormat="full"
                placeholder="Select expiry date (optional)"
                fullWidth
              />

              <Input
                label="Credential ID"
                name="credentialId"
                value={cert.credentialId || ''}
                onChange={(e) => handleChange(cert.id, e)}
                placeholder="ABC123XYZ"
                fullWidth
              />

              <Input
                label="Credential URL"
                name="credentialUrl"
                type="url"
                value={cert.credentialUrl || ''}
                onChange={(e) => handleChange(cert.id, e)}
                placeholder="https://verify.example.com/cert/123"
                fullWidth
              />
            </div>
          </div>
        ))
      )}
    </Card>
  );
};

export default CertificationsForm;
