// ============================================================
// FACE ATTENDANCE SYSTEM - MAIN JAVASCRIPT
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = "";
const RECOGNITION_API_URL = "http://localhost:5000";

let allEmployees = [];


// ============================================================
// CAMERA / RECOGNITION STATE
// ============================================================

let cameraStream = null;
let recognitionTimer = null;
let recognitionInProgress = false;
let cameraRunning = false;
let recognitionCanvas = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("========================================");
    console.log("Face Attendance System initializing...");
    console.log("========================================");

    initializeDate();

    setupNavigation();

    setupAttendanceEvents();

    setupEmployeeEvents();

    setupCameraEvents();

    loadInitialDashboard();

    console.log("Face Attendance System initialized.");

});


// ============================================================
// DATE
// ============================================================

function initializeDate() {

    const dateInput =
        document.getElementById("attendanceDate");

    if (!dateInput) {
        console.warn("attendanceDate element not found.");
        return;
    }

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    const today =
        `${year}-${month}-${day}`;

    dateInput.value = today;

    console.log("Selected attendance date:", today);
}


// ============================================================
// INITIAL DASHBOARD LOAD
// ============================================================

function loadInitialDashboard() {

    const dateInput =
        document.getElementById("attendanceDate");

    if (!dateInput) {
        return;
    }

    if (!dateInput.value) {
        initializeDate();
    }

    if (dateInput.value) {
        loadDashboard(dateInput.value);
    }
}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".nav-button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const sectionId =
                button.dataset.section;

            console.log(
                "Navigation:",
                sectionId
            );

            // Stop camera if leaving Scan Face
            if (sectionId !== "scanSection") {
                stopCamera();
            }

            // Remove active nav state
            document
                .querySelectorAll(".nav-button")
                .forEach(item => {
                    item.classList.remove("active");
                });

            // Hide all sections
            document
                .querySelectorAll(".page-section")
                .forEach(section => {
                    section.classList.remove(
                        "active-section"
                    );
                });

            // Activate clicked button
            button.classList.add("active");

            // Activate section
            const section =
                document.getElementById(sectionId);

            if (section) {

                section.classList.add(
                    "active-section"
                );

            }

            // Employees page
            if (sectionId === "employeesSection") {

                loadEmployees();

            }

            // Dashboard page
            if (sectionId === "dashboardSection") {

                const dateInput =
                    document.getElementById(
                        "attendanceDate"
                    );

                if (
                    dateInput &&
                    dateInput.value
                ) {

                    loadDashboard(
                        dateInput.value
                    );

                }

            }

        });

    });

}


// ============================================================
// ATTENDANCE EVENTS
// ============================================================

function setupAttendanceEvents() {

    const dateInput =
        document.getElementById(
            "attendanceDate"
        );

    if (dateInput) {

        dateInput.addEventListener(
            "change",
            () => {

                if (!dateInput.value) {
                    return;
                }

                console.log(
                    "Date changed:",
                    dateInput.value
                );

                loadDashboard(
                    dateInput.value
                );

            }
        );

    }


    const refreshButton =
        document.getElementById(
            "refreshAttendanceButton"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => {

                const dateInput =
                    document.getElementById(
                        "attendanceDate"
                    );

                if (
                    !dateInput ||
                    !dateInput.value
                ) {
                    return;
                }

                console.log(
                    "Refreshing attendance..."
                );

                loadDashboard(
                    dateInput.value
                );

            }
        );

    }

}


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard(date) {

    if (!date) {

        console.error(
            "Cannot load dashboard: date is empty."
        );

        return;

    }

    console.log(
        "Loading dashboard for:",
        date
    );

    try {

        // Load separately.
        // If table fails, summary can still load.
        await loadSummary(date);

        await loadAttendance(date);

        console.log(
            "Dashboard loaded successfully."
        );

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showMessage(
            "Unable to load attendance data."
        );

    }

}


// ============================================================
// LOAD ATTENDANCE SUMMARY
// ============================================================

