import base64
import os

import cv2
import numpy as np
import requests

from flask import Flask, request, jsonify
from flask_cors import CORS

from insightface.app import FaceAnalysis


# ============================================================
# CONFIGURATION
# ============================================================

SPRING_BOOT_URL = "http://localhost:8080"

EMPLOYEE_API_URL = (
    f"{SPRING_BOOT_URL}/api/employees"
)

ATTENDANCE_API_URL = (
    f"{SPRING_BOOT_URL}/api/attendance"
)

RECOGNITION_THRESHOLD = 0.60

REQUIRED_CONFIRMATIONS = 5

IMAGE_SIZE = (640, 640)


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# FACE RECOGNITION MODEL
# ============================================================

print("Loading InsightFace model...")

face_app = FaceAnalysis(
    name="buffalo_s",
    providers=["CPUExecutionProvider"]
)

face_app.prepare(
    ctx_id=0,
    det_size=IMAGE_SIZE
)

print("InsightFace model loaded successfully.")


# ============================================================
# REGISTERED EMPLOYEES
# ============================================================

registered_faces = []


# ============================================================
# CONFIRMATION STATE
# ============================================================

confirmation_employee_id = None

confirmation_count = 0

attendance_marked_employee_id = None


# ============================================================
# LOAD EMPLOYEES FROM SPRING BOOT
# ============================================================

def load_employee_faces():

    global registered_faces

    print()
    print("Fetching employees from Spring Boot...")

    try:

        response = requests.get(
            EMPLOYEE_API_URL,
            timeout=10
        )

        response.raise_for_status()

        employees = response.json()

    except Exception as error:

        print(
            "ERROR: Could not fetch employees "
            f"from Spring Boot: {error}"
        )

        return False

    print(
        f"Employees received: {len(employees)}"
    )

    registered_faces = []

    for employee in employees:

        employee_id = employee.get(
            "employeeId"
        )

        employee_name = employee.get(
            "name"
        )

        image_path = employee.get(
            "imagePath"
        )

        if not image_path:

            print(
                f"Skipping Employee {employee_id} "
                f"({employee_name}) - no image"
            )

            continue

        print()
        print(
            f"Loading Employee {employee_id}: "
            f"{employee_name}"
        )

        # ----------------------------------------------------
        # Normalize Windows path
        # ----------------------------------------------------

        image_path = os.path.normpath(
            image_path
        )

        if not os.path.exists(image_path):

            print(
                "Skipping employee - image not found:"
            )

            print(image_path)

            continue

        # ----------------------------------------------------
        # Read image
        # ----------------------------------------------------

        image = cv2.imread(
            image_path
        )

        if image is None:

            print(
                "Skipping employee - "
                "could not read image."
            )

            continue

        # ----------------------------------------------------
        # Detect face
        # ----------------------------------------------------

        try:

            faces = face_app.get(
                image
            )

        except Exception as error:

            print(
                f"Face detection failed for "
                f"{employee_name}: {error}"
            )

            continue

        if not faces:

            print(
                f"No face detected for "
                f"{employee_name}"
            )

            continue

        # ----------------------------------------------------
        # Select largest face
        # ----------------------------------------------------

        face = max(
            faces,
            key=lambda item:
                (
                    item.bbox[2] - item.bbox[0]
                )
                *
                (
                    item.bbox[3] - item.bbox[1]
                )
        )

        # ----------------------------------------------------
        # Get normalized embedding
        # ----------------------------------------------------

        embedding = face.normed_embedding

        if embedding is None:

            print(
                f"Could not create embedding "
                f"for {employee_name}"
            )

            continue

        registered_faces.append(
            {
                "employeeId": employee_id,
                "name": employee_name,
                "email": employee.get("email"),
                "department": employee.get(
                    "department"
                ),
                "designation": employee.get(
                    "designation"
                ),
                "embedding": embedding
            }
        )

        print(
            f"Face registered successfully "
            f"for {employee_name}"
        )

    print()
    print(
        "================================"
    )

    print(
        "REGISTERED EMPLOYEES"
    )

    print(
        "================================"
    )

    for employee in registered_faces:

        print(
            f"Employee ID: "
            f"{employee['employeeId']}"
        )

        print(
            f"Name: "
            f"{employee['name']}"
        )

        print(
            f"Embedding size: "
            f"{employee['embedding'].shape}"
        )

        print(
            "--------------------------------"
        )

    print(
        "Total registered employees: "
        f"{len(registered_faces)}"
    )

    print()

    return True


