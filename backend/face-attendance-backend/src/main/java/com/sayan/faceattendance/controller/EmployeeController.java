package com.sayan.faceattendance.controller;

import com.sayan.faceattendance.dto.EmployeeRequestDTO;
import com.sayan.faceattendance.dto.EmployeeResponseDTO;
import com.sayan.faceattendance.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponseDTO> createEmployee(
            @Valid @RequestBody EmployeeRequestDTO request) {

        EmployeeResponseDTO response =
                employeeService.createEmployee(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponseDTO>> getAllEmployees() {

        return ResponseEntity.ok(
                employeeService.getAllEmployees()
        );
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeeResponseDTO> getEmployeeById(
            @PathVariable("employeeId") Long employeeId) {

        return ResponseEntity.ok(
                employeeService.getEmployeeById(employeeId)
        );
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<EmployeeResponseDTO> updateEmployee(
            @PathVariable("employeeId") Long employeeId,
            @Valid @RequestBody EmployeeRequestDTO request) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(employeeId, request)
        );
    }

    @PostMapping("/{employeeId}/image")
    public ResponseEntity<String> uploadEmployeeImage(
            @PathVariable("employeeId") Long employeeId,
            @RequestParam("image") MultipartFile image) {

        String imagePath =
                employeeService.uploadEmployeeImage(
                        employeeId,
                        image
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(imagePath);
    }
    
    @DeleteMapping("/{employeeId}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable("employeeId") Long employeeId) {

        employeeService.deleteEmployee(employeeId);

        return ResponseEntity.noContent().build();
    }
}