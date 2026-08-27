package com.sayan.faceattendance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path uploadDirectory;

    public FileStorageService(
            @Value("${file.upload-dir}") String uploadDir) {

        this.uploadDirectory = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory",
                    e
            );
        }
    }

    public String storeFile(
            MultipartFile file,
            Long employeeId) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "File cannot be empty"
            );
        }

        String originalFilename =
                file.getOriginalFilename();

        if (originalFilename == null ||
                originalFilename.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid file name"
            );
        }

        String extension = "";

        int dotIndex =
                originalFilename.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension =
                    originalFilename
                            .substring(dotIndex)
                            .toLowerCase();
        }

        if (!extension.equals(".jpg")
                && !extension.equals(".jpeg")
                && !extension.equals(".png")) {

            throw new IllegalArgumentException(
                    "Only JPG, JPEG and PNG images are allowed"
            );
        }

        String fileName =
                employeeId + extension;

        Path targetLocation =
                uploadDirectory.resolve(fileName);

        try {

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not store employee image",
                    e
            );
        }

        return targetLocation.toString();
    }
}