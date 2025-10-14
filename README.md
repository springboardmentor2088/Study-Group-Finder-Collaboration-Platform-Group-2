# Study Group Finder & Collaboration Platform

## Project Overview
The **Study Group Finder & Collaboration Platform** is a web application designed to help students connect with peers enrolled in the same courses to form effective study groups. Users can create profiles, list their enrolled courses, discover classmates, and collaborate through integrated communication and productivity tools.  

This system enhances academic networking, improves study efficiency, and makes group work coordination seamless.

---

## Team Members
- **Vamsidhar Reddy** – Frontend & Backend Developer  
- **[Team Member 2 Name]** – Frontend Developer  
- **[Team Member 3 Name]** – Backend Developer  
- **[Team Member 4 Name]** – QA & Documentation  

*(Replace placeholders with actual team members’ names.)*

---

## Project Objectives
- Enable students to connect with peers taking the same courses.
- Facilitate the creation and management of study groups.
- Provide real-time communication and collaborative tools.
- Improve academic networking and study efficiency.

---

## Modules
### Module A: User Authentication & Course Management
- User registration/login with JWT authentication.
- Profile setup with name, academic details, and avatar upload.
- Add/remove enrolled courses from a predefined list.
- Dashboard displaying joined groups and suggested peers.

### Module B: Group Creation, Discovery & Membership
- Create study groups with name, description, course association, and privacy settings.
- Search and filter groups by course, size, or activity.
- Request to join private groups or instantly join public groups.
- View group member list.

### Module C: Communication & Collaboration
- Real-time group chat using WebSockets.
- Shared document editing within groups.

### Module D: Scheduling & Notifications
- Group calendar for scheduling study sessions.
- Create sessions with title, description, date, and time.
- Email/push notifications for session reminders.

---

## Milestones

### Milestone 1: Week 1–2 — Authentication & Course Management
- Implement JWT-based login/registration.
- Profile setup and editing.
- Add/remove enrolled courses.
- Display dashboard with joined groups and suggested peers.

**Outcomes:**
- Login & registration forms.
- Profile editing form.
- Dashboard page.

### Milestone 2: Week 3–4 — Group Creation & Discovery
- Create study groups with course association and privacy options.
- Search and filter groups.
- Join private groups via request or public groups instantly.
- View group member list.

**Outcomes:**
- Create group form.
- Search/filter groups.

### Milestone 3: Week 5–6 — Communication & Collaboration
- Real-time group chat using WebSockets.
- Collaborative document editing.

**Outcomes:**
- Chat page.
- Messaging widget.

### Milestone 4: Week 7–8 — Scheduling & Notifications
- Group calendar for study sessions.
- Session creation with title, description, date, and time.
- Email/push notifications.

**Outcomes:**
- Calendar widget.
- Event creation form.
- Notification option.

---

## Key Features
- **User Profiles:** Academic details, avatar, enrolled courses.
- **Group Discovery:** Search and join study groups by course or activity.
- **Real-time Chat:** Instant messaging within groups.
- **Collaboration Tools:** Shared notes or documents.
- **Event Scheduling:** Plan study sessions with notifications.
- **Dashboard:** Overview of courses, groups, and peers.

---

## Technologies Used
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Spring Boot, Hibernate, JPA
- **Database:** MySQL
- **Authentication:** JWT
- **Real-time Communication:** WebSockets
- **Notifications:** Email and push notifications

---

## How to Clone & Run the Project

```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git

# Navigate into the project directory
cd <repo-name>

# Backend: install dependencies and run
cd backend
./mvnw spring-boot:run

# Frontend: install dependencies and start
cd ../frontend
npm install
npm start
