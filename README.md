# PeerTutor-ISU
IT 391 Spring 2026 

**Overview**: Our mobile app will be called PeerTutor ISU. Its purpose is to facilitate university students to find and connect with peer tutors. The app allows users to look for tutors by course numbers, filter the searches, request tutoring sessions, and message with the tutors. 

**Features**:
- Create account
- Log in/out
- ILSTU login verification
- Profile Customization
- Search tutors by course number
- Display tutor information: availability, rating, in-person/online
- Request tutoring session
- Tutor accepts/declines session request: notification is sent to student
- Session reminder notifications
- Messaging between tutor and student
- Calendar view displays scheduled lessons
- Post-session feedback and rating opens up to student after session

**Contributors**:
- Maria Plascencia
- RJ Dennis
- Matt Huska
- Phillip Nguyen

**Tech Stack**:
  Frontend: React Native (JSX), CSS
  Backend: Spring Boot + Maven (Java REST API)
  Database: PostgreSQL
  
**Prerequisites**:
  Before running the project, install:
  - Java JDK 17+
  - Maven
  - Node.js + npm
  - PostgreSQL
  - Android Studio
    
**Installation**:
  1. Clone repository:
   
     git clone https://github.com/mgplasc/PeerTutor-ISU
     
     cd PeerTutor-ISU
     
  3. Set up backend:
     
     cd backend
     
     mvn clean install
     
     **Configure PostgreSQL credentials in application.properties before running.**

     mvn spring-boot:run
     
  2. Set up frontend:
     
     cd frontend
     
     npm install

     npm start
     
  3. Run frontend on Android *Still working on this setup*
    
    Open Android Studio -> AVD Manager -> Start an emulator

    Run app from terminal:

    npx react-native run-android