async function loadSummary(date) {

    const url =
        `${API_BASE_URL}/api/attendance/summary/${date}`;

    console.log(
        "GET:",
        url
    );

    const response =
        await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

    if (!response.ok) {

        throw new Error(
            `Summary API returned HTTP ${response.status}`
        );

    }

    const summary =
        await response.json();

    console.log(
        "Attendance summary:",
        summary
    );


    // Total employees

    const totalEmployees =
        document.getElementById(
            "totalEmployees"
        );

    if (totalEmployees) {

        totalEmployees.textContent =
            summary.totalEmployees ?? 0;

    }


    // Present

    const presentEmployees =
        document.getElementById(
            "presentEmployees"
        );

    if (presentEmployees) {

        presentEmployees.textContent =
            summary.presentEmployees ?? 0;

    }


    // Absent

    const absentEmployees =
        document.getElementById(
            "absentEmployees"
        );

    if (absentEmployees) {

        absentEmployees.textContent =
            summary.absentEmployees ?? 0;

    }


    // Attendance percentage

    const attendancePercentage =
        document.getElementById(
            "attendancePercentage"
        );

    if (attendancePercentage) {

        const percentage =
            Number(
                summary.attendancePercentage ?? 0
            );

        attendancePercentage.textContent =
            `${percentage}%`;

    }

}


// ============================================================
// LOAD ATTENDANCE TABLE
// ============================================================

async function loadAttendance(date) {

    const url =
        `${API_BASE_URL}/api/attendance/date/${date}`;

    console.log(
        "GET:",
        url
    );

    const response =
        await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

    if (!response.ok) {

        throw new Error(
            `Attendance API returned HTTP ${response.status}`
        );

    }

    const attendance =
        await response.json();

    console.log(
        "Attendance records:",
        attendance
    );

    renderAttendanceTable(
        attendance
    );

}


// ============================================================
// RENDER ATTENDANCE TABLE
// ============================================================

function renderAttendanceTable(
    attendance
) {

    const tableBody =
        document.getElementById(
            "attendanceTableBody"
        );

    if (!tableBody) {

        console.warn(
            "attendanceTableBody not found."
        );

        return;

    }

    tableBody.innerHTML = "";


    if (
        !Array.isArray(attendance) ||
        attendance.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No attendance records
                    found for this date.
                </td>
            </tr>
        `;

        return;

    }


    attendance.forEach(record => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${record.employeeId ?? "-"}
            </td>

            <td>
                ${escapeHtml(
                    record.employeeName
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.email
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.department
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.designation
                )}
            </td>

            <td>
                ${escapeHtml(
                    record.attendanceTime
                )}
            </td>

            <td>
                <span class="status">
                    ${escapeHtml(
                        record.status
                    )}
                </span>
            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ============================================================
// EMPLOYEE EVENTS
// ============================================================

function setupEmployeeEvents() {

    const showAddButton =
        document.getElementById(
            "showAddEmployeeButton"
        );

    if (showAddButton) {

        showAddButton.addEventListener(
            "click",
            openEmployeeModal
        );

    }


    const closeButton =
        document.getElementById(
            "closeEmployeeModal"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEmployeeModal
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelEmployeeButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeEmployeeModal
        );

    }


    const employeeForm =
        document.getElementById(
            "employeeForm"
        );

    if (employeeForm) {

        employeeForm.addEventListener(
            "submit",
            createEmployee
        );

    }


    const refreshEmployeesButton =
        document.getElementById(
            "refreshEmployeesButton"
        );

    if (refreshEmployeesButton) {

        refreshEmployeesButton.addEventListener(
            "click",
            loadEmployees
        );

    }


    const employeeSearch =
        document.getElementById(
            "employeeSearch"
        );

    if (employeeSearch) {

        employeeSearch.addEventListener(
            "input",
            filterEmployees
        );

    }

}


// ============================================================
// LOAD EMPLOYEES
// ============================================================

async function loadEmployees() {

    console.log(
        "Loading employees..."
    );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/employees`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `Employee API returned HTTP ${response.status}`
            );

        }

        allEmployees =
            await response.json();

        console.log(
            "Employees:",
            allEmployees
        );

        renderEmployeeTable(
            allEmployees
        );

    } catch (error) {

        console.error(
            "Employee loading error:",
            error
        );

        const tableBody =
            document.getElementById(
                "employeeTableBody"
            );

        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;"
                    >
                        Unable to load employees.
                    </td>
                </tr>
            `;

        }

    }

}


// ============================================================
// RENDER EMPLOYEES
// ============================================================

function renderEmployeeTable(
    employees
) {

    const tableBody =
        document.getElementById(
            "employeeTableBody"
        );

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";


    if (
        !Array.isArray(employees) ||
        employees.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="text-align:center;"
                >
                    No employees found.
                </td>
            </tr>
        `;

        return;

    }


    employees.forEach(employee => {

        const row =
            document.createElement("tr");


        let imageStatus = "";


        if (employee.imagePath) {

            imageStatus = `
                <span
                    class="image-status image-present"
                >
                    Registered
                </span>
            `;

        } else {

            imageStatus = `
                <button
                    class="upload-button"
                    onclick="openImageUpload(
                        ${employee.employeeId},
                        '${escapeJs(employee.name)}'
                    )"
                >
                    Upload Image
                </button>
            `;

        }


        row.innerHTML = `

            <td>
                ${employee.employeeId}
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        employee.name
                    )}
                </strong>
            </td>

            <td>
                ${escapeHtml(
                    employee.email
                )}
            </td>

            <td>
                ${escapeHtml(
                    employee.department
                )}
            </td>

            <td>
                ${escapeHtml(
                    employee.designation
                )}
            </td>

            <td>
                ${imageStatus}
            </td>

            <td>

                <button
                    class="danger-button"
                    onclick="deleteEmployee(
                        ${employee.employeeId},
                        '${escapeJs(employee.name)}'
                    )"
                >
                    Delete
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ============================================================
// EMPLOYEE SEARCH
// ============================================================

function filterEmployees() {

    const searchInput =
        document.getElementById(
            "employeeSearch"
        );

    if (!searchInput) {
        return;
    }

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtered =
        allEmployees.filter(employee => {

            return (

                String(
                    employee.name ?? ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    employee.email ?? ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    employee.department ?? ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    employee.designation ?? ""
                )
                    .toLowerCase()
                    .includes(search)

            );

        });


    renderEmployeeTable(
        filtered
    );

}


// ============================================================
// EMPLOYEE MODAL
// ============================================================

function openEmployeeModal() {

    const modal =
        document.getElementById(
            "employeeModal"
        );

    if (modal) {

        modal.classList.add(
            "show"
        );

    }


    const form =
        document.getElementById(
            "employeeForm"
        );

    if (form) {

        form.reset();

    }


    const message =
        document.getElementById(
            "employeeFormMessage"
        );

    if (message) {

        message.className =
            "form-message";

        message.textContent =
            "";

    }

}


function closeEmployeeModal() {

    const modal =
        document.getElementById(
            "employeeModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// ============================================================
// CREATE EMPLOYEE
// ============================================================

async function createEmployee(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "employeeFormMessage"
        );


    if (message) {

        message.className =
            "form-message";

        message.textContent =
            "Creating employee...";

    }


    const employeeData = {

        name:
            document
                .getElementById(
                    "employeeName"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "employeeEmail"
                )
                .value
                .trim(),

        department:
            document
                .getElementById(
                    "employeeDepartment"
                )
                .value
                .trim(),

        designation:
            document
                .getElementById(
                    "employeeDesignation"
                )
                .value
                .trim()

    };


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/employees`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            employeeData
                        )

                }
            );


        if (!response.ok) {

            const error =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );

            throw new Error(
                error.message ||
                "Failed to create employee."
            );

        }


        const employee =
            await response.json();


        const imageInput =
            document.getElementById(
                "employeeImage"
            );


        if (
            imageInput &&
            imageInput.files.length > 0
        ) {

            if (message) {

                message.textContent =
                    "Employee created. Uploading face image...";

            }


            await uploadEmployeeImage(
                employee.employeeId,
                imageInput.files[0]
            );

        }


        if (message) {

            message.className =
                "form-message success";

            message.textContent =
                "Employee created successfully.";

        }


        setTimeout(
            async () => {

                closeEmployeeModal();

                await loadEmployees();

                const dateInput =
                    document.getElementById(
                        "attendanceDate"
                    );

                if (
                    dateInput &&
                    dateInput.value
                ) {

                    loadDashboard(
                        dateInput.value
                    );

                }

            },
            800
        );


    } catch (error) {

        console.error(
            "Create employee error:",
            error
        );


        if (message) {

            message.className =
                "form-message error";

            message.textContent =
                error.message;

        }

    }

}


// ============================================================
// IMAGE UPLOAD
// ============================================================

function openImageUpload(
    employeeId,
    employeeName
) {

    const fileInput =
        document.createElement(
            "input"
        );

    fileInput.type =
        "file";

    fileInput.accept =
        "image/*";

    fileInput.style.display =
        "none";


    document.body.appendChild(
        fileInput
    );


    fileInput.addEventListener(
        "change",
        async () => {

            if (
                !fileInput.files ||
                fileInput.files.length === 0
            ) {

                fileInput.remove();

                return;

            }


            const image =
                fileInput.files[0];


            try {

                showMessage(
                    `Uploading face image for ${employeeName}...`
                );


                await uploadEmployeeImage(
                    employeeId,
                    image
                );


                showMessage(
                    "Face image uploaded successfully."
                );


                await loadEmployees();


            } catch (error) {

                console.error(
                    error
                );

                showMessage(
                    error.message
                );


            } finally {

                fileInput.remove();

            }

        }
    );


    fileInput.click();

}


// ============================================================
// UPLOAD EMPLOYEE IMAGE
// ============================================================

async function uploadEmployeeImage(
    employeeId,
    image
) {

    const formData =
        new FormData();


    formData.append(
        "image",
        image
    );


    const response =
        await fetch(
            `${API_BASE_URL}/api/employees/${employeeId}/image`,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const error =
            await response
                .json()
                .catch(
                    () => ({})
                );


        throw new Error(
            error.message ||
            "Failed to upload face image."
        );

    }


    return await response.text();

}


// ============================================================
// DELETE EMPLOYEE
// ============================================================

async function deleteEmployee(
    employeeId,
    employeeName
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete ${employeeName}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/employees/${employeeId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const error =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            throw new Error(
                error.message ||
                "Failed to delete employee."
            );

        }


        alert(
            `${employeeName} deleted successfully.`
        );


        await loadEmployees();


        const dateInput =
            document.getElementById(
                "attendanceDate"
            );


        if (
            dateInput &&
            dateInput.value
        ) {

            await loadDashboard(
                dateInput.value
            );

        }


    } catch (error) {

        console.error(
            "Delete employee error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ============================================================
// CAMERA EVENTS
// ============================================================

function setupCameraEvents() {

    const startButton =
        document.getElementById(
            "startCameraButton"
        );

    const stopButton =
        document.getElementById(
            "stopCameraButton"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            startCamera
        );

    }


    if (stopButton) {

        stopButton.addEventListener(
            "click",
            stopCamera
        );

    }


    updateCameraUI(
        false
    );

}


// ============================================================
// START CAMERA
// ============================================================

async function startCamera() {

    if (cameraRunning) {
        return;
    }


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (!video) {

        console.error(
            "cameraVideo element not found."
        );

        return;

    }


    try {

        // --------------------------------------------------------
        // Browser support
        // --------------------------------------------------------

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Camera access is not supported by this browser."
            );

        }


        // --------------------------------------------------------
        // Check Python service
        // --------------------------------------------------------

        setRecognitionStatus(
            "Checking recognition service...",
            "unknown"
        );


        try {

            const healthResponse =
                await fetch(
                    `${RECOGNITION_API_URL}/health`,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!healthResponse.ok) {

                throw new Error(
                    "Recognition service is not available."
                );

            }


            console.log(
                "Recognition service is available."
            );


        } catch (error) {

            console.error(
                "Recognition service health check failed:",
                error
            );


            setRecognitionStatus(
                "Unable to connect to recognition service.",
                "error"
            );


            setAttendanceResult(
                "Recognition Service",
                "Make sure web_recognition_service.py is running on port 5000.",
                "error"
            );


            return;

        }


        // --------------------------------------------------------
        // Request camera
        // --------------------------------------------------------

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    width: {
                        ideal: 640
                    },
                    height: {
                        ideal: 480
                    },
                    facingMode: "user"
                },

                audio: false

            });


        // --------------------------------------------------------
        // Attach stream
        // --------------------------------------------------------

        video.srcObject =
            cameraStream;

        video.muted =
            true;

        video.autoplay =
            true;

        video.playsInline =
            true;


        // --------------------------------------------------------
        // Show video
        // --------------------------------------------------------

        video.style.display =
            "block";


        const placeholder =
            document.getElementById(
                "cameraPlaceholder"
            );


        if (placeholder) {

            placeholder.style.display =
                "none";

        }


        await video.play();


        // --------------------------------------------------------
        // Camera is running
        // --------------------------------------------------------

        cameraRunning =
            true;


        updateCameraUI(
            true
        );


        resetRecognitionUI();


        setRecognitionStatus(
            "Recognition in progress",
            "unknown"
        );


        setAttendanceResult(
            "Attendance",
            "Camera started. Waiting for face recognition.",
            "normal"
        );


        // --------------------------------------------------------
        // Canvas
        // --------------------------------------------------------

        recognitionCanvas =
            document.createElement(
                "canvas"
            );


        // --------------------------------------------------------
        // Start recognition
        // --------------------------------------------------------

        startRecognitionLoop();


        console.log(
            "Camera started successfully."
        );


    } catch (error) {

        console.error(
            "Camera start error:",
            error
        );


        stopCamera();


        let message =
            "Unable to start camera.";


        if (
            error.name ===
            "NotAllowedError"
        ) {

            message =
                "Camera permission was denied. Please allow camera access in Chrome.";

        }

        else if (
            error.name ===
            "NotFoundError"
        ) {

            message =
                "No camera was found on this computer.";

        }

        else if (
            error.name ===
            "NotReadableError"
        ) {

            message =
                "The camera is already being used by another application.";

        }

        else if (error.message) {

            message =
                error.message;

        }


        setRecognitionStatus(
            message,
            "error"
        );


        setAttendanceResult(
            "Camera Error",
            message,
            "error"
        );

    }

}


// ============================================================
// STOP CAMERA
// ============================================================

function stopCamera() {

    console.log(
        "Stopping camera..."
    );


    cameraRunning =
        false;


    recognitionInProgress =
        false;


    // Stop recognition timer

    if (recognitionTimer) {

        clearTimeout(
            recognitionTimer
        );

        recognitionTimer =
            null;

    }


    // Stop camera tracks

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => {

                track.stop();

            });


        cameraStream =
            null;

    }


    // Reset video

    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (video) {

        video.pause();

        video.srcObject =
            null;

        video.style.display =
            "none";

    }


    updateCameraUI(
        false
    );


    resetRecognitionUI();


    setRecognitionStatus(
        "Camera is stopped",
        "unknown"
    );


    setAttendanceResult(
        "Attendance",
        "No attendance activity yet.",
        "normal"
    );

}


// ============================================================
// CAMERA UI
// ============================================================

function updateCameraUI(
    running
) {

    const video =
        document.getElementById(
            "cameraVideo"
        );


    const placeholder =
        document.getElementById(
            "cameraPlaceholder"
        );


    const badge =
        document.getElementById(
            "cameraStatusBadge"
        );


    const startButton =
        document.getElementById(
            "startCameraButton"
        );


    const stopButton =
        document.getElementById(
            "stopCameraButton"
        );


    if (video) {

        video.style.display =
            running
                ? "block"
                : "none";

    }


    if (placeholder) {

        placeholder.style.display =
            running
                ? "none"
                : "flex";

    }


    if (badge) {

        badge.textContent =
            running
                ? "CAMERA ON"
                : "CAMERA OFF";


        badge.classList.toggle(
            "camera-on",
            running
        );


        badge.classList.toggle(
            "camera-off",
            !running
        );

    }


    if (startButton) {

        startButton.disabled =
            running;

    }


    if (stopButton) {

        stopButton.disabled =
            !running;

    }

}


// ============================================================
// RECOGNITION LOOP
// ============================================================

function startRecognitionLoop() {

    if (!cameraRunning) {
        return;
    }


    if (recognitionTimer) {

        clearTimeout(
            recognitionTimer
        );

    }


    recognitionTimer =
        setTimeout(
            async () => {

                await recognizeCurrentFrame();


                if (cameraRunning) {

                    startRecognitionLoop();

                }

            },
            1200
        );

}


// ============================================================
// RECOGNIZE CURRENT FRAME
// ============================================================

async function recognizeCurrentFrame() {

    if (!cameraRunning) {
        return;
    }


    if (recognitionInProgress) {
        return;
    }


    const video =
        document.getElementById(
            "cameraVideo"
        );


    if (!video) {
        return;
    }


    if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        return;

    }


    if (
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
    ) {

        return;

    }


    recognitionInProgress =
        true;


    try {

        // --------------------------------------------------------
        // Prepare canvas
        // --------------------------------------------------------

        if (!recognitionCanvas) {

            recognitionCanvas =
                document.createElement(
                    "canvas"
                );

        }


        const maxWidth =
            640;


        const scale =
            Math.min(
                1,
                maxWidth /
                    video.videoWidth
            );


        const width =
            Math.round(
                video.videoWidth *
                scale
            );


        const height =
            Math.round(
                video.videoHeight *
                scale
            );


        recognitionCanvas.width =
            width;


        recognitionCanvas.height =
            height;


        const context =
            recognitionCanvas.getContext(
                "2d"
            );


        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );


        // --------------------------------------------------------
        // Convert to JPEG
        // --------------------------------------------------------

        const blob =
            await canvasToBlob(
                recognitionCanvas
            );


        if (!blob) {

            throw new Error(
                "Could not capture camera frame."
            );

        }


        // --------------------------------------------------------
        // Multipart form
        // --------------------------------------------------------

        const formData =
            new FormData();


        formData.append(
            "image",
            blob,
            "camera-frame.jpg"
        );


        // --------------------------------------------------------
        // Send to Flask
        // --------------------------------------------------------

        const response =
            await fetch(
                `${RECOGNITION_API_URL}/recognize`,
                {
                    method: "POST",
                    body: formData
                }
            );


        let data = {};


        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                `Recognition service returned invalid response (${response.status}).`
            );

        }


        console.log(
            "Recognition response:",
            data
        );


        if (!response.ok) {

            console.error(
                "Recognition API error:",
                response.status,
                data
            );


            handleRecognitionError(
                data
            );


            return;

        }


        handleRecognitionResponse(
            data
        );


    } catch (error) {

        console.error(
            "Recognition request failed:",
            error
        );


        setRecognitionStatus(
            "Unable to connect to recognition service.",
            "error"
        );


        setAttendanceResult(
            "Recognition Error",
            error.message ||
                "Could not contact the recognition service.",
            "error"
        );


    } finally {

        recognitionInProgress =
            false;

    }

}


// ============================================================
// HANDLE RECOGNITION RESPONSE
// ============================================================

function handleRecognitionResponse(
    data
) {

    console.log(
        "Recognition response:",
        data
    );


    // ----------------------------------------------------------
    // NO FACE
    // ----------------------------------------------------------

    if (
        data.status ===
        "NO_FACE"
    ) {

        resetEmployeeDetails();


        setRecognitionStatus(
            "No face detected",
            "unknown"
        );


        setAttendanceResult(
            "Attendance",
            "Please position your face inside the camera.",
            "normal"
        );


        return;

    }


    // ----------------------------------------------------------
    // UNKNOWN
    // ----------------------------------------------------------

    if (
        data.status ===
        "UNKNOWN"
    ) {

        // Important:
        // If the Python service already returned an employee
        // name/similarity, show it instead of wiping the details.

        if (
            data.employeeName ||
            data.employeeId
        ) {

            updateEmployeeDetails(
                data
            );

        }


        setRecognitionStatus(
            "Unknown Person",
            "unknown"
        );


        setAttendanceResult(
            "Unknown Person",
            "No registered employee matched this face.",
            "error"
        );


        return;

    }


    // ----------------------------------------------------------
    // ERROR
    // ----------------------------------------------------------

    if (
        data.status ===
        "ERROR"
    ) {

        setRecognitionStatus(
            "Recognition error",
            "error"
        );


        setAttendanceResult(
            "Recognition Error",
            data.message ||
                "Unable to recognize the face.",
            "error"
        );


        return;

    }


    // ----------------------------------------------------------
    // EMPLOYEE RECOGNIZED
    // ----------------------------------------------------------

    if (
        data.recognized === true ||
        data.employeeName ||
        data.employeeId
    ) {

        updateEmployeeDetails(
            data
        );

    }


    // ----------------------------------------------------------
    // CONFIRMING
    // ----------------------------------------------------------

    if (
        data.status ===
        "CONFIRMING"
    ) {

        const confirmation =
            data.confirmation ??
            0;


        const required =
            data.requiredConfirmations ??
            5;


        setRecognitionStatus(
            "Recognition in progress",
            "unknown"
        );


        setAttendanceResult(
            "Confirming Employee",
            `${data.employeeName || "Employee"} detected. Confirmation ${confirmation}/${required}.`,
            "normal"
        );


        return;

    }


    // ----------------------------------------------------------
    // ATTENDANCE MARKED
    // ----------------------------------------------------------

    if (
        data.status ===
        "ATTENDANCE_MARKED"
    ) {

        setRecognitionStatus(
            "Employee recognized",
            "success"
        );


        setAttendanceResult(
            "Attendance Marked Successfully",
            `${data.employeeName || "Employee"} has been marked PRESENT.`,
            "success"
        );


        refreshDashboardAfterAttendance();


        return;

    }


    // ----------------------------------------------------------
    // ATTENDANCE ALREADY MARKED
    // ----------------------------------------------------------

    if (
        data.status ===
        "ATTENDANCE_ALREADY_MARKED"
    ) {

        setRecognitionStatus(
            "Attendance already marked",
            "success"
        );


        setAttendanceResult(
            "Already Marked",
            `${data.employeeName || "Employee"} has already been marked PRESENT today.`,
            "success"
        );


        refreshDashboardAfterAttendance();


        return;

    }


    // ----------------------------------------------------------
    // ATTENDANCE ERROR
    // ----------------------------------------------------------

    if (
        data.status ===
        "ATTENDANCE_ERROR"
    ) {

        setRecognitionStatus(
            "Employee recognized",
            "unknown"
        );


        const message =
            data.attendance &&
            data.attendance.message
                ? data.attendance.message
                : "Attendance could not be marked.";


        setAttendanceResult(
            "Attendance Error",
            message,
            "error"
        );


        return;

    }

}


// ============================================================
// RECOGNITION HTTP ERROR
// ============================================================

function handleRecognitionError(
    data
) {

    const message =
        data &&
        data.message
            ? data.message
            : "The recognition service rejected the image.";


    setAttendanceResult(
        "Recognition Error",
        message,
        "error"
    );

}


// ============================================================
// UPDATE RECOGNIZED EMPLOYEE
// ============================================================

function updateEmployeeDetails(
    data
) {

    const employee =
        document.getElementById(
            "recognizedEmployee"
        );


    const employeeId =
        document.getElementById(
            "recognizedEmployeeId"
        );


    const similarity =
        document.getElementById(
            "recognitionSimilarity"
        );


    const confirmation =
        document.getElementById(
            "recognitionConfirmation"
        );


    if (employee) {

        employee.textContent =
            data.employeeName ||
            "--";

    }


    if (employeeId) {

        employeeId.textContent =
            data.employeeId ??
            "--";

    }


    if (similarity) {

        const value =
            Number(
                data.similarity
            );


        similarity.textContent =
            Number.isFinite(value)
                ? value.toFixed(3)
                : "--";

    }


    if (confirmation) {

        const current =
            data.confirmation ??
            0;


        const required =
            data.requiredConfirmations ??
            5;


        confirmation.textContent =
            `${current}/${required}`;

    }

}


