Study Group Finder & Collaboration Platform

React | TypeScript | Spring Boot | MySQL | Java

A modern, full-stack web application that connects students enrolled in the same courses to form effective study groups. This platform allows users to create profiles, discover peers, form groups, communicate in real-time, and manage academic schedules efficiently.

🎯 Project Objective

Students often face challenges in collaborating effectively:

Finding peers for the same courses

Coordinating study sessions

Sharing resources and communicating in real-time

Tracking group activities and schedules

This platform addresses these challenges by providing an integrated environment for academic collaboration and peer networking.

👥 Team Members
Name	Role
Vamsidhar Reddy	Full-Stack Developer
[Other Team Member 1]	Backend Developer
[Other Team Member 2]	Frontend Developer
[Other Team Member 3]	UI/UX Designer

(Replace placeholders with actual names and roles)

📋 Features
✅ Completed

Authentication & Security

JWT-based authentication

Secure password hashing

Email-based password reset

Session management (Remember Me)

User Profile Management

Full profile creation with academic details

Avatar upload using Cloudinary

Bio and personal info management

Course Management

Browse, search, enroll/unenroll in courses

View enrolled courses

Track course peers

Peer Discovery

Find peers enrolled in the same courses

Filter and search peers

Study Groups

Create and join public/private groups

View group members

🚧 In Progress

Communication

Real-time group chat (WebSockets)

Direct messaging

Calendar & Scheduling

Schedule study sessions

Event creation and reminders

Group calendar integration

🏗️ Milestones
Milestone 1: Authentication & Course Management ✅ Completed

User registration/login with JWT

Profile setup and editing

Enroll/unenroll in courses

Dashboard with joined groups and suggested peers

Milestone 2: Group Creation & Discovery ✅ Completed

Create groups with privacy settings

Search/filter groups

Join public/private groups

View group member list

Milestone 3: Communication & Collaboration ⏳ In Progress

Real-time chat (WebSockets)

Collaborative document editing

Milestone 4: Scheduling & Notifications ⏳ In Progress

Schedule study sessions

Email/push notifications for events

Calendar widget

🛠️ Tech Stack

Frontend

React 18, TypeScript, Tailwind CSS

Vite (Build Tool), React Router

Lucide React (Icons)

Backend

Spring Boot 3.5.6, Spring Security

Spring Data JPA, JWT for authentication

MySQL 8, Lombok, SpringDoc OpenAPI

Third-Party Services

Cloudinary (Avatar uploads)

Gmail SMTP (Notifications)

📦 Prerequisites

Java 17+

Node.js 18+ and npm

MySQL 8+

Maven 3.8+

Git

🚀 Installation
1. Clone Repository
git clone https://github.com/your-username/study-group-finder.git
cd study-group-finder

2. Database Setup
CREATE DATABASE studygroup;


The application will create required tables on first run.

3. Backend Setup
cd backend
mvn clean install
mvn spring-boot:run


Server runs at http://localhost:8080

4. Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at http://localhost:5173

⚙️ Configuration
Backend (application.properties)
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/studygroup?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

jwt.secret=YOUR_JWT_SECRET_KEY
jwt.expiration=86400000

spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD

cloudinary.cloud-name=YOUR_CLOUD_NAME
cloudinary.api-key=YOUR_API_KEY
cloudinary.api-secret=YOUR_API_SECRET

Frontend (api.ts)
const API_BASE_URL = 'http://localhost:8080/api';

📚 API Documentation

Access Swagger UI:

http://localhost:8080/swagger-ui.html


Key Endpoints

Auth: /api/auth/register, /api/auth/login, /api/auth/forgot-password

User Profile: /api/user/profile

Courses: /api/courses, /api/courses/my-courses, /api/courses/peers

Groups: /api/groups/created/{userId}, /api/groups/joined/{userId}, /api/groups/available/{userId}

📁 Project Structure
study-group-finder/
├── backend/  # Spring Boot backend
├── frontend/ # React + TypeScript frontend
└── README.md

🔒 Security

Password encryption with BCrypt

JWT-based authentication

CORS configured for frontend-backend

Secure file uploads

Email verification for password reset

📈 Future Enhancements

Fully functional collaborative document editing

Advanced real-time notifications and reminders

Mobile-friendly responsive design

Enhanced analytics for study group participation

📝 License

MIT License. See LICENSE file for details.

🙌 Acknowledgments

Spring Boot & Spring Security documentation

React & TypeScript documentation

Tailwind CSS

Cloudinary

Open-source contributors

I can also make it even more visually attractive using badges for “Completed ✅”, “In Progress ⏳”, and “Planned 🚀” and add project screenshots if you want.
