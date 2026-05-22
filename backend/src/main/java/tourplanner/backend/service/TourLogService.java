package tourplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tourplanner.backend.dto.TourLogDTO;
import tourplanner.backend.exception.ResourceNotFoundException;
import tourplanner.backend.model.Tour;
import tourplanner.backend.model.TourLog;
import tourplanner.backend.repository.TourLogRepository;
import tourplanner.backend.repository.TourRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TourLogService {

    @Autowired
    private TourLogRepository tourLogRepository;

    @Autowired
    private TourRepository tourRepository;

    @Transactional(readOnly = true)
    public List<TourLogDTO> getLogsByTour(Long tourId) {
        return tourLogRepository.findByTourId(tourId)
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public TourLogDTO createLog(TourLogDTO logDTO) {
        Tour tour = tourRepository.findById(logDTO.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found: " + logDTO.getTourId()));

        TourLog log = dtoToEntity(logDTO);
        log.setTour(tour);

        TourLog saved = tourLogRepository.save(log);
        return entityToDto(saved);
    }

    public TourLogDTO updateLog(Long id, TourLogDTO logDTO) {
        TourLog existing = tourLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TourLog not found: " + id));

        existing.setDateTime(logDTO.getDateTime());
        existing.setComment(logDTO.getComment());
        existing.setDifficulty(logDTO.getDifficulty());
        existing.setTotalDistance(logDTO.getTotalDistance());
        existing.setTotalTime(logDTO.getTotalTime());
        existing.setRating(logDTO.getRating());

        TourLog updated = tourLogRepository.save(existing);
        return entityToDto(updated);
    }

    public void deleteLog(Long id) {
        if (!tourLogRepository.existsById(id)) {
            throw new RuntimeException("TourLog not found: " + id);
        }
        tourLogRepository.deleteById(id);
    }
    @Transactional(readOnly = true)
    public TourLogDTO getLogById(Long id) {
        TourLog log = tourLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TourLog", "id", id));
        return entityToDto(log);
    }

    private TourLogDTO entityToDto(TourLog log) {
        TourLogDTO dto = new TourLogDTO();
        dto.setId(log.getId());
        dto.setDateTime(log.getDateTime());
        dto.setComment(log.getComment());
        dto.setDifficulty(log.getDifficulty());
        dto.setTotalDistance(log.getTotalDistance());
        dto.setTotalTime(log.getTotalTime());
        dto.setRating(log.getRating());
        dto.setTourId(log.getTour() != null ? log.getTour().getId() : null);
        return dto;
    }

    private TourLog dtoToEntity(TourLogDTO dto) {
        TourLog log = new TourLog();
        log.setId(dto.getId());
        log.setDateTime(dto.getDateTime());
        log.setComment(dto.getComment());
        log.setDifficulty(dto.getDifficulty());
        log.setTotalDistance(dto.getTotalDistance());
        log.setTotalTime(dto.getTotalTime());
        log.setRating(dto.getRating());
        return log;
    }
}