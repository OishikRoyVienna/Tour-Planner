package tourplanner.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import tourplanner.backend.dto.TourLogDTO;
import tourplanner.backend.service.TourLogService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tour-logs")
@CrossOrigin(origins = "http://localhost:4200")
@Validated
public class TourLogController {

    @Autowired
    private TourLogService tourLogService;

    @GetMapping
    public ResponseEntity<List<TourLogDTO>> getLogsByTour(@RequestParam Long tourId) {
        return ResponseEntity.ok(tourLogService.getLogsByTour(tourId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourLogDTO> getLog(@PathVariable Long id) {
        return ResponseEntity.ok(tourLogService.getLogById(id));
    }

    @PostMapping
    public ResponseEntity<TourLogDTO> createLog(@RequestBody @Valid TourLogDTO logDTO) {
        return ResponseEntity.ok(tourLogService.createLog(logDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourLogDTO> updateLog(@PathVariable Long id, @RequestBody @Valid TourLogDTO logDTO) {
        return ResponseEntity.ok(tourLogService.updateLog(id, logDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        tourLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}