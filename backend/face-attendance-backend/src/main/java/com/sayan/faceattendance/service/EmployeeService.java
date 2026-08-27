package com.sayan.faceattendance.service;

import com.sayan.faceattendance.dto.EmployeeRequestDTO;
import com.sayan.faceattendance.dto.EmployeeResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EmployeeService {

    EmployeeResponseDTO createEmployee(EmployeeRequestDTO request);

    List<EmployeeResponseDTO> getAllEmployees();

    EmployeeResponseDTO getEmployeeById(Long employeeId);

    EmployeeResponseDTO updateEmployee(
            Long employeeId,
            EmployeeRequestDTO request);

    void deleteEmployee(Long employeeId);

    String uploadEmployeeImage(
            Long employeeId,
            MultipartFile file);
}