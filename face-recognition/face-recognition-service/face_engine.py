import cv2
import numpy as np
from insightface.app import FaceAnalysis


class FaceEngine:

    def __init__(self):

        print("Loading face recognition model...")

        self.app = FaceAnalysis(
            name="buffalo_s",
            providers=["CPUExecutionProvider"]
        )

        self.app.prepare(
            ctx_id=0,
            det_size=(640, 640)
        )

        print(
            "Face recognition model loaded successfully."
        )

    def get_faces(self, image):

        return self.app.get(image)

    def get_embedding(self, image):

        faces = self.get_faces(image)

        if len(faces) == 0:
            return None

        return faces[0].embedding


def cosine_similarity(
        embedding1,
        embedding2):

    embedding1 = (
        embedding1 /
        np.linalg.norm(embedding1)
    )

    embedding2 = (
        embedding2 /
        np.linalg.norm(embedding2)
    )

    return np.dot(
        embedding1,
        embedding2
    )


if __name__ == "__main__":

    engine = FaceEngine()

    registered_image_path = (
        r"C:\STS-workspace\face-attendance-backend"
        r"\uploads\employees\3.jpg"
    )

    registered_image = cv2.imread(
        registered_image_path
    )

    if registered_image is None:

        print(
            "ERROR: Could not load "
            "registered employee image."
        )

        exit()

    registered_embedding = (
        engine.get_embedding(
            registered_image
        )
    )

    if registered_embedding is None:

        print(
            "ERROR: No face found in "
            "registered employee image."
        )

        exit()

    print(
        "Registered face loaded successfully."
    )

    print(
        "Employee: Subrata Mallick"
    )

    print(
        "Employee ID: 3"
    )

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        print(
            "ERROR: Could not open webcam."
        )

        exit()

    print("\nWebcam started.")
    print("Press Q to quit.")

    while True:

        success, frame = camera.read()

        if not success:

            print(
                "ERROR: Could not read "
                "webcam frame."
            )

            break

        faces = engine.get_faces(frame)

        for face in faces:

            live_embedding = face.embedding

            similarity = cosine_similarity(
                registered_embedding,
                live_embedding
            )

            threshold = 0.45

            if similarity >= threshold:

                name = "Subrata Mallick"
                employee_id = "3"
                status = "MATCH"

            else:

                name = "Unknown"
                employee_id = "-"
                status = "UNKNOWN"

            bbox = face.bbox.astype(int)

            x1, y1, x2, y2 = bbox

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                status,
                (x1, y1 - 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                name,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Employee ID: {employee_id}",
                (x1, y2 + 25),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Similarity: {similarity:.3f}",
                (x1, y2 + 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )

        cv2.imshow(
            "Face Recognition - Attendance System",
            frame
        )

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()