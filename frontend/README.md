# Frontend — Global Barber Society

The frontend application for Global Barber Society, built with React, TypeScript, and Vite.

🌐 **Live Application:** [https://globalbarber.ro/](https://globalbarber.ro/)

## Tech Stack

- React
- TypeScript
- Vite
- Firebase

## Prerequisites

- Node.js (a version compatible with the project's dependencies)
- npm
- Access to the required Firebase project configuration

## Installation

From the `frontend` directory, install the dependencies:

```bash
npm install
```

## Environment Variables

Create a local `.env` file based on the provided example:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Fill in the required Firebase values in `.env`. Use the variable names provided in `.env.example`.

Do not commit your local `.env` file or any private credentials.

## Development

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed in the terminal.

## Production Build

Build the frontend for production:

```bash
npm run build
```

To run the available project checks, inspect the scripts defined in `package.json`.

## Project Structure

```text
frontend/
├── src/
│   └── services/
├── public/
├── .env.example
├── package.json
└── README.md
```

## Deployment

Configure the required production environment variables in your deployment platform before building and deploying the application.

Live website: [https://globalbarber.ro/](https://globalbarber.ro/)
