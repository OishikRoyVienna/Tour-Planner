package tourplanner.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tourplanner.backend.dto.TourLogDTO;
import tourplanner.backend.model.Difficulty;
import tourplanner.backend.model.Tour;
import tourplanner.backend.model.TourLog;
import tourplanner.backend.repository.TourLogRepository;
import tourplanner.backend.repository.TourRepository;
import tourplanner.backend.service.TourLogService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourLogServiceTest {

    @Mock
    private TourLogRepository tourLogRepository;

    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private TourLogService tourLogService;

    private Tour testTour;
    private TourLog testLog;
    private TourLogDTO testLogDTO;

    @BeforeEach
    void setUp() {
        testTour = new Tour();
        testTour.setId(1L);
        testTour.setName("Test Tour");

        testLog = new TourLog();
        testLog.setId(1L);
        testLog.setDateTime(LocalDateTime.now());
        testLog.setComment("Great hike!");
        testLog.setDifficulty(Difficulty.MEDIUM);
        testLog.setTotalDistance(12.5);
        testLog.setTotalTime(180);
        testLog.setRating(4);
        testLog.setTour(testTour);

        testLogDTO = new TourLogDTO();
        testLogDTO.setDateTime(LocalDateTime.now());
        testLogDTO.setComment("Great hike!");
        testLogDTO.setDifficulty(Difficulty.MEDIUM);
        testLogDTO.setTotalDistance(12.5);
        testLogDTO.setTotalTime(180);
        testLogDTO.setRating(4);
        testLogDTO.setTourId(1L);
    }

    @Test
    void createLog_success() {
        when(tourRepository.findById(1L)).thenReturn(Optional.of(testTour));
        when(tourLogRepository.save(any(TourLog.class))).thenReturn(testLog);

        TourLogDTO result = tourLogService.createLog(testLogDTO);

        assertThat(result).isNotNull();
        assertThat(result.getComment()).isEqualTo("Great hike!");
        verify(tourLogRepository).save(any(TourLog.class));
    }

    @Test
    void createLog_tourNotFound_throws() {
        when(tourRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.createLog(testLogDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Tour not found");
    }

    @Test
    void getLogById_found() {
        when(tourLogRepository.findById(1L)).thenReturn(Optional.of(testLog));

        TourLogDTO result = tourLogService.getLogById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getRating()).isEqualTo(4);
    }

    @Test
    void getLogById_notFound_throws() {
        when(tourLogRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.getLogById(99L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void getLogsByTour_returnsList() {
        when(tourLogRepository.findByTourId(1L)).thenReturn(List.of(testLog));

        List<TourLogDTO> result = tourLogService.getLogsByTour(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getComment()).isEqualTo("Great hike!");
    }

    @Test
    void updateLog_success() {
        when(tourLogRepository.findById(1L)).thenReturn(Optional.of(testLog));
        when(tourLogRepository.save(any(TourLog.class))).thenReturn(testLog);

        testLogDTO.setComment("Updated comment");
        TourLogDTO result = tourLogService.updateLog(1L, testLogDTO);

        assertThat(result).isNotNull();
        verify(tourLogRepository).save(any(TourLog.class));
    }

    @Test
    void updateLog_notFound_throws() {
        when(tourLogRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.updateLog(99L, testLogDTO))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void deleteLog_success() {
        when(tourLogRepository.existsById(1L)).thenReturn(true);

        assertThatCode(() -> tourLogService.deleteLog(1L)).doesNotThrowAnyException();
        verify(tourLogRepository).deleteById(1L);
    }

    @Test
    void deleteLog_notFound_throws() {
        when(tourLogRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> tourLogService.deleteLog(99L))
                .isInstanceOf(RuntimeException.class);
    }
}