# ============================================================
# FACE SIMILARITY
# ============================================================

def calculate_similarity(
    embedding1,
    embedding2
):

    return float(
        np.dot(
            embedding1,
            embedding2
        )
    )


# ============================================================
# FIND BEST MATCH
# ============================================================

def find_best_match(
    face_embedding
):

    if not registered_faces:

        return None, 0.0

    best_employee = None

    best_similarity = -1.0

    for employee in registered_faces:

        similarity = calculate_similarity(
            face_embedding,
            employee["embedding"]
        )

        if similarity > best_similarity:

            best_similarity = similarity

            best_employee = employee

    return (
        best_employee,
        best_similarity
    )


# ============================================================
# MARK ATTENDANCE
# ============================================================

def mark_attendance(
    employee_id
):

    print()
    print(
        "Calling Spring Boot attendance API..."
    )

    print(
        f"Employee ID: {employee_id}"
    )

    try:

        response = requests.post(
            ATTENDANCE_API_URL,
            params={
                "employeeId": employee_id
            },
            timeout=10
        )

        # ----------------------------------------------------
        # Attendance marked successfully
        # ----------------------------------------------------

        if response.status_code == 201:

            data = response.json()

            print(
                "ATTENDANCE MARKED SUCCESSFULLY"
            )

            print(
                f"Employee: "
                f"{data.get('employeeName', '')}"
            )

            print(
                f"Employee ID: "
                f"{data.get('employeeId', '')}"
            )

            print(
                f"Date: "
                f"{data.get('attendanceDate', '')}"
            )

            print(
                f"Time: "
                f"{data.get('attendanceTime', '')}"
            )

            print(
                f"Status: "
                f"{data.get('status', '')}"
            )

            return {
                "success": True,
                "alreadyMarked": False,
                "data": data
            }

        # ----------------------------------------------------
        # Attendance already marked
        # ----------------------------------------------------

        if response.status_code == 409:

            try:

                data = response.json()

            except Exception:

                data = {
                    "message":
                        "Attendance already marked."
                }

            print(
                "ATTENDANCE ALREADY MARKED"
            )

            print(
                data.get(
                    "message",
                    "Attendance already marked."
                )
            )

            return {
                "success": True,
                "alreadyMarked": True,
                "data": data
            }

        # ----------------------------------------------------
        # Other error
        # ----------------------------------------------------

        try:

            data = response.json()

        except Exception:

            data = {
                "message":
                    response.text
            }

        print(
            "Attendance API failed."
        )

        print(
            f"Status: {response.status_code}"
        )

        print(
            data
        )

        return {
            "success": False,
            "alreadyMarked": False,
            "data": data
        }

    except Exception as error:

        print(
            "ERROR calling attendance API:"
        )

        print(error)

        return {
            "success": False,
            "alreadyMarked": False,
            "data": {
                "message": str(error)
            }
        }


# ============================================================
# RECOGNITION ENDPOINT
# ============================================================

