package tourplanner.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import tourplanner.backend.dto.TourDTO;
import tourplanner.backend.service.TourService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
@CrossOrigin(origins = "http://localhost:4200")
@Validated  // ← WICHTIG: Aktiviert Validation
public class TourController {

    @Autowired
    private TourService tourService;

    @GetMapping
    public ResponseEntity<List<TourDTO>> getAllTours(@RequestParam Long userId) {
        return ResponseEntity.ok(tourService.getToursByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourDTO> getTour(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getTourById(id));
    }

    @PostMapping
    public ResponseEntity<TourDTO> createTour(@RequestBody @Valid TourDTO tourDTO) {
        // ← @Valid löst Validation aus!
        return ResponseEntity.ok(tourService.createTour(tourDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourDTO> updateTour(@PathVariable Long id, @RequestBody @Valid TourDTO tourDTO) {
        return ResponseEntity.ok(tourService.updateTour(id, tourDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }
}