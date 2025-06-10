# Poll App

A real-time polling application with separate frontend and backend.

## Features

- Create polls with custom questions and multiple options
- Join polls using a unique session code
- Real-time vote updates
- Live results visualization using bar charts
- Participant count tracking
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js backend server

## Architecture

### System Overview
The application follows a client-server architecture with real-time bidirectional communication:

```
┌─────────────┐     WebSocket     ┌─────────────┐
│   Client    │◄─────────────────►│   Server    │
│  (React)    │     Socket.IO     │  (Node.js)  │
└─────────────┘                   └─────────────┘
```

### Component Architecture
```
client/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── context/       # React context providers
│   ├── services/      # API and Socket.IO services
│   └── utils/         # Utility functions

server/
├── src/
│   ├── controllers/   # Request handlers
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── socket/        # Socket.IO event handlers
```

## API Documentation

### REST Endpoints

#### Poll Management
- `POST /api/polls` - Create a new poll
  ```json
  {
    "question": "What's your favorite color?",
    "options": ["Red", "Blue", "Green"]
  }
  ```

- `GET /api/polls/:sessionCode` - Get poll details
- `DELETE /api/polls/:sessionCode` - Delete a poll

#### Voting
- `POST /api/polls/:sessionCode/vote` - Submit a vote
  ```json
  {
    "optionId": "option1"
  }
  ```

### Socket.IO Events

#### Client to Server
- `join_poll`: Join a poll session
  ```javascript
  socket.emit('join_poll', { sessionCode: 'ABC123' });
  ```

- `submit_vote`: Submit a vote
  ```javascript
  socket.emit('submit_vote', { 
    sessionCode: 'ABC123',
    optionId: 'option1'
  });
  ```

#### Server to Client
- `poll_update`: Real-time poll updates
  ```javascript
  socket.on('poll_update', (data) => {
    // Update poll results
  });
  ```

- `participant_count`: Update participant count
  ```javascript
  socket.on('participant_count', (count) => {
    // Update participant count
  });
  ```

# Running the Application

### Frontend (Client)
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000

### Backend (Server)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on http://localhost:5000

## Development

- Frontend runs on port 3000
- Backend runs on port 5000
- The frontend is configured to proxy API requests to the backend

## Usage

1. Open http://localhost:3000 in your browser
2. To create a poll:
   - Click "Create New Poll"
   - Enter your question and options
   - Share the generated session code with participants
3. To join a poll:
   - Enter the session code on the home page
   - Vote for your preferred option
   - View real-time results

## Technologies Used

- Frontend: React, Socket.IO Client, Chart.js
- Backend: Node.js, Express, Socket.IO
- Styling: Tailwind CSS
