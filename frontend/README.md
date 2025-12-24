# Bucket List Frontend

React + TypeScript frontend for the Bucket List application.

## Features

- Modern React 19 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Drag-and-drop with @dnd-kit
- Responsive design
- State management with React hooks

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── BucketListItem.tsx
│   ├── BucketListSection.tsx
│   └── ItemDialog.tsx
├── config/             # App configuration
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── pages/              # Page components
├── services/           # API service layer
└── types/              # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
