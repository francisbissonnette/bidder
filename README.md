# Bidder App

A modern web application for managing bidding items with a sleek dark theme interface.

## Features

- Data table view of all items
- Add new items through a modal form
- Edit existing items
- Delete items with confirmation
- Dark theme with slim sidebar navigation
- Responsive design

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Chakra UI
- React Icons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
  ├── app/              # Next.js app directory
  ├── components/       # React components
  │   ├── Layout/      # Layout components
  │   ├── Items/       # Item-related components
  │   └── common/      # Shared components
  ├── types/           # TypeScript type definitions
  └── theme/           # Chakra UI theme configuration
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint 