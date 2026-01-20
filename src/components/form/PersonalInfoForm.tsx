import React from 'react';
import { useCVStore } from '../../store/cvStore';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Card from '../ui/Card';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const PersonalInfoForm: React.FC = () => {
  const { cv, updatePersonalInfo } = useCVStore();
  const { personalInfo } = cv;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updatePersonalInfo({ [name]: value });
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <div className="flex items-center">
            <User className="w-5 h-5 text-text-muted mr-2" />
            <Input
              label="Full Name"
              name="fullName"
              value={personalInfo.fullName}
              onChange={handleChange}
              placeholder="John Jones"
              fullWidth
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <Input
            label="Job Title"
            name="jobTitle"
            value={personalInfo.jobTitle}
            onChange={handleChange}
            placeholder="Software Engineer"
            fullWidth
          />
        </div>

        <div className="flex items-center">
          <Mail className="w-5 h-5 text-text-muted mr-2 self-start mt-4" />
          <Input
            label="Email"
            name="email"
            type="email"
            value={personalInfo.email}
            onChange={handleChange}
            placeholder="john.jones@example.com"
            fullWidth
            required
          />
        </div>

        <div className="flex items-center">
          <Phone className="w-5 h-5 text-text-muted mr-2 self-start mt-4" />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={personalInfo.phone}
            onChange={handleChange}
            placeholder="+234 (456) 678-9102"
            fullWidth
          />
        </div>

        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-text-muted mr-2 self-start mt-4" />
          <Input
            label="Location"
            name="location"
            value={personalInfo.location}
            onChange={handleChange}
            placeholder="Lagos, Nigeria"
            fullWidth
          />
        </div>

        <div className="flex items-center">
          <Globe className="w-5 h-5 text-text-muted mr-2 self-start mt-4" />
          <Input
            label="Website"
            name="website"
            type="url"
            value={personalInfo.website}
            onChange={handleChange}
            placeholder="https://johnjones.com"
            fullWidth
          />
        </div>

        <div className="flex items-center">
          <Linkedin className="w-5 h-5 text-text-muted mr-2 self-start mt-4" />
          <Input
            label="LinkedIn"
            name="linkedin"
            value={personalInfo.linkedin}
            onChange={handleChange}
            placeholder="linkedin.com/in/johndoe"
            fullWidth
          />
        </div>

        <div className="flex items-center">
          <Github className="w-5 h-5 text-text-muted mr-2 self-start mt-4" />
          <Input
            label="GitHub"
            name="github"
            value={personalInfo.github}
            onChange={handleChange}
            placeholder="github.com/johnjones"
            fullWidth
          />
        </div>

        <div className="md:col-span-2">
          <TextArea
            label="Professional Summary"
            name="summary"
            value={personalInfo.summary}
            onChange={handleChange}
            placeholder="A brief summary of your professional background, skills, and career goals."
            rows={4}
            fullWidth
          />
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoForm;
