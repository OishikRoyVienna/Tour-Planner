package tourplanner.backend.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tourplanner.backend.dto.TourDTO;
import tourplanner.backend.exception.ResourceNotFoundException;
import tourplanner.backend.model.Difficulty;
import tourplanner.backend.model.Tour;
import tourplanner.backend.model.TourLog;
import tourplanner.backend.model.User;
import tourplanner.backend.repository.TourRepository;
import tourplanner.backend.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TourService {

    private static final Logger logger = LogManager.getLogger(TourService.class);

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TourDTO> getToursByUser(Long userId) {
        return tourRepository.findByUserId(userId)
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TourDTO getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", id));
        return entityToDto(tour);
    }

    @Transactional(readOnly = true)
    public List<TourDTO> searchTours(Long userId, String query) {
        logger.info("Searching tours for user {} with query '{}'", userId, query);
        return tourRepository.searchByUserAndQuery(userId, query)
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public TourDTO createTour(TourDTO tourDTO) {
        User user = userRepository.findById(tourDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", tourDTO.getUserId()));

        Tour tour = dtoToEntity(tourDTO);
        tour.setUser(user);

        Tour savedTour = tourRepository.save(tour);
        logger.info("Created tour with id: {}", savedTour.getId());
        return entityToDto(savedTour);
    }

    public TourDTO updateTour(Long id, TourDTO tourDTO) {
        Tour existing = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", id));

        existing.setName(tourDTO.getName());
        existing.setDescription(tourDTO.getDescription());
        existing.setFromLocation(tourDTO.getFromLocation());
        existing.setToLocation(tourDTO.getToLocation());
        existing.setTransportType(tourDTO.getTransportType());
        existing.setDistance(tourDTO.getDistance());
        existing.setEstimatedTime(tourDTO.getEstimatedTime());
        existing.setRouteInformation(tourDTO.getRouteInformation());
        existing.setImagePath(tourDTO.getImagePath());

        Tour updated = tourRepository.save(existing);
        return entityToDto(updated);
    }

    public void deleteTour(Long id) {
        if (!tourRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tour", "id", id);
        }
        tourRepository.deleteById(id);
        logger.info("Deleted tour with id: {}", id);
    }

    // ========== Computed Attributes ==========

    public int computePopularity(Tour tour) {
        return tour.getTourLogs() != null ? tour.getTourLogs().size() : 0;
    }

    public boolean computeChildFriendliness(Tour tour) {
        List<TourLog> logs = tour.getTourLogs();
        if (logs == null || logs.isEmpty()) return true;

        double avgDifficulty = logs.stream()
                .filter(l -> l.getDifficulty() != null)
                .mapToInt(l -> difficultyScore(l.getDifficulty()))
                .average().orElse(1.0);

        double avgDistance = logs.stream()
                .filter(l -> l.getTotalDistance() != null)
                .mapToDouble(TourLog::getTotalDistance)
                .average().orElse(0.0);

        double avgRating = logs.stream()
                .filter(l -> l.getRating() != null)
                .mapToInt(TourLog::getRating)
                .average().orElse(3.0);

        return avgDifficulty <= 1.5 && avgDistance <= 10.0 && avgRating >= 3.0;
    }

    public int difficultyScore(Difficulty d) {
        return switch (d) {
            case EASY -> 1;
            case MEDIUM -> 2;
            case HARD -> 3;
        };
    }

    // ========== Helpers ==========

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
        dto.setPopularity(computePopularity(tour));
        dto.setChildFriendly(computeChildFriendliness(tour));
        return dto;
    }

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
