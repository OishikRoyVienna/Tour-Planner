package tourplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tourplanner.backend.dto.TourDTO;
import tourplanner.backend.model.Tour;
import tourplanner.backend.model.User;
import tourplanner.backend.repository.TourRepository;
import tourplanner.backend.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TourService {

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all tours for a specific user
     */
    @Transactional(readOnly = true)
    public List<TourDTO> getToursByUser(Long userId) {
        return tourRepository.findByUserId(userId)
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a single tour by ID
     */
    @Transactional(readOnly = true)
    public TourDTO getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found with id: " + id));
        return entityToDto(tour);
    }

    /**
     * Create a new tour
     */
    public TourDTO createTour(TourDTO tourDTO) {
        // Verify user exists
        User user = userRepository.findById(tourDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + tourDTO.getUserId()));

        Tour tour = dtoToEntity(tourDTO);
        tour.setUser(user);

        Tour savedTour = tourRepository.save(tour);
        return entityToDto(savedTour);
    }

    /**
     * Update an existing tour
     */
    public TourDTO updateTour(Long id, TourDTO tourDTO) {
        Tour existingTour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found with id: " + id));

        // Update fields
        existingTour.setName(tourDTO.getName());
        existingTour.setDescription(tourDTO.getDescription());
        existingTour.setFromLocation(tourDTO.getFromLocation());
        existingTour.setToLocation(tourDTO.getToLocation());
        existingTour.setTransportType(tourDTO.getTransportType());
        existingTour.setDistance(tourDTO.getDistance());
        existingTour.setEstimatedTime(tourDTO.getEstimatedTime());
        existingTour.setRouteInformation(tourDTO.getRouteInformation());
        existingTour.setImagePath(tourDTO.getImagePath());

        Tour updatedTour = tourRepository.save(existingTour);
        return entityToDto(updatedTour);
    }

    /**
     * Delete a tour
     */
    public void deleteTour(Long id) {
        if (!tourRepository.existsById(id)) {
            throw new RuntimeException("Tour not found with id: " + id);
        }
        tourRepository.deleteById(id);
    }

    // ========== Helper Methods ==========

    /**
     * Convert Entity to DTO
     */
    private TourDTO entityToDto(Tour tour) {
        TourDTO dto = new TourDTO();
        dto.setId(tour.getId());
        dto.setName(tour.getName());
        dto.setDescription(tour.getDescription());
        dto.setFromLocation(tour.getFromLocation());
        dto.setToLocation(tour.getToLocation());
        dto.setTransportType(tour.getTransportType());
        dto.setDistance(tour.getDistance());
        dto.setEstimatedTime(tour.getEstimatedTime());
        dto.setRouteInformation(tour.getRouteInformation());
        dto.setImagePath(tour.getImagePath());
        dto.setUserId(tour.getUser() != null ? tour.getUser().getId() : null);
        return dto;
    }

    /**
     * Convert DTO to Entity (without user - set separately)
     */
    private Tour dtoToEntity(TourDTO dto) {
        Tour tour = new Tour();
        tour.setId(dto.getId());
        tour.setName(dto.getName());
        tour.setDescription(dto.getDescription());
        tour.setFromLocation(dto.getFromLocation());
        tour.setToLocation(dto.getToLocation());
        tour.setTransportType(dto.getTransportType());
        tour.setDistance(dto.getDistance());
        tour.setEstimatedTime(dto.getEstimatedTime());
        tour.setRouteInformation(dto.getRouteInformation());
        tour.setImagePath(dto.getImagePath());
        return tour;
    }
}