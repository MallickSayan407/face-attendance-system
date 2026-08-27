# Face Attendance System

A full-stack employee attendance management system that uses face recognition to identify registered employees and automatically mark their attendance.

The system combines a **Spring Boot REST API**, **MySQL database**, **HTML/CSS/JavaScript frontend**, and a separate **Python face-recognition service using InsightFace and OpenCV**.

---

## Features

- Employee registration and management
- Employee face-image upload
- Face recognition using InsightFace
- Real-time webcam-based recognition
- Automatic employee identification
- Attendance marking after multiple recognition confirmations
- Duplicate attendance prevention
- Date-based attendance tracking
- Present/absent employee status
- Attendance percentage calculation
- Attendance dashboard
- REST APIs for employees and attendance
- DTO-based request and response handling
- Jakarta Bean Validation
- Centralized exception handling
- Separate Python recognition service
- Browser-based user interface

---

## Technology Stack

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Jakarta Bean Validation
- Gradle
- Lombok

### Database

- MySQL
- MySQL Workbench

### Frontend

- HTML5
- CSS3
- JavaScript
- Browser Web Camera API

### Face Recognition Service

- Python
- Flask
- InsightFace
- OpenCV
- ONNX Runtime

### Development Tools

- Eclipse / Spring Tool Suite
- IntelliJ IDEA
- Postman
- Git
- GitHub

---

## System Architecture

