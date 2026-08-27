import cv2
import numpy as np
import requests
import time

from insightface.app import FaceAnalysis


# ==========================================================
# API CONFIGURATION
# ==========================================================

EMPLOYEE_API = (
    "http://localhost:8080/api/employees"
)

ATTENDANCE_API = (
    "http://localhost:8080/api/attendance"
)


# ==========================================================
# FACE RECOGNITION CONFIGURATION
# ==========================================================

# Minimum similarity required to consider
# a face as a registered employee.
#
# 0.60 is intentionally stricter than the
# previous 0.45 threshold.

RECOGNITION_THRESHOLD = 0.60


# Number of consecutive matching frames
# required before attendance is marked.

CONFIRMATION_FRAMES = 5


# Minimum time between attendance API requests.

ATTENDANCE_COOLDOWN = 30


class WebcamRecognition:

    def __init__(self):

        # --------------------------------------------------
        # Load InsightFace
        # --------------------------------------------------

        print("Loading InsightFace model...")

        self.app = FaceAnalysis(
            name="buffalo_s",
            providers=["CPUExecutionProvider"]
        )

        self.app.prepare(
            ctx_id=0,
            det_size=(640, 640)
        )

        print(
            "InsightFace model loaded successfully."
        )


        # --------------------------------------------------
        # Load employees from Spring Boot
        # --------------------------------------------------

        self.employees = self.load_employees()


        # --------------------------------------------------
        # Recognition state
        # --------------------------------------------------

        self.last_recognized_employee = None

        self.consecutive_matches = 0

        self.last_attendance_time = 0


    # ======================================================
    # LOAD EMPLOYEES FROM SPRING BOOT
    # ======================================================

    def load_employees(self):

        print(
            "\nFetching employees from Spring Boot..."
        )

        try:

            response = requests.get(
                EMPLOYEE_API,
                timeout=10
            )

            response.raise_for_status()

        except requests.RequestException as error:

            print(
                "\nERROR: Could not connect to "
                "Spring Boot employee API."
            )

            print(error)

            return []


        employees = response.json()


        print(
            f"Employees received: "
            f"{len(employees)}"
        )


        registered_employees = []


        for employee in employees:

            employee_id = employee["employeeId"]

            name = employee["name"]

            image_path = employee["imagePath"]


            # --------------------------------------------------
            # Skip employees without images
            # --------------------------------------------------

            if not image_path:

                print(
                    f"Skipping Employee "
                    f"{employee_id} "
                    f"({name}) - no image"
                )

                continue


            print(
                f"\nLoading Employee "
                f"{employee_id}: "
                f"{name}"
            )


            # --------------------------------------------------
            # Load employee image
            # --------------------------------------------------

            image = cv2.imread(
                image_path
            )


            if image is None:

                print(
                    "WARNING: Could not load "
                    f"image for {name}"
                )

                print(
                    f"Image path: "
                    f"{image_path}"
                )

                continue


            # --------------------------------------------------
            # Detect face
            # --------------------------------------------------

            faces = self.app.get(
                image
            )


            if len(faces) == 0:

                print(
                    f"WARNING: No face found "
                    f"for {name}"
                )

                continue


            # --------------------------------------------------
            # Generate face embedding
            # --------------------------------------------------

            embedding = (
                faces[0].embedding
            )


            registered_employees.append({

                "employeeId":
                    employee_id,

                "name":
                    name,

                "email":
                    employee["email"],

                "department":
                    employee["department"],

                "designation":
                    employee["designation"],

                "imagePath":
                    image_path,

                "embedding":
                    embedding

            })


            print(
                f"Face registered successfully "
                f"for {name}"
            )


        print(
            f"\nTotal registered employees: "
            f"{len(registered_employees)}"
        )


        return registered_employees


    # ======================================================
    # COSINE SIMILARITY
    # ======================================================

    @staticmethod
    def cosine_similarity(
            embedding1,
            embedding2):

        embedding1 = (
            embedding1 /
            np.linalg.norm(
                embedding1
            )
        )


        embedding2 = (
            embedding2 /
            np.linalg.norm(
                embedding2
            )
        )


        return np.dot(
            embedding1,
            embedding2
        )


    # ======================================================
    # FIND BEST MATCH
    # ======================================================

    def find_best_match(
            self,
            live_embedding):

        best_employee = None

        best_similarity = -1


        for employee in self.employees:

            similarity = (
                self.cosine_similarity(
                    employee["embedding"],
                    live_embedding
                )
            )


            if similarity > best_similarity:

                best_similarity = similarity

                best_employee = employee


        # --------------------------------------------------
        # Apply recognition threshold
        # --------------------------------------------------

        if (
            best_employee is not None
            and
            best_similarity >=
            RECOGNITION_THRESHOLD
        ):

            return (
                best_employee,
                best_similarity
            )


        # No registered employee passed
        # the recognition threshold.

        return (
            None,
            best_similarity
        )


    # ======================================================
    # RESET RECOGNITION
    # ======================================================

    def reset_confirmation(self):

        self.last_recognized_employee = None

        self.consecutive_matches = 0


    # ======================================================
    # MARK ATTENDANCE
    # ======================================================

    def mark_attendance(
            self,
            employee_id):

        try:

            response = requests.post(
                ATTENDANCE_API,
                params={
                    "employeeId":
                        employee_id
                },
                timeout=10
            )

        except requests.RequestException as error:

            print(
                "\nERROR: Could not connect "
                "to Attendance API."
            )

            print(error)

            return False


        # --------------------------------------------------
        # 201 CREATED
        # --------------------------------------------------

        if response.status_code == 201:

            try:

                data = response.json()


                print(
                    "\n================================"
                )

                print(
                    "ATTENDANCE MARKED SUCCESSFULLY"
                )

                print(
                    f"Employee: "
                    f"{data['employeeName']}"
                )

                print(
                    f"Employee ID: "
                    f"{data['employeeId']}"
                )

                print(
                    f"Date: "
                    f"{data['attendanceDate']}"
                )

                print(
                    f"Time: "
                    f"{data['attendanceTime']}"
                )

                print(
                    f"Status: "
                    f"{data['status']}"
                )

                print(
                    "================================\n"
                )


            except (ValueError, KeyError):

                print(
                    "\nAttendance marked successfully."
                )


            return True


        # --------------------------------------------------
        # 409 CONFLICT
        # --------------------------------------------------

        elif response.status_code == 409:

            try:

                data = response.json()


                print(
                    "\n--------------------------------"
                )

                print(
                    "ATTENDANCE ALREADY MARKED"
                )

                print(
                    data.get(
                        "message",
                        "Attendance already exists."
                    )
                )

                print(
                    "--------------------------------\n"
                )


            except ValueError:

                print(
                    "\nAttendance already "
                    "marked today.\n"
                )


            return False


        # --------------------------------------------------
        # OTHER API ERROR
        # --------------------------------------------------

        else:

            print(
                "\nAttendance API error:"
            )

            print(
                f"HTTP Status: "
                f"{response.status_code}"
            )

            print(
                response.text
            )

            return False


    # ======================================================
    # START WEBCAM
    # ======================================================

    def start_camera(self):

        # --------------------------------------------------
        # Make sure registered employees exist
        # --------------------------------------------------

        if not self.employees:

            print(
                "\nERROR: No registered "
                "employee faces available."
            )

            return


        # --------------------------------------------------
        # Open webcam
        # --------------------------------------------------

        camera = cv2.VideoCapture(0)


        if not camera.isOpened():

            print(
                "\nERROR: Could not open webcam."
            )

            return


        print(
            "\nWebcam started."
        )

        print(
            "Press Q to quit."
        )

        print(
            "Look at the camera "
            "to test recognition."
        )

        print(
            f"Recognition threshold: "
            f"{RECOGNITION_THRESHOLD}"
        )


        # --------------------------------------------------
        # Main webcam loop
        # --------------------------------------------------

        while True:

            success, frame = (
                camera.read()
            )


            if not success:

                print(
                    "ERROR: Could not read "
                    "webcam frame."
                )

                break


            # --------------------------------------------------
            # Detect faces
            # --------------------------------------------------

            faces = self.app.get(
                frame
            )


            # --------------------------------------------------
            # If no faces are detected
            # --------------------------------------------------

            if len(faces) == 0:

                self.reset_confirmation()


            # --------------------------------------------------
            # Process detected faces
            # --------------------------------------------------

            for face in faces:

                live_embedding = (
                    face.embedding
                )


                employee, similarity = (
                    self.find_best_match(
                        live_embedding
                    )
                )


                # --------------------------------------------------
                # Face bounding box
                # --------------------------------------------------

                bbox = (
                    face.bbox.astype(int)
                )


                x1, y1, x2, y2 = bbox


                # ==================================================
                # REGISTERED EMPLOYEE
                # ==================================================

                if employee is not None:

                    employee_id = (
                        employee["employeeId"]
                    )


                    name = (
                        employee["name"]
                    )


                    # ----------------------------------------------
                    # Confirmation logic
                    # ----------------------------------------------

                    if (
                        self.last_recognized_employee
                        ==
                        employee_id
                    ):

                        self.consecutive_matches += 1

                    else:

                        self.last_recognized_employee = (
                            employee_id
                        )

                        self.consecutive_matches = 1


                    # ----------------------------------------------
                    # Cap confirmation at 5/5
                    # ----------------------------------------------

                    if (
                        self.consecutive_matches
                        >
                        CONFIRMATION_FRAMES
                    ):

                        self.consecutive_matches = (
                            CONFIRMATION_FRAMES
                        )


                    print(
                        f"MATCH -> "
                        f"{name} "
                        f"(ID: {employee_id}) "
                        f"Similarity: "
                        f"{similarity:.3f} "
                        f"Confirmation: "
                        f"{self.consecutive_matches}/"
                        f"{CONFIRMATION_FRAMES}"
                    )


                    # ----------------------------------------------
                    # Confirm identity
                    # ----------------------------------------------

                    if (
                        self.consecutive_matches
                        >=
                        CONFIRMATION_FRAMES
                    ):

                        current_time = (
                            time.time()
                        )


                        # ------------------------------------------
                        # Cooldown check
                        # ------------------------------------------

                        if (
                            current_time
                            -
                            self.last_attendance_time
                            >=
                            ATTENDANCE_COOLDOWN
                        ):

                            self.mark_attendance(
                                employee_id
                            )

                            self.last_attendance_time = (
                                current_time
                            )


                    status = "MATCH"

                    rectangle_color = (
                        0,
                        255,
                        0
                    )


                # ==================================================
                # UNKNOWN PERSON
                # ==================================================

                else:

                    employee_id = "-"

                    name = "UNKNOWN PERSON"

                    status = "UNKNOWN"

                    rectangle_color = (
                        0,
                        0,
                        255
                    )


                    # ----------------------------------------------
                    # Reset confirmation immediately
                    # ----------------------------------------------

                    self.reset_confirmation()


                    print(
                        f"UNKNOWN PERSON -> "
                        f"Best similarity: "
                        f"{similarity:.3f} "
                        f"(threshold: "
                        f"{RECOGNITION_THRESHOLD:.2f})"
                    )


                    print(
                        "No attendance marked."
                    )


                # ==================================================
                # DRAW FACE RECTANGLE
                # ==================================================

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    rectangle_color,
                    2
                )


                # ==================================================
                # STATUS
                # ==================================================

                cv2.putText(
                    frame,
                    status,
                    (x1, y1 - 45),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    rectangle_color,
                    2
                )


                # ==================================================
                # EMPLOYEE NAME
                # ==================================================

                cv2.putText(
                    frame,
                    name,
                    (x1, y1 - 15),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 255),
                    2
                )


                # ==================================================
                # EMPLOYEE ID
                # ==================================================

                cv2.putText(
                    frame,
                    f"Employee ID: {employee_id}",
                    (x1, y2 + 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2
                )


                # ==================================================
                # SIMILARITY
                # ==================================================

                cv2.putText(
                    frame,
                    f"Similarity: "
                    f"{similarity:.3f}",
                    (x1, y2 + 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2
                )


                # ==================================================
                # CONFIRMATION
                # ==================================================

                cv2.putText(
                    frame,
                    f"Confirmation: "
                    f"{self.consecutive_matches}/"
                    f"{CONFIRMATION_FRAMES}",
                    (x1, y2 + 75),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 255, 255),
                    2
                )


            # --------------------------------------------------
            # Display webcam
            # --------------------------------------------------

            cv2.imshow(
                "Face Recognition - Attendance System",
                frame
            )


            # --------------------------------------------------
            # Press Q to quit
            # --------------------------------------------------

            if (
                cv2.waitKey(1) & 0xFF
                == ord("q")
            ):

                break


        # --------------------------------------------------
        # Cleanup
        # --------------------------------------------------

        camera.release()

        cv2.destroyAllWindows()


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    recognition = WebcamRecognition()

    recognition.start_camera()