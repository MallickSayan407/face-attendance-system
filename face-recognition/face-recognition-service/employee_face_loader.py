import cv2
import requests
from insightface.app import FaceAnalysis


EMPLOYEE_API = "http://localhost:8080/api/employees"


class EmployeeFaceLoader:

    def __init__(self):

        print("Loading InsightFace model...")

        self.app = FaceAnalysis(
            name="buffalo_s",
            providers=["CPUExecutionProvider"]
        )

        self.app.prepare(
            ctx_id=0,
            det_size=(640, 640)
        )

        print("InsightFace model loaded successfully.")

    def load_employees(self):

        print("\nFetching employees from Spring Boot...")

        response = requests.get(
            EMPLOYEE_API,
            timeout=10
        )

        response.raise_for_status()

        employees = response.json()

        print(
            f"Employees received: {len(employees)}"
        )

        registered_faces = []

        for employee in employees:

            employee_id = employee["employeeId"]
            name = employee["name"]
            image_path = employee["imagePath"]

            if not image_path:

                print(
                    f"Skipping Employee {employee_id} "
                    f"({name}) - no image"
                )

                continue

            print(
                f"\nLoading Employee {employee_id}: {name}"
            )

            image = cv2.imread(image_path)

            if image is None:

                print(
                    f"WARNING: Could not load image: "
                    f"{image_path}"
                )

                continue

            faces = self.app.get(image)

            if len(faces) == 0:

                print(
                    f"WARNING: No face found for {name}"
                )

                continue

            embedding = faces[0].embedding

            registered_faces.append({
                "employeeId": employee_id,
                "name": name,
                "email": employee["email"],
                "department": employee["department"],
                "designation": employee["designation"],
                "imagePath": image_path,
                "embedding": embedding
            })

            print(
                f"Face registered successfully "
                f"for {name}"
            )

        return registered_faces


if __name__ == "__main__":

    loader = EmployeeFaceLoader()

    employees = loader.load_employees()

    print("\n==============================")
    print("REGISTERED FACE SUMMARY")
    print("==============================")

    for employee in employees:

        print(
            f"Employee ID: {employee['employeeId']}"
        )

        print(
            f"Name: {employee['name']}"
        )

        print(
            f"Department: {employee['department']}"
        )

        print(
            f"Designation: {employee['designation']}"
        )

        print(
            f"Embedding size: "
            f"{employee['embedding'].shape}"
        )

        print("------------------------------")

    print(
        f"Total registered faces: "
        f"{len(employees)}"
    )