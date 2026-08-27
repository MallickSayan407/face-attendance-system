\# Face Attendance System



A full-stack employee attendance management system that uses face recognition to automatically identify registered employees and mark their attendance.



The project combines a Spring Boot backend, MySQL database, web-based frontend, and a Python-based face recognition service using InsightFace and OpenCV.



\---



\## Features



\- Employee registration and management

\- Employee face image upload

\- Face recognition using InsightFace

\- Real-time webcam-based face recognition

\- Automatic employee identification

\- Attendance marking after multiple recognition confirmations

\- Duplicate attendance prevention

\- Date-based attendance tracking

\- Attendance dashboard

\- Present and absent employee statistics

\- Attendance percentage calculation

\- REST APIs for employee and attendance management

\- DTO-based request and response handling

\- Input validation

\- Centralized exception handling

\- Separate Python face recognition service

\- Browser-based user interface



\---



\## System Architecture



```text

&#x20;                        ┌─────────────────────────┐

&#x20;                        │        Web Browser       │

&#x20;                        │                         │

&#x20;                        │ HTML / CSS / JavaScript  │

&#x20;                        └────────────┬────────────┘

&#x20;                                     │

&#x20;                        HTTP / REST  │

&#x20;                                     ▼

&#x20;                   ┌──────────────────────────────┐

&#x20;                   │       Spring Boot Backend    │

&#x20;                   │           Port 8080          │

&#x20;                   │                              │

&#x20;                   │ Employee REST APIs            │

&#x20;                   │ Attendance REST APIs          │

&#x20;                   │ File Upload                   │

&#x20;                   │ Validation \& Exception        │

&#x20;                   │ Handling                      │

&#x20;                   └──────────────┬───────────────┘

&#x20;                                  │

&#x20;                        JPA / Hibernate

&#x20;                                  │

&#x20;                                  ▼

&#x20;                   ┌──────────────────────────────┐

&#x20;                   │          MySQL Database       │

&#x20;                   │                              │

&#x20;                   │ Employee                     │

&#x20;                   │ Attendance                   │

&#x20;                   └──────────────────────────────┘



&#x20;                                     ▲

&#x20;                                     │

&#x20;                               REST / HTTP

&#x20;                                     │

&#x20;                                     ▼

&#x20;                   ┌──────────────────────────────┐

&#x20;                   │ Python Recognition Service   │

&#x20;                   │           Port 5000          │

&#x20;                   │                              │

&#x20;                   │ Flask                        │

&#x20;                   │ InsightFace                  │

&#x20;                   │ OpenCV                       │

&#x20;                   │ Face Embeddings              │

&#x20;                   │ Similarity Matching           │

&#x20;                   └──────────────┬───────────────┘

&#x20;                                  │

&#x20;                                  ▼

&#x20;                             Webcam Camera

```



\---



\## Project Structure



```text

face-attendance-system/

│

├── backend/

│   └── face-attendance-backend/

│       │

│       ├── src/

│       │   ├── main/

│       │   │   ├── java/com/sayan/faceattendance/

│       │   │   │   ├── controller/

│       │   │   │   ├── dto/

│       │   │   │   ├── entity/

│       │   │   │   ├── exception/

│       │   │   │   ├── repository/

│       │   │   │   └── service/

│       │   │   │

│       │   │   └── resources/

│       │   │       ├── static/

│       │   │       │   ├── index.html

│       │   │       │   ├── script.js

│       │   │       │   └── style.css

│       │   │       ├── application-example.properties

│       │   │       └── application.properties

│       │   │

│       │   └── test/

│       │

│       ├── build.gradle

│       ├── gradlew

│       └── gradlew.bat

│

├── face-recognition/

│   └── face-recognition-service/

│       ├── employee\_face\_loader.py

│       ├── face\_engine.py

│       ├── webcam\_recognition.py

│       ├── web\_recognition\_service.py

│       └── .gitignore

│

└── .gitignore

```



\---



\## Technology Stack



\### Backend



\- Java 21

\- Spring Boot

\- Spring Web

\- Spring Data JPA

\- Hibernate

\- Jakarta Bean Validation

\- Gradle

