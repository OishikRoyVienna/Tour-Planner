package tourplanner.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tourplanner.backend.dto.TourDTO;
import tourplanner.backend.dto.TourLogDTO;
import tourplanner.backend.service.TourLogService;
import tourplanner.backend.service.TourService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class ImportExportController {

    private static final Logger logger = LogManager.getLogger(ImportExportController.class);

    @Autowired
    private TourService tourService;

    @Autowired
    private TourLogService tourLogService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTours(@RequestParam Long userId) throws IOException {
        logger.info("Exporting tours for user {}", userId);

        List<TourDTO> tours = tourService.getToursByUser(userId);
        List<Map<String, Object>> exportData = new ArrayList<>();

        for (TourDTO tour : tours) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("tour", tour);
            List<TourLogDTO> logs = tourLogService.getLogsByTour(tour.getId());
            entry.put("logs", logs);
            exportData.add(entry);
        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        byte[] json = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(exportData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tours_export.json\"")
                .contentType(MediaType.parseMediaType(MediaType.APPLICATION_JSON_VALUE))
                .body(json);
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importTours(
            @RequestParam Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        logger.info("Importing tours for user {}", userId);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        List<Map<String, Object>> importData = mapper.readValue(
                file.getInputStream(),
                mapper.getTypeFactory().constructCollectionType(List.class, Map.class)
        );

        int toursImported = 0;
        int logsImported = 0;

        for (Map<String, Object> entry : importData) {
            TourDTO tourDTO = mapper.convertValue(entry.get("tour"), TourDTO.class);
            tourDTO.setId(null);
            tourDTO.setUserId(userId);

            TourDTO savedTour = tourService.createTour(tourDTO);
            toursImported++;

            List<?> rawLogs = (List<?>) entry.get("logs");
            if (rawLogs != null) {
                for (Object rawLog : rawLogs) {
                    TourLogDTO logDTO = mapper.convertValue(rawLog, TourLogDTO.class);
                    logDTO.setId(null);
                    logDTO.setTourId(savedTour.getId());
                    tourLogService.createLog(logDTO);
                    logsImported++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("toursImported", toursImported);
        result.put("logsImported", logsImported);
        logger.info("Import complete: {} tours, {} logs", toursImported, logsImported);

        return ResponseEntity.ok(result);
    }
}