```text
                         FACE ATTENDANCE SYSTEM
                                  |
              +-------------------+-------------------+
              |                                       |
              v                                       v
       Web Browser                           Python Recognition
     HTML / CSS / JavaScript                     Service
              |                                  Flask :5000
              |                                       |
              |                                       |
              |                              InsightFace + OpenCV
              |                                       |
              |                                Face Embedding
              |                                       |
              |                                Face Matching
              |                                       |
              +-------------------+-------------------+
                                  |
                              REST / HTTP
                                  |
                                  v
                         Spring Boot Backend
                              Port 8080
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
              Employee APIs               Attendance APIs
                    |                           |
                    +-------------+-------------+
                                  |
                                  v
                            MySQL Database
                       +-----------------------+
                       | Employee              |
                       | Attendance            |
                       +-----------------------+


How the System Works

The application is divided into two major services.

1. Spring Boot Backend

The Spring Boot application is responsible for:

Employee management
Employee image upload
Attendance management
Database operations
REST API handling
Request validation
Exception handling
Attendance statistics

The backend runs on:

http://localhost:8080
2. Python Face Recognition Service

The Python service is responsible for:

Loading registered employee images
Generating face embeddings
Accessing the webcam
Detecting faces
Comparing detected faces with registered employee embeddings
Identifying employees
Sending recognized employee information to the Spring Boot backend

The recognition service runs on:

http://localhost:5000
Face Recognition Flow

The recognition process follows this general flow:

Employee Image
      |
      v
Spring Boot Backend
      |
      v
Stored Employee Image
      |
      v
Python Recognition Service
      |
      v
InsightFace
      |
      v
Face Detection
      |
      v
Face Embedding
      |
      v
Similarity Comparison
      |
      v
Registered Employee Match
      |
      v
Multiple Confirmations
      |
      v
Attendance API
      |
      v
MySQL Attendance Record
Recognition Confirmation

The system does not immediately mark attendance from a single detected frame.

The recognition service uses multiple successful recognition confirmations before attendance is marked.

Current configuration:

Recognition threshold: 0.6
Required confirmations: 5

This helps reduce accidental attendance marking caused by a single incorrect recognition result.

Attendance Workflow

Once an employee is successfully recognized:

Face detected
     |
     v
Employee identified
     |
     v
Recognition confirmed
     |
     v
Attendance API called
     |
     v
Check whether attendance already exists
     |
     +------ Yes ------> Do not create duplicate attendance
     |
     +------ No -------> Create attendance record

Attendance is associated with the employee and the current date.

The system prevents an employee from being marked present multiple times on the same date.

Attendance Dashboard

The web interface provides attendance information including:

Total employees
Present employees
Absent employees
Attendance percentage
Employee attendance status
Current-date attendance information

Example summary:

{
  "date": "2026-08-26",
  "totalEmployees": 4,
  "presentEmployees": 4,
  "absentEmployees": 0,
  "attendancePercentage": 100.0
}
Backend Architecture

The Spring Boot backend follows a layered architecture.

Controller
    |
    v
Service
    |
    v
Repository
    |
    v
Database

DTOs are used between the API layer and entity layer.

HTTP Request
     |
     v
Controller
     |
     v
Request DTO
     |
     v
Service
     |
     v
Entity
     |
     v
Repository
     |
     v
MySQL
Backend Packages
com.sayan.faceattendance
|
+-- controller
|
+-- dto
|
+-- entity
|
+-- exception
|
+-- repository
|
+-- service
|
+-- FaceAttendanceBackendApplication.java
Controller

Contains REST API endpoints for:

Employees
Attendance
DTO

Contains request and response objects.

Examples:

EmployeeRequestDTO
EmployeeResponseDTO
AttendanceResponseDTO
AttendanceSummaryDTO
Entity

Contains JPA database entities.

Employee
Attendance
Repository

Contains Spring Data JPA repositories.

EmployeeRepository
AttendanceRepository
Service

Contains application business logic.

EmployeeService
EmployeeServiceImpl

AttendanceService
AttendanceServiceImpl

FileStorageService
Exception

Contains custom exceptions and centralized exception handling.

EmployeeNotFoundException
AttendanceNotFoundException
DuplicateEmailException
DuplicateAttendanceException
GlobalExceptionHandler
Database Design

The application uses MySQL.

Database:

face_attendance_db
Employee

The employee table stores employee information and the location of the uploaded face image.

Important fields include:

employee_id
name
email
department
designation
image_path
created_at

The employee ID is generated automatically by MySQL.

The email field is unique.

Attendance

The attendance table stores attendance information associated with employees.

Attendance records are used to determine:

Whether an employee is present
Attendance date
Employee attendance history
Daily attendance statistics
REST API

The backend exposes REST APIs for employee and attendance management.

Employee APIs

Base URL:

http://localhost:8080/api/employees

Typical operations include:

GET     /api/employees
GET     /api/employees/{id}
POST    /api/employees
PUT     /api/employees/{id}
DELETE  /api/employees/{id}

Employee registration supports uploading an employee face image.

Attendance APIs

Base URL:

http://localhost:8080/api/attendance

Attendance APIs provide functionality for:

Creating attendance
Retrieving attendance
Retrieving attendance by date
Checking employee attendance
Attendance summary/statistics

Refer to the controller classes for the current endpoint definitions.

Validation

The backend uses Jakarta Bean Validation for validating incoming data.

Validation is used to prevent invalid employee information from entering the database.

Examples include:

Required employee name
Required department
Valid email address
Valid phone number
Valid employee information

Validation errors are handled centrally through:

GlobalExceptionHandler
Exception Handling

The application uses centralized exception handling.

Custom exceptions include:

EmployeeNotFoundException
AttendanceNotFoundException
DuplicateEmailException
DuplicateAttendanceException

Instead of handling errors separately in every controller, the application uses:

GlobalExceptionHandler

to provide consistent error responses.

File Upload

Employee face images are uploaded through the Spring Boot backend.

Images are stored locally during development under:

uploads/employees/

The upload directory is intentionally excluded from Git because employee face images should not be committed to a public repository.

Python Face Recognition Service

The Python service is located at:

face-recognition/face-recognition-service/

Main files:

employee_face_loader.py
face_engine.py
webcam_recognition.py
web_recognition_service.py
employee_face_loader.py

Responsible for communicating with the Spring Boot employee API and loading employee information.

face_engine.py

Contains the face-recognition processing logic using InsightFace.

webcam_recognition.py

Provides webcam-based recognition functionality.

web_recognition_service.py

Runs the Flask recognition API and provides browser-accessible recognition functionality.

InsightFace

The recognition service uses InsightFace to generate face embeddings.

The current model used by the service is:

buffalo_s

The recognition model generates a 512-dimensional face embedding.

The service compares the embedding generated from the webcam face against registered employee embeddings.

Running the Project

The complete system requires:

MySQL
Spring Boot backend
Python recognition service
Web browser
Prerequisites

Install the following:

JDK 21
MySQL Server
MySQL Workbench
Python 3.11+
Git
A modern web browser
1. Clone the Repository
git clone https://github.com/MallickSayan407/face-attendance-system.git

Move into the project:

cd face-attendance-system
2. Configure MySQL

Create the database:

CREATE DATABASE face_attendance_db;

The Spring Boot application uses:

Database: face_attendance_db
Host: localhost
Port: 3306
Username: root
3. Configure Spring Boot

The repository contains an example configuration:

backend/face-attendance-backend/src/main/resources/application-example.properties

Create your local configuration file:

backend/face-attendance-backend/src/main/resources/application.properties

Use your own MySQL credentials.

Example:

spring.application.name=face-attendance-backend

spring.datasource.url=jdbc:mysql://localhost:3306/face_attendance_db
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

file.upload-dir=uploads/employees
Important

Do not commit your real database password.

The local application.properties file is excluded through .gitignore.

4. Start the Spring Boot Backend

Open PowerShell in:

backend/face-attendance-backend

Run:

.\gradlew bootRun

The backend should start on:

http://localhost:8080
5. Set Up the Python Service

Open another terminal:

cd face-recognition\face-recognition-service

Create a virtual environment:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install the required Python packages.

The exact packages depend on the current Python environment and InsightFace/ONNX Runtime installation.

6. Start the Recognition Service

With the virtual environment activated:

python web_recognition_service.py

The service should start on:

http://localhost:5000

The recognition service communicates with the Spring Boot backend running on port 8080.

7. Open the Web Application

Once both services are running, open:

http://localhost:8080

The Spring Boot application serves the frontend from:

src/main/resources/static/

The frontend contains:

index.html
style.css
script.js
Project Structure
face-attendance-system/
|
+-- backend/
|   |
|   +-- face-attendance-backend/
|       |
|       +-- src/
|       |   |
|       |   +-- main/
|       |   |   |
|       |   |   +-- java/
|       |   |   |   |
|       |   |   |   +-- com/sayan/faceattendance/
|       |   |   |       |
|       |   |   |       +-- controller/
|       |   |   |       +-- dto/
|       |   |   |       +-- entity/
|       |   |   |       +-- exception/
|       |   |   |       +-- repository/
|       |   |   |       +-- service/
|       |   |   |       +-- FaceAttendanceBackendApplication.java
|       |   |   |
|       |   |   +-- resources/
|       |   |       |
|       |   |       +-- static/
|       |   |       |   +-- index.html
|       |   |       |   +-- script.js
|       |   |       |   +-- style.css
|       |   |       |
|       |   |       +-- application-example.properties
|       |   |
|       |   +-- test/
|       |
|       +-- build.gradle
|       +-- gradlew
|       +-- gradlew.bat
|       +-- settings.gradle
|
+-- face-recognition/
|   |
|   +-- face-recognition-service/
|       |
|       +-- employee_face_loader.py
|       +-- face_engine.py
|       +-- webcam_recognition.py
|       +-- web_recognition_service.py
|       +-- .gitignore
|
+-- .gitignore
+-- README.md
Git Branch Structure

The repository uses two branches:

main
development
main

Contains the stable version of the project.

development

Used for ongoing development, testing, documentation, and improvements.

The intended workflow is:

development
     |
     v
Development / Testing
     |
     v
Stable Version
     |
     v
main
Security and Git Configuration

The following local/generated files are excluded from Git:

application.properties
uploads/
venv/
.gradle/
build/
bin/
.settings/
.idea/

This prevents local credentials, uploaded employee images, virtual environments, and generated IDE/build files from being committed.

The repository contains:

application-example.properties

instead of real database credentials.

Testing

The Spring Boot project contains a test structure under:

src/test/java/

The project can be tested using:

Browser
Postman
Spring Boot tests
MySQL Workbench

The REST APIs can be tested independently using Postman.

Example Recognition Flow

Suppose an employee is registered in the database.

Employee Registration
        |
        v
Upload Face Image
        |
        v
Store Employee Information
        |
        v
Python Service Loads Employee
        |
        v
Generate Face Embedding
        |
        v
Open Webcam
        |
        v
Detect Face
        |
        v
Generate Embedding
        |
        v
Compare Embeddings
        |
        v
Employee Recognized
        |
        v
Confirm Recognition
        |
        v
POST Attendance
        |
        v
Attendance Stored
Error Handling Examples

The backend handles situations such as:

Employee not found
EmployeeNotFoundException
Duplicate email
DuplicateEmailException
Attendance already exists
DuplicateAttendanceException
Attendance record not found
AttendanceNotFoundException

These exceptions are handled through the centralized exception handler.

Design Decisions
Why Spring Boot?

Spring Boot provides:

REST API development
Dependency injection
Spring Data JPA integration
Validation
Exception handling
Embedded server support
Why MySQL?

MySQL provides persistent relational storage for:

Employees
Attendance records
Why Python for face recognition?

The face-recognition component is separated from the Java backend because Python provides access to libraries such as:

InsightFace
OpenCV
ONNX Runtime

This keeps face-recognition processing independent from the business and database logic.

Why separate services?

The architecture separates responsibilities:

Spring Boot
    |
    +-- Business logic
    +-- Database
    +-- REST APIs
    +-- Employee management
    +-- Attendance management

Python
    |
    +-- Face detection
    +-- Face embeddings
    +-- Face matching
    +-- Webcam processing

This makes the system easier to maintain and allows the recognition component to evolve independently.

Current Limitations

This project is primarily designed as a local development and portfolio project.

Current limitations include:

Face images are stored locally.
The Python recognition service runs locally.
MySQL is configured for local development.
The Flask development server is not intended for production deployment.
Recognition performance depends on lighting, camera quality, and face positioning.
The system currently uses a similarity threshold and confirmation count for recognition.
Production deployment would require additional security and infrastructure.
Future Improvements

Possible future improvements include:

JWT-based authentication
Role-based access control
Admin login
Cloud image storage
Docker containerization
Production WSGI server
Cloud deployment
Improved face anti-spoofing
Multiple-camera support
Attendance reports
CSV/PDF report generation
Email notifications
Improved recognition performance
Redis-based caching
CI/CD using GitHub Actions
Automated API testing
Production database configuration
Learning Outcomes

This project provided practical experience with:

Java 21
Spring Boot
REST API development
Spring Data JPA
Hibernate
MySQL
DTO architecture
Bean Validation
Exception handling
File upload handling
HTML/CSS/JavaScript
Browser camera access
Python
Flask
OpenCV
InsightFace
Face embeddings
Similarity matching
Multi-service application architecture
Git
GitHub
API testing with Postman

Author
Subrata Mallick
B.Tech — Electronics and Communication Engineering
Interested in software development, Java, full-stack development, and backend engineering.

Project Repository

GitHub:

https://github.com/MallickSayan407/face-attendance-system

Disclaimer

This project is developed for educational, demonstration, and portfolio purposes.

Employee face images and database credentials are intentionally excluded from the repository.