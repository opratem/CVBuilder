# CV Builder - Professional Resume Builder Application

A modern, feature-rich CV/Resume builder application with ATS optimization, multiple templates, and job-specific customization capabilities.

## ✨ Features

### Core Features
- 🎨 **Multiple Professional Templates** - Classic, Modern, Minimal, Creative, Tech, Academic, and Executive templates
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🔐 **User Authentication** - Secure authentication with Supabase
- 💾 **Auto-Save** - Automatic saving of your CV data to the cloud
- 📄 **Multiple Export Formats** - Export to PDF, DOCX, and other formats
- 🔄 **Version Management** - Save and manage multiple versions of your CV

### Advanced Features
- 🎯 **ATS Optimization** - Built-in ATS (Applicant Tracking System) score checker
- 🤖 **Job Description Analyzer** - Optimize your CV for specific job postings
- 💡 **Smart Suggestions** - AI-powered keyword and skill suggestions
- 📊 **Progress Tracking** - Visual progress indicator for CV completion
- 🔗 **LinkedIn Import** - Import data directly from LinkedIn
- 📋 **Section Reordering** - Drag and drop to customize section order
- ✨ **Bullet Point Optimization** - Enhanced bullet point formatting and suggestions

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Backend/Auth:** Supabase
- **PDF Generation:** jsPDF, html2pdf.js
- **Document Export:** docx
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React
- **Package Manager:** Bun

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)
- A Supabase account (for authentication and data storage)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd cv-builder
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:5173`

## 🗄️ Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Project Settings > API to find your credentials
3. Create the following tables in your Supabase database:

### CV Data Table
```sql
CREATE TABLE cv_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cv_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CV data"
  ON cv_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CV data"
  ON cv_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CV data"
  ON cv_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV data"
  ON cv_data FOR DELETE
  USING (auth.uid() = user_id);
```

## 📁 Project Structure

```
cv-builder/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── form/              # Form components for CV sections
│   │   ├── layout/            # Layout components (Header, etc.)
│   │   ├── optimization/      # Job optimizer & version manager
│   │   ├── templates/         # CV template components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts (Auth, Toast)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Library configurations (Supabase)
│   ├── services/              # API services
│   ├── store/                 # Zustand store
│   ├── styles/                # Global styles
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions & PDF generators
│   ├── App.tsx                # Main application component
│   └── main.tsx               # Application entry point
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## 🎯 Usage

### Creating a CV

1. **Sign Up/Login** - Create an account or log in
2. **Personal Information** - Fill in your basic details
3. **Add Sections** - Add education, work experience, skills, etc.
4. **Choose Template** - Select from multiple professional templates
5. **Optimize** - Use the job optimizer for specific positions
6. **Export** - Download your CV in PDF or DOCX format

### Key Features Usage

- **ATS Optimization:** Use the ATS checker to ensure your CV passes automated screening
- **Job Optimizer:** Paste a job description to get keyword suggestions
- **Version Manager:** Save multiple versions for different job applications
- **LinkedIn Import:** Quickly populate your CV from LinkedIn data
- **Template Switching:** Preview and switch between templates instantly

## 🔧 Available Scripts

```bash
# Development
bun run dev          # Start development server

# Build
bun run build        # Build for production

# Linting & Formatting
bun run lint         # Run Biome linter and TypeScript checks
bun run format       # Format code with Biome

# Preview
bun run preview      # Preview production build
```

## 🎨 Customization

### Adding a New Template

1. Create a new template component in `src/components/templates/`
2. Register it in the template selector
3. Add corresponding PDF generator in `src/utils/`

### Modifying Styles

- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component-specific styles: Use Tailwind utility classes

## 🔒 Security

- All user data is protected with Row Level Security (RLS) in Supabase
- Authentication is handled securely through Supabase Auth
- Environment variables keep sensitive credentials safe
- All API calls are authenticated

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

**Supabase connection issues:**
- Verify your `.env.local` credentials
- Check Supabase project status
- Ensure RLS policies are correctly set up

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🙏 Acknowledgments

- Built with React and TypeScript
- Powered by Supabase
- Icons by Lucide
- PDF generation by jsPDF

---

Made with ❤️ for job seekers everywhere
