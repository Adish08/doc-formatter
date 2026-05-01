# Document Formatter

A professional, browser-based tool to restructure Excel data for account and mobile number management. Built with React, Tailwind CSS v4, and SheetJS.

## 🚀 Features
- **Client-Side Processing:** All Excel data is processed directly in your browser. Nothing is ever uploaded to a server.
- **Smart Restructuring:** Automatically parses 'Account' and 'Balance' columns and expands rows based on multiple mobile numbers found in auxiliary columns.
- **Modern UI/UX:** Clean, orange-themed interface with intuitive drag-and-drop functionality and smooth animations.
- **Instant Download:** Automatically generates and downloads the formatted `.xlsx` file upon completion.

## 🛠️ Tech Stack
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS v4
- **Excel Logic:** SheetJS (xlsx)
- **Icons:** Lucide React

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
```bash
npm run dev
```

### Building for Production
Create a production-ready build:
```bash
npm run build
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
