package com.sayan.faceattendance.dto;

import java.time.LocalDate;

public class AttendanceSummaryDTO {

    private LocalDate date;

    private long totalEmployees;

    private long presentEmployees;

    private long absentEmployees;

    private double attendancePercentage;

    public AttendanceSummaryDTO(
            LocalDate date,
            long totalEmployees,
            long presentEmployees,
            long absentEmployees,
            double attendancePercentage) {

        this.date = date;
        this.totalEmployees = totalEmployees;
        this.presentEmployees = presentEmployees;
        this.absentEmployees = absentEmployees;
        this.attendancePercentage =
                attendancePercentage;
    }

    public LocalDate getDate() {
        return date;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public long getPresentEmployees() {
        return presentEmployees;
    }

    public long getAbsentEmployees() {
        return absentEmployees;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }
}