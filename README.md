# 🚀 CV Builder - Professional Resume Builder Application

<div align="center">

![CV Builder](https://img.shields.io/badge/Version-2.0.0-00FF88?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-00FF88?style=for-the-badge&logo=react&logoColor=00FF88)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-00FF88?style=for-the-badge&logo=typescript&logoColor=00FF88)
![License](https://img.shields.io/badge/License-MIT-00FF88?style=for-the-badge)

**A modern, feature-rich CV/Resume builder with ATS optimization, multiple professional templates, and job-specific customization capabilities.**

[Features](#✨-features) • [Demo](#🎯-demo) • [Installation](#📦-installation) • [Usage](#💻-usage) • [Tech Stack](#🛠️-tech-stack) • [Contributing](#🤝-contributing)

</div>

---

## ✨ Features

### 🎨 Core Features

- **Multiple Professional Templates** - Choose from Classic, Modern, Minimal, Creative, Tech, Academic, and Executive templates
- **Fully Responsive Design** - Seamless experience across desktop, tablet, and mobile devices with fluid typography
- **Real-time Preview** - See your CV update in real-time as you type
- **Dark Theme UI** - Modern black and vibrant green color scheme with smooth animations
- **User Authentication** - Secure authentication powered by Supabase
- **Auto-Save** - Automatic cloud saving of your CV data (never lose your work)
- **Multiple Export Formats** - Export to PDF, DOCX, and other formats
- **Version Management** - Save and manage multiple versions of your CV

### 🎯 Advanced Features

- **ATS Optimization** - Built-in ATS (Applicant Tracking System) score checker and optimization
- **Job Description Analyzer** - AI-powered analysis to optimize your CV for specific job postings
- **Smart Suggestions** - Intelligent keyword and skill suggestions based on industry
- **Progress Tracking** - Visual progress indicator for CV completion
- **LinkedIn Import** - Import your data directly from LinkedIn
- **Drag & Drop Section Reordering** - Customize section order with intuitive drag and drop
- **Bullet Point Optimization** - Enhanced formatting with smart suggestions
- **Skills Database** - Access to 500+ pre-categorized professional skills
- **Custom Fonts** - Beautiful Poppins typography for modern, professional look

---

## 🎯 Demo

🔗 **[Live Demo](your-demo-url-here)**

### Screenshots

| Home Screen | CV Editor | PDF Export |
|-------------|-----------|------------|
| ![Home](screenshots/home.png) | ![Editor](screenshots/editor.png) | ![Export](screenshots/export.png) |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
      <br>React
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=typescript" width="48" height="48" alt="TypeScript" />
      <br>TypeScript
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
      <br>Vite
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br>Tailwind
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=supabase" width="48" height="48" alt="Supabase" />
      <br>Supabase
    </td>
  </tr>
</table>

### Dependencies

- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS with custom theme
- **State Management:** Zustand
- **Backend/Auth:** Supabase
- **PDF Generation:** jsPDF, html2pdf.js
- **Document Export:** docx
- **Drag & Drop:** @dnd-kit
- **Icons:** Lucide React
- **Package Manager:** Bun
- **Fonts:** Poppins (Google Fonts)

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (v1.0.0 or higher) - Recommended
- OR [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- A [Supabase](https://supabase.com/) account (for authentication and data storage)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/cv-builder.git
   cd cv-builder
   ```

2. **Install dependencies**

   Using Bun (recommended):
   ```bash
   bun install
   ```

   Or using npm:
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > 💡 **Getting Supabase Credentials:**
   > 1. Go to [Supabase Dashboard](https://app.supabase.com/)
   > 2. Create a new project or select existing one
   > 3. Go to Settings > API
   > 4. Copy Project URL and anon/public key

4. **Database Setup**

   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Create cv_data table
   create table cv_data (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users not null,
     cv_data jsonb not null,
     template text not null,
     title text not null,
     is_active boolean default true,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable Row Level Security
   alter table cv_data enable row level security;

   -- Create policies
   create policy "Users can view their own CV data"
     on cv_data for select
     using (auth.uid() = user_id);

   create policy "Users can insert their own CV data"
     on cv_data for insert
     with check (auth.uid() = user_id);

   create policy "Users can update their own CV data"
     on cv_data for update
     using (auth.uid() = user_id);

   create policy "Users can delete their own CV data"
     on cv_data for delete
     using (auth.uid() = user_id);
   ```

5. **Start the development server**

   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:5173`

---

## 💻 Usage

### Building Your CV

1. **Sign Up / Log In** - Create an account or log in with existing credentials
2. **Choose a Template** - Select from 7 professional templates
3. **Fill in Your Information** - Add personal info, work experience, education, skills, etc.
4. **Customize Layout** - Drag and drop to reorder sections
5. **Optimize for ATS** - Use the built-in ATS checker to optimize your CV
6. **Export** - Download as PDF or DOCX

### Using Job Optimizer

1. Navigate to the **Optimizer** tab
2. Paste a job description
3. Get AI-powered suggestions to tailor your CV
4. Apply suggestions with one click

### Managing Versions

1. Go to the **Versions** tab
2. Create new versions for different job applications
3. Switch between versions easily
4. Compare different versions side-by-side

---

## 🚀 Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

The built files will be in the `dist` directory.

---

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Netlify

1. Build the project: `bun run build`
2. Drag and drop the `dist` folder to [Netlify](https://netlify.com)
3. Or use Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

---

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  accent: {
    DEFAULT: '#00FF88', // Change this to your brand color
    light: '#33FFa3',
    dark: '#00CC6E',
    // ...
  },
}
```

### Adding New Templates

1. Create a new template component in `src/components/templates/`
2. Add the template to `src/components/form/TemplateSelector.tsx`
3. Create a corresponding PDF generator in `src/utils/`

---

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

All text, buttons, cards, and components scale smoothly across devices using fluid typography with `clamp()`.

---

## 🧪 Testing

```bash
# Run linter
bun run lint

# Run type checking
bun run typecheck
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Supabase](https://supabase.com/) - Backend and authentication
- [Lucide](https://lucide.dev/) - Icons
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Poppins Font](https://fonts.google.com/specimen/Poppins) - Typography

---

## 📧 Support

For support, email support@cvbuilder.com or open an issue in the GitHub repository.

---

## 🌟 Star History

If you find this project useful, please consider giving it a star!

---

<div align="center">

**Made with ❤️ and ⚡ by [OpraTech](https://github.com/yourusername)**

[⬆ back to top](#🚀-cv-builder---professional-resume-builder-application)

</div>