@app.post("/recognize")
def recognize_face():

    global confirmation_employee_id
    global confirmation_count
    global attendance_marked_employee_id

    # ========================================================
    # GET IMAGE FROM REQUEST
    # ========================================================

    image_bytes = None

    # --------------------------------------------------------
    # OPTION 1: multipart/form-data
    # --------------------------------------------------------

    image_file = request.files.get(
        "image"
    )

    if image_file is not None:

        try:

            image_bytes = image_file.read()

        except Exception as error:

            return jsonify({
                "recognized": False,
                "status": "ERROR",
                "message":
                    f"Could not read uploaded image: "
                    f"{error}"
            }), 400

    # --------------------------------------------------------
    # OPTION 2: JSON / base64 image
    # --------------------------------------------------------

    if image_bytes is None:

        try:

            data = request.get_json(
                silent=True
            )

        except Exception:

            data = None

        if data:

            image_data = (
                data.get("image")
                or data.get("imageData")
                or data.get("frame")
            )

            if image_data:

                try:

                    # Remove data URL prefix.
                    #
                    # Example:
                    #
                    # data:image/jpeg;base64,/9j/4AAQ...
                    #

                    if "," in image_data:

                        image_data = image_data.split(
                            ",",
                            1
                        )[1]

                    image_bytes = base64.b64decode(
                        image_data
                    )

                except Exception as error:

                    return jsonify({
                        "recognized": False,
                        "status": "ERROR",
                        "message":
                            f"Invalid base64 image: "
                            f"{error}"
                    }), 400

    # --------------------------------------------------------
    # No image received
    # --------------------------------------------------------

    if image_bytes is None:

        return jsonify({
            "recognized": False,
            "status": "NO_IMAGE",
            "message":
                "No image received. Send an image "
                "using multipart field 'image' or "
                "JSON field 'image'."
        }), 400

    # ========================================================
    # CONVERT IMAGE TO OPENCV
    # ========================================================

    try:

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8
        )

        frame = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

    except Exception as error:

        return jsonify({
            "recognized": False,
            "status": "ERROR",
            "message":
                f"Invalid image: {error}"
        }), 400

    if frame is None:

        return jsonify({
            "recognized": False,
            "status": "ERROR",
            "message":
                "Could not decode image."
        }), 400

    # ========================================================
    # DETECT FACES
    # ========================================================

    try:

        faces = face_app.get(
            frame
        )

    except Exception as error:

        return jsonify({
            "recognized": False,
            "status": "ERROR",
            "message":
                f"Face detection failed: "
                f"{error}"
        }), 500

    # ========================================================
    # NO FACE
    # ========================================================

    if not faces:

        confirmation_employee_id = None

        confirmation_count = 0

        return jsonify({
            "recognized": False,
            "status": "NO_FACE",
            "message":
                "No face detected.",
            "similarity": 0.0,
            "confirmation": 0,
            "requiredConfirmations":
                REQUIRED_CONFIRMATIONS,
            "attendanceMarked": False
        })

    # ========================================================
    # SELECT LARGEST FACE
    # ========================================================

    face = max(
        faces,
        key=lambda item:
            (
                item.bbox[2] - item.bbox[0]
            )
            *
            (
                item.bbox[3] - item.bbox[1]
            )
    )

    # ========================================================
    # GET FACE EMBEDDING
    # ========================================================

    face_embedding = face.normed_embedding

    if face_embedding is None:

        confirmation_employee_id = None

        confirmation_count = 0

        return jsonify({
            "recognized": False,
            "status": "ERROR",
            "message":
                "Could not generate "
                "face embedding.",
            "attendanceMarked": False
        })

    # ========================================================
    # FIND BEST EMPLOYEE MATCH
    # ========================================================

    best_employee, best_similarity = (
        find_best_match(
            face_embedding
        )
    )

    best_similarity = round(
        best_similarity,
        3
    )

    # ========================================================
    # UNKNOWN PERSON
    # ========================================================

    if (
        best_employee is None
        or best_similarity <
            RECOGNITION_THRESHOLD
    ):

        confirmation_employee_id = None

        confirmation_count = 0

        print(
            "UNKNOWN PERSON -> "
            f"Best similarity: "
            f"{best_similarity:.3f}"
        )

        return jsonify({
            "recognized": False,
            "status": "UNKNOWN",
            "employeeId": None,
            "employeeName":
                "UNKNOWN PERSON",
            "similarity":
                best_similarity,
            "threshold":
                RECOGNITION_THRESHOLD,
            "confirmation": 0,
            "requiredConfirmations":
                REQUIRED_CONFIRMATIONS,
            "attendanceMarked": False
        })

    # ========================================================
    # MATCH FOUND
    # ========================================================

    employee_id = best_employee[
        "employeeId"
    ]

    employee_name = best_employee[
        "name"
    ]

    # ========================================================
    # CONFIRMATION LOGIC
    # ========================================================

    if (
        confirmation_employee_id
        != employee_id
    ):

        confirmation_employee_id = (
            employee_id
        )

        confirmation_count = 1

    else:

        if (
            confirmation_count
            < REQUIRED_CONFIRMATIONS
        ):

            confirmation_count += 1

    print(
        "MATCH -> "
        f"{employee_name} "
        f"(ID: {employee_id}) "
        f"Similarity: "
        f"{best_similarity:.3f} "
        f"Confirmation: "
        f"{confirmation_count}/"
        f"{REQUIRED_CONFIRMATIONS}"
    )

    # ========================================================
    # ATTENDANCE ALREADY PROCESSED
    # ========================================================

    if (
        attendance_marked_employee_id
        == employee_id
    ):

        return jsonify({
            "recognized": True,
            "status":
                "ATTENDANCE_ALREADY_PROCESSED",
            "employeeId":
                employee_id,
            "employeeName":
                employee_name,
            "similarity":
                best_similarity,
            "confirmation":
                REQUIRED_CONFIRMATIONS,
            "requiredConfirmations":
                REQUIRED_CONFIRMATIONS,
            "attendanceMarked": True
        })

    # ========================================================
    # FIVE CONFIRMATIONS REACHED
    # ========================================================

    if (
        confirmation_count
        >= REQUIRED_CONFIRMATIONS
    ):

        attendance_result = (
            mark_attendance(
                employee_id
            )
        )

        # ----------------------------------------------------
        # Attendance API succeeded
        # ----------------------------------------------------

        if attendance_result[
            "success"
        ]:

            attendance_marked_employee_id = (
                employee_id
            )

            # ------------------------------------------------
            # Already marked in Spring Boot
            # ------------------------------------------------

            if attendance_result[
                "alreadyMarked"
            ]:

                return jsonify({
                    "recognized": True,
                    "status":
                        "ATTENDANCE_ALREADY_MARKED",
                    "employeeId":
                        employee_id,
                    "employeeName":
                        employee_name,
                    "similarity":
                        best_similarity,
                    "confirmation":
                        REQUIRED_CONFIRMATIONS,
                    "requiredConfirmations":
                        REQUIRED_CONFIRMATIONS,
                    "attendanceMarked":
                        True,
                    "attendance":
                        attendance_result[
                            "data"
                        ]
                })

            # ------------------------------------------------
            # Newly marked
            # ------------------------------------------------

            return jsonify({
                "recognized": True,
                "status":
                    "ATTENDANCE_MARKED",
                "employeeId":
                    employee_id,
                "employeeName":
                    employee_name,
                "similarity":
                    best_similarity,
                "confirmation":
                    REQUIRED_CONFIRMATIONS,
                "requiredConfirmations":
                    REQUIRED_CONFIRMATIONS,
                "attendanceMarked":
                    True,
                "attendance":
                    attendance_result[
                        "data"
                    ]
            })

        # ----------------------------------------------------
        # Attendance API failed
        # ----------------------------------------------------

        return jsonify({
            "recognized": True,
            "status":
                "ATTENDANCE_ERROR",
            "employeeId":
                employee_id,
            "employeeName":
                employee_name,
            "similarity":
                best_similarity,
            "confirmation":
                confirmation_count,
            "requiredConfirmations":
                REQUIRED_CONFIRMATIONS,
            "attendanceMarked":
                False,
            "attendance":
                attendance_result[
                    "data"
                ]
        })

    # ========================================================
    # STILL CONFIRMING
    # ========================================================

    return jsonify({
        "recognized": True,
        "status":
            "CONFIRMING",
        "employeeId":
            employee_id,
        "employeeName":
            employee_name,
        "similarity":
            best_similarity,
        "confirmation":
            confirmation_count,
        "requiredConfirmations":
            REQUIRED_CONFIRMATIONS,
        "attendanceMarked":
            False
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return jsonify({
        "status": "UP",
        "service":
            "Face Recognition Service",
        "registeredEmployees":
            len(registered_faces),
        "recognitionThreshold":
            RECOGNITION_THRESHOLD,
        "requiredConfirmations":
            REQUIRED_CONFIRMATIONS
    })


# ============================================================
# START SERVICE
# ============================================================

if __name__ == "__main__":

    print()

    print(
        "================================"
    )

    print(
        "FACE RECOGNITION WEB SERVICE"
    )

    print(
        "================================"
    )

    if not load_employee_faces():

        print()

        print(
            "WARNING: Employee faces could "
            "not be loaded."
        )

    print()

    print(
        "Recognition threshold: "
        f"{RECOGNITION_THRESHOLD}"
    )

    print(
        "Required confirmations: "
        f"{REQUIRED_CONFIRMATIONS}"
    )

    print()

    print(
        "Starting recognition API..."
    )

    print(
        "URL: http://localhost:5000"
    )

    print()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )