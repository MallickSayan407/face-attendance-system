package com.sayan.faceattendance.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {


    // =========================================================
    // EMPLOYEE NOT FOUND
    // =========================================================

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<Map<String, Object>>
    handleEmployeeNotFound(
            EmployeeNotFoundException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "message",
                        exception.getMessage(),

                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        404
                ));
    }


    // =========================================================
    // ATTENDANCE NOT FOUND
    // =========================================================

    @ExceptionHandler(AttendanceNotFoundException.class)
    public ResponseEntity<Map<String, Object>>
    handleAttendanceNotFound(
            AttendanceNotFoundException exception) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "message",
                        exception.getMessage(),

                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        404
                ));
    }


    // =========================================================
    // DUPLICATE ATTENDANCE
    // =========================================================

    @ExceptionHandler(DuplicateAttendanceException.class)
    public ResponseEntity<Map<String, Object>>
    handleDuplicateAttendance(
            DuplicateAttendanceException exception) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "message",
                        exception.getMessage(),

                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        409
                ));
    }
}