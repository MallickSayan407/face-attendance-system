package com.sayan.faceattendance.service;

import com.sayan.faceattendance.dto.AttendanceResponseDTO;
import com.sayan.faceattendance.dto.AttendanceSummaryDTO;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    AttendanceResponseDTO markAttendance(
            Long employeeId
    );

    List<AttendanceResponseDTO> getAllAttendance();

    AttendanceResponseDTO getAttendanceById(
            Long attendanceId
    );

    List<AttendanceResponseDTO>
    getAttendanceByEmployeeId(
            Long employeeId
    );

    List<AttendanceResponseDTO>
    getAttendanceByDate(
            LocalDate attendanceDate
    );

    AttendanceSummaryDTO getAttendanceSummary(
            LocalDate attendanceDate
    );
}