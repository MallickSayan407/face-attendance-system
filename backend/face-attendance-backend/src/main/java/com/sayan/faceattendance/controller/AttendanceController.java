package com.sayan.faceattendance.controller;

import com.sayan.faceattendance.dto.AttendanceResponseDTO;
import java.time.LocalDate;
import com.sayan.faceattendance.service.AttendanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.sayan.faceattendance.dto.AttendanceSummaryDTO;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }


    // =========================================================
    // MARK ATTENDANCE
    // =========================================================

    @PostMapping
    public ResponseEntity<AttendanceResponseDTO> markAttendance(
            @RequestParam("employeeId") Long employeeId) {

        AttendanceResponseDTO response =
                attendanceService.markAttendance(
                        employeeId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL ATTENDANCE
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AttendanceResponseDTO>>
    getAllAttendance() {

        List<AttendanceResponseDTO> response =
                attendanceService.getAllAttendance();

        return ResponseEntity.ok(response);
    }

    
 // =========================================================
 // GET ATTENDANCE BY DATE
 // =========================================================

 @GetMapping("/date/{attendanceDate}")
 public ResponseEntity<List<AttendanceResponseDTO>>
 getAttendanceByDate(
         @PathVariable("attendanceDate")
         LocalDate attendanceDate) {

     List<AttendanceResponseDTO> response =
             attendanceService.getAttendanceByDate(
                     attendanceDate
             );

     return ResponseEntity.ok(response);
 }
 
 
//=========================================================
//ATTENDANCE SUMMARY BY DATE
//=========================================================

@GetMapping("/summary/{attendanceDate}")
public ResponseEntity<AttendanceSummaryDTO>
getAttendanceSummary(
      @PathVariable("attendanceDate")
      LocalDate attendanceDate) {

  AttendanceSummaryDTO response =
          attendanceService.getAttendanceSummary(
                  attendanceDate
          );

  return ResponseEntity.ok(response);
}
 

    // =========================================================
    // GET ATTENDANCE BY ID
    // =========================================================

    @GetMapping("/{attendanceId}")
    public ResponseEntity<AttendanceResponseDTO>
    getAttendanceById(
            @PathVariable("attendanceId")
            Long attendanceId) {

        AttendanceResponseDTO response =
                attendanceService.getAttendanceById(
                        attendanceId
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET ATTENDANCE BY EMPLOYEE ID
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceResponseDTO>>
    getAttendanceByEmployeeId(
            @PathVariable("employeeId")
            Long employeeId) {

        List<AttendanceResponseDTO> response =
                attendanceService
                        .getAttendanceByEmployeeId(
                                employeeId
                        );

        return ResponseEntity.ok(response);
    }
}