// ============================================================
// RESET EMPLOYEE DETAILS
// ============================================================

function resetEmployeeDetails() {

    const employee =
        document.getElementById(
            "recognizedEmployee"
        );


    const employeeId =
        document.getElementById(
            "recognizedEmployeeId"
        );


    const similarity =
        document.getElementById(
            "recognitionSimilarity"
        );


    const confirmation =
        document.getElementById(
            "recognitionConfirmation"
        );


    if (employee) {

        employee.textContent =
            "--";

    }


    if (employeeId) {

        employeeId.textContent =
            "--";

    }


    if (similarity) {

        similarity.textContent =
            "--";

    }


    if (confirmation) {

        confirmation.textContent =
            "--";

    }

}


// ============================================================
// RESET RECOGNITION UI
// ============================================================

function resetRecognitionUI() {

    resetEmployeeDetails();


    setRecognitionStatus(
        "Ready",
        "unknown"
    );


    setAttendanceResult(
        "Attendance",
        "No attendance activity yet.",
        "normal"
    );

}


// ============================================================
// RECOGNITION STATUS
// ============================================================

function setRecognitionStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "recognitionStatus"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "unknown",
        "success",
        "error",
        "confirming"
    );


    if (type) {

        element.classList.add(
            type
        );

    }

}


// ============================================================
// ATTENDANCE RESULT
// ============================================================

function setAttendanceResult(
    title,
    message,
    type
) {

    const element =
        document.getElementById(
            "attendanceResult"
        );


    if (!element) {
        return;
    }


    element.classList.remove(
        "success",
        "error"
    );


    if (
        type ===
        "success"
    ) {

        element.classList.add(
            "success"
        );

    }


    if (
        type ===
        "error"
    ) {

        element.classList.add(
            "error"
        );

    }


    element.innerHTML = `

        <strong>
            ${escapeHtml(title)}
        </strong>

        <p>
            ${escapeHtml(message)}
        </p>

    `;

}


// ============================================================
// RESET CAMERA / RECOGNITION DISPLAY
// ============================================================

function resetRecognitionDisplay() {

    resetEmployeeDetails();

    setRecognitionStatus(
        "Ready",
        "unknown"
    );

}


// ============================================================
// CANVAS TO BLOB
// ============================================================

function canvasToBlob(
    canvas
) {

    return new Promise(
        resolve => {

            canvas.toBlob(
                blob => {
                    resolve(blob);
                },
                "image/jpeg",
                0.85
            );

        }
    );

}


// ============================================================
// REFRESH DASHBOARD AFTER ATTENDANCE
// ============================================================

function refreshDashboardAfterAttendance() {

    const dateInput =
        document.getElementById(
            "attendanceDate"
        );


    if (!dateInput) {
        return;
    }


    const date =
        dateInput.value;


    if (!date) {
        return;
    }


    console.log(
        "Refreshing dashboard after attendance..."
    );


    setTimeout(
        () => {

            loadDashboard(
                date
            );

        },
        500
    );

}


// ============================================================
// GLOBAL MESSAGE
// ============================================================

function showMessage(
    message
) {

    const element =
        document.getElementById(
            "message"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;

}


// ============================================================
// SECURITY - HTML
// ============================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// SECURITY - JAVASCRIPT STRING
// ============================================================

function escapeJs(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        );

}


// ============================================================
// PAGE CLEANUP
// ============================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (recognitionTimer) {

            clearTimeout(
                recognitionTimer
            );

            recognitionTimer =
                null;

        }


        if (cameraStream) {

            cameraStream
                .getTracks()
                .forEach(
                    track => {
                        track.stop();
                    }
                );

        }

    }
);