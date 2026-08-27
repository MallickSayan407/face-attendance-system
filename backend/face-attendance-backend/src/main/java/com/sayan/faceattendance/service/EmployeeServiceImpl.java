package com.sayan.faceattendance.service;

import com.sayan.faceattendance.dto.EmployeeRequestDTO;
import com.sayan.faceattendance.dto.EmployeeResponseDTO;
import com.sayan.faceattendance.entity.Employee;
import com.sayan.faceattendance.exception.DuplicateEmailException;
import com.sayan.faceattendance.exception.EmployeeNotFoundException;
import com.sayan.faceattendance.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final FileStorageService fileStorageService;

    public EmployeeServiceImpl(
            EmployeeRepository employeeRepository,
            FileStorageService fileStorageService) {

        this.employeeRepository = employeeRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public EmployeeResponseDTO createEmployee(EmployeeRequestDTO request) {

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(
                    "Employee with email " + request.getEmail() + " already exists"
            );
        }

        Employee employee = new Employee();

        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());

        Employee savedEmployee = employeeRepository.save(employee);

        return convertToResponseDTO(savedEmployee);
    }

    @Override
    public List<EmployeeResponseDTO> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Override
    public EmployeeResponseDTO getEmployeeById(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with ID: " + employeeId
                        )
                );

        return convertToResponseDTO(employee);
    }

    @Override
    public EmployeeResponseDTO updateEmployee(
            Long employeeId,
            EmployeeRequestDTO request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with ID: " + employeeId
                        )
                );

        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());

        Employee updatedEmployee = employeeRepository.save(employee);

        return convertToResponseDTO(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with ID: " + employeeId
                        )
                );

        employeeRepository.delete(employee);
    }

    @Override
    public String uploadEmployeeImage(
            Long employeeId,
            MultipartFile file) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with ID: " + employeeId
                        )
                );

        String imagePath =
                fileStorageService.storeFile(file, employeeId);

        employee.setImagePath(imagePath);

        employeeRepository.save(employee);

        return imagePath;
    }

    private EmployeeResponseDTO convertToResponseDTO(Employee employee) {

        EmployeeResponseDTO response = new EmployeeResponseDTO();

        response.setEmployeeId(employee.getEmployeeId());
        response.setName(employee.getName());
        response.setEmail(employee.getEmail());
        response.setDepartment(employee.getDepartment());
        response.setDesignation(employee.getDesignation());
        response.setImagePath(employee.getImagePath());
        response.setCreatedAt(employee.getCreatedAt());

        return response;
    }
}