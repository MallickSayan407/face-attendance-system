package com.sayan.faceattendance.service;

import com.sayan.faceattendance.dto.AttendanceResponseDTO;
import com.sayan.faceattendance.entity.Attendance;
import com.sayan.faceattendance.entity.Employee;
import com.sayan.faceattendance.exception.AttendanceNotFoundException;
import com.sayan.faceattendance.exception.DuplicateAttendanceException;
import com.sayan.faceattendance.exception.EmployeeNotFoundException;
import com.sayan.faceattendance.repository.AttendanceRepository;
import com.sayan.faceattendance.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import com.sayan.faceattendance.dto.AttendanceSummaryDTO;

@Service
public class AttendanceServiceImpl
        implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    private final EmployeeRepository employeeRepository;

    public AttendanceServiceImpl(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }


    // =========================================================
    // MARK ATTENDANCE
    // =========================================================

    @Override
    public AttendanceResponseDTO markAttendance(
            Long employeeId) {

        // Find employee
        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with ID: "
                                        + employeeId
                        )
                );

        LocalDate today = LocalDate.now();

        // Prevent duplicate attendance
        if (attendanceRepository
                .existsByEmployeeAndAttendanceDate(
                        employee,
                        today
                )) {

            throw new DuplicateAttendanceException(
                    "Attendance already marked for employee ID: "
                            + employeeId
                            + " today"
            );
        }

        // Create attendance
        Attendance attendance = new Attendance(
                employee,
                today,
                LocalTime.now(),
                "PRESENT"
        );

        Attendance savedAttendance =
                attendanceRepository.save(attendance);

        return convertToDTO(savedAttendance);
    }


    // =========================================================
    // GET ALL ATTENDANCE
    // =========================================================

    @Override
    public List<AttendanceResponseDTO> getAllAttendance() {

        return attendanceRepository
                .findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET ATTENDANCE BY ID
    // =========================================================

    @Override
    public AttendanceResponseDTO getAttendanceById(
            Long attendanceId) {

        Attendance attendance =
                attendanceRepository
                        .findById(attendanceId)
                        .orElseThrow(() ->
                                new AttendanceNotFoundException(
                                        "Attendance not found with ID: "
                                                + attendanceId
                                )
                        );

        return convertToDTO(attendance);
    }


    // =========================================================
    // GET ATTENDANCE BY EMPLOYEE ID
    // =========================================================

    @Override
    public List<AttendanceResponseDTO>
    getAttendanceByEmployeeId(
            Long employeeId) {

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new EmployeeNotFoundException(
                                        "Employee not found with ID: "
                                                + employeeId
                                )
                        );

        return attendanceRepository
                .findByEmployee(employee)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    
 // =========================================================
 // GET ATTENDANCE BY DATE
 // =========================================================

 @Override
 public List<AttendanceResponseDTO> getAttendanceByDate(
         LocalDate attendanceDate) {

     return attendanceRepository
             .findByAttendanceDate(attendanceDate)
             .stream()
             .map(this::convertToDTO)
             .toList();
 }

 
//=========================================================
//ATTENDANCE SUMMARY
//=========================================================

@Override
public AttendanceSummaryDTO getAttendanceSummary(
      LocalDate attendanceDate) {

  long totalEmployees =
          employeeRepository.count();

  long presentEmployees =
          attendanceRepository
                  .findByAttendanceDate(
                          attendanceDate
                  )
                  .size();

  long absentEmployees =
          totalEmployees
                  - presentEmployees;

  double attendancePercentage = 0.0;

  if (totalEmployees > 0) {

      attendancePercentage =
              ((double) presentEmployees
                      / totalEmployees)
                      * 100;
  }

  return new AttendanceSummaryDTO(
          attendanceDate,
          totalEmployees,
          presentEmployees,
          absentEmployees,
          attendancePercentage
  );
}
 
 
    // =========================================================
    // ENTITY → DTO CONVERSION
    // =========================================================

    private AttendanceResponseDTO convertToDTO(
            Attendance attendance) {

        Employee employee =
                attendance.getEmployee();

        return new AttendanceResponseDTO(
                attendance.getAttendanceId(),
                employee.getEmployeeId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                attendance.getAttendanceDate(),
                attendance.getAttendanceTime(),
                attendance.getStatus()
        );
    }
}