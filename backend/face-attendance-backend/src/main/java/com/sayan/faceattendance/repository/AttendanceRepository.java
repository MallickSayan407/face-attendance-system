package com.sayan.faceattendance.repository;

import com.sayan.faceattendance.entity.Attendance;
import com.sayan.faceattendance.entity.Employee;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    boolean existsByEmployeeAndAttendanceDate(
            Employee employee,
            LocalDate attendanceDate
    );

    List<Attendance> findByEmployee(
            Employee employee
    );

    List<Attendance> findByAttendanceDate(
            LocalDate attendanceDate
    );
}