\- Lombok



\### Database



\- MySQL



\### Frontend



\- HTML5

\- CSS3

\- JavaScript



\### Face Recognition



\- Python

\- Flask

\- InsightFace

\- OpenCV

\- ONNX Runtime



\### Development Tools



\- Eclipse / Spring Tool Suite

\- MySQL Workbench

\- Postman

\- Git

\- GitHub



\---



\## Backend Architecture



The Spring Boot application follows a layered architecture:



```text

Controller

&#x20;   │

&#x20;   ▼

Service

&#x20;   │

&#x20;   ▼

Repository

&#x20;   │

&#x20;   ▼

MySQL Database

```



\### Controller Layer



Handles HTTP requests and exposes REST APIs.



Main controllers:



\- `EmployeeController`

\- `AttendanceController`



\### Service Layer



Contains application and business logic.



Main services:



\- `EmployeeService`

\- `AttendanceService`

\- `FileStorageService`



\### Repository Layer



Uses Spring Data JPA to communicate with MySQL.



\- `EmployeeRepository`

\- `AttendanceRepository`



\### Entity Layer



Main database entities:



\- `Employee`

\- `Attendance`



\### DTO Layer



DTOs are used to separate API request/response models from database entities.



Examples:



\- `EmployeeRequestDTO`

\- `EmployeeResponseDTO`

\- `AttendanceResponseDTO`

\- `AttendanceSummaryDTO`



\### Exception Handling



The application uses centralized exception handling through:



```text

GlobalExceptionHandler

```



Custom exceptions include:



\- `EmployeeNotFoundException`

\- `AttendanceNotFoundException`

\- `DuplicateEmailException`

\- `DuplicateAttendanceException`



\---



\## Face Recognition Workflow



```text

1\. Employee is registered

&#x20;         │

&#x20;         ▼

2\. Employee face image is uploaded

&#x20;         │

&#x20;         ▼

3\. Python service loads registered employees

&#x20;         │

&#x20;         ▼

4\. InsightFace generates face embeddings

&#x20;         │

&#x20;         ▼

5\. Webcam captures live video

&#x20;         │

&#x20;         ▼

6\. Face is detected

&#x20;         │

&#x20;         ▼

7\. Live face embedding is generated

&#x20;         │

&#x20;         ▼

8\. Embedding is compared with registered faces

&#x20;         │

&#x20;         ▼

9\. Similarity score is calculated

&#x20;         │

&#x20;         ▼

10\. Multiple confirmations are required

&#x20;         │

&#x20;         ▼

11\. Employee is recognized

&#x20;         │

&#x20;         ▼

12\. Attendance is marked through Spring Boot API

&#x20;         │

&#x20;         ▼

13\. Dashboard displays attendance information

```



\---



\## Face Recognition Logic



The Python recognition service uses InsightFace to generate numerical representations called \*\*face embeddings\*\*.



Each registered employee has a stored embedding.



When a face appears in front of the webcam:



1\. The face is detected.

2\. InsightFace generates an embedding for the detected face.

3\. The embedding is compared with registered employee embeddings.

4\. A similarity score is calculated.

5\. The highest matching employee is selected if the similarity exceeds the configured threshold.

6\. The system requires multiple consecutive confirmations before marking attendance.

7\. The recognized employee is sent to the Spring Boot backend.

8\. The backend records attendance in MySQL.



The current recognition configuration uses:



```text

Recognition threshold: 0.6

Required confirmations: 5

```



\---



\## REST API Overview



\### Employee APIs



Base URL:



```text

http://localhost:8080/api/employees

```



Used for employee management, including employee registration, retrieval, updating, deletion, and face image handling.



\### Attendance APIs



Base URL:



```text

http://localhost:8080/api/attendance

```



Used for:



\- Marking attendance

\- Retrieving attendance records

\- Retrieving attendance information for a selected date

\- Attendance summary statistics



\### Face Recognition API



Python recognition service:



```text

http://localhost:5000

```



The web recognition endpoint is:



```text

POST /recognize

```



The browser sends captured camera data to the Python service for recognition.



\---



\## Attendance Dashboard



The dashboard provides:



\- Total employees

\- Present employees

\- Absent employees

\- Attendance percentage

\- Date-based attendance filtering

\- Attendance records

\- Employee information

\- Attendance time and status



Example summary:



```json

{

&#x20; "date": "2026-08-26",

&#x20; "totalEmployees": 4,

&#x20; "presentEmployees": 4,

&#x20; "absentEmployees": 0,

&#x20; "attendancePercentage": 100.0

}

```



\---



\## Running the Project



The system consists of two applications that need to run together.



\### 1. Start MySQL



Make sure MySQL Server is running.



Create the database:



```sql

CREATE DATABASE face\_attendance\_db;

```



The Spring Boot application uses Hibernate to create/update the required tables.



\---



\### 2. Configure Spring Boot



Create:



```text

src/main/resources/application.properties

```



using the example configuration:



```text

src/main/resources/application-example.properties

```



Set your local MySQL credentials in `application.properties`.



Example:



```properties

spring.application.name=face-attendance-backend



spring.datasource.url=jdbc:mysql://localhost:3306/face\_attendance\_db

spring.datasource.username=root

spring.datasource.password=YOUR\_MYSQL\_PASSWORD



spring.jpa.hibernate.ddl-auto=update

spring.jpa.show-sql=true

spring.jpa.properties.hibernate.format\_sql=true



server.port=8080



file.upload-dir=uploads/employees

```



\*\*Do not commit `application.properties` because it contains local credentials.\*\*



\---



\### 3. Start the Spring Boot Backend



From:



```text

backend/face-attendance-backend

```



run:



```powershell

.\\gradlew bootRun

```



The backend starts at:



```text

http://localhost:8080

```



\---



\### 4. Set Up the Face Recognition Service



Navigate to:



```text

face-recognition/face-recognition-service

```



Create and activate a Python virtual environment:



```powershell

python -m venv venv

```



Activate it:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install the required Python dependencies according to the environment used for the project.



The face recognition service uses:



\- InsightFace

\- OpenCV

\- Flask

\- ONNX Runtime

\- NumPy

\- Requests



\---



\### 5. Start the Face Recognition Service



Run:



```powershell

python web\_recognition\_service.py

```



The service starts at:



```text

http://localhost:5000

```



The Spring Boot backend should already be running on:



```text

http://localhost:8080

```



\---



\### 6. Open the Web Application



Open:



```text

http://localhost:8080

```



The application provides:



```text

Dashboard

Employees

Scan Face

```



\---



\## Security



Sensitive and machine-specific files are excluded from Git.



The repository does not contain:



\- MySQL passwords

\- `application.properties`

\- Uploaded employee face images

\- Python virtual environment

\- Gradle build/cache files

\- IDE-specific generated files



A safe example configuration is provided through:



```text

application-example.properties

```



\---



\## Git Branching Strategy



The project uses two branches:



```text

main

│

└── Stable / presentable version



development

│

└── Active development and changes

```



Changes can be developed and tested on `development` before being merged into `main`.



\---



\## Current Project Status



\### Completed



\- Employee management

\- Employee image upload

\- MySQL database integration

\- Attendance management

\- Attendance dashboard

\- REST APIs

\- DTO-based architecture

\- Validation

\- Exception handling

\- Webcam integration

\- InsightFace integration

\- Face embedding generation

\- Face similarity matching

\- Recognition confirmation mechanism

\- Automatic attendance marking

\- Present/absent calculation

\- Python recognition web service

\- Git/GitHub repository setup



\### Future Improvements



\- Authentication and role-based access control

\- Improved face recognition accuracy

\- Anti-spoofing / liveness detection

\- Multiple face detection and recognition

\- Attendance export to CSV/Excel

\- Monthly attendance reports

\- Docker containerization

\- Production deployment

\- Cloud database integration

\- HTTPS configuration

\- Automated testing for the recognition service



\---



\## Author



\*\*Subrata Mallick\*\*



B.Tech – Electronics and Communication Engineering



Interested in Java, Spring Boot, Full-Stack Development, and AI/ML-based applications.



\---



\## License



This project is intended for educational and portfolio purposes.

