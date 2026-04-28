# SevaSetu AI

Smart Resource Allocation - Data-Driven Volunteer Coordination for Social Impact.

SevaSetu AI is a hackathon-ready backend for NGOs and volunteer groups that need to turn scattered community reports into structured tasks and actionable volunteer assignments. The system stores reports in Firestore, authenticates users with Firebase Auth, and uses Google Gemini for report analysis and task classification.

## What This Project Does

1. Collects NGO and community reports from surveys, forms, and manual entries.
2. Uses Gemini to extract structured data such as urgency, category, location, and required skills.
3. Creates tasks from validated reports.
4. Matches volunteers by skills, distance, availability, and language.
5. Supports realtime dashboards through Firestore.

## Tech Stack

- Backend: Node.js + Express
- Auth: Firebase Authentication
- Database: Firestore
- AI: Google Gemini via `@google/generative-ai`
- Storage: Cloud Storage for attachments, if enabled later
- Deployment target: Google Cloud Run or Firebase Functions

## Project Structure

```text
SevaSetu AI/
   package.json
   README.md
   .env.example
   .gitignore
   src/
      app.js
      index.js
      config/
         firebaseAdmin.js
         gemini.js
      controllers/
         authController.js
         reportController.js
         taskController.js
         matchingController.js
      middleware/
         authMiddleware.js
         errorMiddleware.js
      routes/
         authRoutes.js
         reportRoutes.js
         taskRoutes.js
         matchingRoutes.js
      services/
         firestoreService.js
         geminiService.js
         matchingService.js
```

## Core Features

- Firebase sign-up and login verification
- Submit report endpoint for NGOs
- Firestore-backed task creation
- Volunteer ranking and matching
- Gemini analysis hooks for future AI automation
- Role-based access control for admin, NGO, and volunteer users

## Local Setup

1. Open the `SevaSetu AI` folder in VS Code.
2. Copy `.env.example` to `.env`.
3. Fill the Firebase and Gemini values.
4. Install dependencies:

```bash
npm install
```

5. Start the server in development mode:

```bash
npm run dev
```

6. Open the health check:

```text
GET http://localhost:8080/health
```

## Environment Variables

```bash
PORT=8080
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=your-gemini-api-key
ENABLE_GEMINI_AUTO_ANALYSIS=false
```

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Reports

- `POST /api/reports/submit-report`
- `GET /api/reports`

### Tasks

- `POST /api/tasks/create-task`
- `GET /api/tasks`
- `POST /api/tasks/assign-task`
- `POST /api/tasks/classify-task`

### Matching

- `POST /api/matching/match-volunteers`

## Example API Flow

1. NGO user logs in with Firebase Auth.
2. NGO submits a report through `POST /api/reports/submit-report`.
3. Backend stores the raw report in Firestore.
4. Gemini can analyze the report and classify urgency/category.
5. Coordinator creates a task using `POST /api/tasks/create-task`.
6. Backend ranks volunteers with `POST /api/matching/match-volunteers`.
7. Coordinator assigns the best volunteer with `POST /api/tasks/assign-task`.
8. Firestore updates propagate to dashboards in realtime.

## Firestore Collections

### `users`

Stores admins, NGO staff, and volunteers.

Important fields:
- `uid`
- `name`
- `email`
- `role`
- `skills`
- `availability`
- `location`
- `preferredRadiusKm`
- `languages`
- `active`

### `reports`

Stores raw inputs and AI-enriched report metadata.

Important fields:
- `reportId`
- `organizationId`
- `submittedBy`
- `rawText`
- `aiStatus`
- `category`
- `urgencyLevel`
- `priorityScore`
- `summary`
- `location`
- `requiredSkills`

### `tasks`

Stores operational tasks created from reports.

Important fields:
- `taskId`
- `reportId`
- `title`
- `description`
- `category`
- `requiredSkills`
- `location`
- `priorityScore`
- `status`
- `capacityNeeded`
- `assignedCount`

### `assignments`

Stores task-to-volunteer mappings.

Important fields:
- `assignmentId`
- `taskId`
- `volunteerId`
- `organizationId`
- `matchScore`
- `reasons`
- `assignmentStatus`

## Gemini Integration

Gemini is used in two places:

1. Report analysis:
    - Extract category, urgency, summary, and required skills.
2. Task classification:
    - Suggest task category, volunteer skills, and duration.

Gemini is called from the backend only. Frontend apps should never call the Gemini API directly.

## Matching Logic

The matching engine scores volunteers using:

- Skill overlap
- Distance from task location
- Availability
- Language compatibility

The result is a ranked shortlist of the top volunteers for the task.

## Deployment Notes

Recommended MVP deployment:

1. Frontend on Firebase Hosting.
2. Backend on Cloud Run or Firebase Functions.
3. Firestore for realtime storage.
4. Firebase Auth for secure login.
5. Gemini API credentials stored in environment variables.

## Demo Checklist

1. Create volunteer and NGO users.
2. Submit a sample report.
3. Show the task creation flow.
4. Run volunteer matching.
5. Assign a volunteer.
6. Open Firestore and show live updates.

## Notes

- The project folder was scaffolded from scratch.
- The backend is intentionally simple so it can be extended into a production-ready app later.
- If you want, the next step can be a React frontend or Cloud Run deployment files.
