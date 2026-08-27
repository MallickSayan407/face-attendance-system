package com.sayan.faceattendance.exception;

public class AttendanceNotFoundException
        extends RuntimeException {

    public AttendanceNotFoundException(
            String message) {

        super(message);
    }
}