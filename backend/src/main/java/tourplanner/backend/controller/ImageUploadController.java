package tourplanner.backend.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tourplanner.backend.exception.ValidationException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageUploadController {

    private static final Logger logger = LogManager.getLogger(ImageUploadController.class);
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/png", "image/jpeg", "image/webp", "image/gif");

    @Value("${app.upload.path}")
    private String uploadPath;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("No file provided");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new ValidationException("Unsupported image type: " + file.getContentType());
        }

        try {
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = extractExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored uploaded image as {}", filename);

            return ResponseEntity.ok(Map.of("imagePath", "/api/images/" + filename));
        } catch (IOException e) {
            logger.error("Failed to store uploaded image", e);
            throw new ValidationException("Could not store image: " + e.getMessage());
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        Path file = uploadDir.resolve(filename).normalize();

        if (!file.startsWith(uploadDir) || !Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentTypeFor(filename)))
                .body(resource);
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) return "";
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }

    private String contentTypeFor(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG_VALUE;
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF_VALUE;
        return MediaType.IMAGE_JPEG_VALUE;
    }
}
