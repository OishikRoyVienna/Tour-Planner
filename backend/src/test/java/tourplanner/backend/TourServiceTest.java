package tourplanner.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tourplanner.backend.dto.TourDTO;
import tourplanner.backend.exception.ResourceNotFoundException;
import tourplanner.backend.model.Difficulty;
import tourplanner.backend.model.Tour;
import tourplanner.backend.model.TourLog;
import tourplanner.backend.model.TransportType;
import tourplanner.backend.model.User;
import tourplanner.backend.repository.TourRepository;
import tourplanner.backend.repository.UserRepository;
import tourplanner.backend.service.TourService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock
    private TourRepository tourRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TourService tourService;

    private User testUser;
    private Tour testTour;
    private TourDTO testTourDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("hash");

        testTour = new Tour();
        testTour.setId(1L);
        testTour.setName("Vienna to Salzburg");
        testTour.setFromLocation("Vienna");
        testTour.setToLocation("Salzburg");
        testTour.setTransportType(TransportType.BIKE);
        testTour.setUser(testUser);
        testTour.setTourLogs(new ArrayList<>());

        testTourDTO = new TourDTO();
        testTourDTO.setName("Vienna to Salzburg");
        testTourDTO.setFromLocation("Vienna");
        testTourDTO.setToLocation("Salzburg");
        testTourDTO.setTransportType(TransportType.BIKE);
        testTourDTO.setUserId(1L);
    }

    @Test
    void createTour_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(tourRepository.save(any(Tour.class))).thenReturn(testTour);

        TourDTO result = tourService.createTour(testTourDTO);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Vienna to Salzburg");
        verify(tourRepository).save(any(Tour.class));
    }

    @Test
    void createTour_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.createTour(testTourDTO))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getTourById_found() {
        when(tourRepository.findById(1L)).thenReturn(Optional.of(testTour));

        TourDTO result = tourService.getTourById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getTourById_notFound_throws() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.getTourById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getToursByUser_returnsList() {
        when(tourRepository.findByUserId(1L)).thenReturn(List.of(testTour));

        List<TourDTO> result = tourService.getToursByUser(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Vienna to Salzburg");
    }

    @Test
    void updateTour_success() {
        when(tourRepository.findById(1L)).thenReturn(Optional.of(testTour));
        when(tourRepository.save(any(Tour.class))).thenReturn(testTour);

        testTourDTO.setName("Updated Name");
        TourDTO result = tourService.updateTour(1L, testTourDTO);

        assertThat(result).isNotNull();
        verify(tourRepository).save(any(Tour.class));
    }

    @Test
    void updateTour_notFound_throws() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.updateTour(99L, testTourDTO))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteTour_success() {
        when(tourRepository.existsById(1L)).thenReturn(true);

        assertThatCode(() -> tourService.deleteTour(1L)).doesNotThrowAnyException();
        verify(tourRepository).deleteById(1L);
    }

    @Test
    void deleteTour_notFound_throws() {
        when(tourRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> tourService.deleteTour(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void computePopularity_returnsLogCount() {
        TourLog log1 = new TourLog();
        TourLog log2 = new TourLog();
        testTour.setTourLogs(List.of(log1, log2));

        int popularity = tourService.computePopularity(testTour);

        assertThat(popularity).isEqualTo(2);
    }

    @Test
    void computePopularity_emptyLogs_returnsZero() {
        testTour.setTourLogs(new ArrayList<>());

        int popularity = tourService.computePopularity(testTour);

        assertThat(popularity).isEqualTo(0);
    }

    @Test
    void computeChildFriendliness_noLogs_returnsTrue() {
        testTour.setTourLogs(new ArrayList<>());

        boolean result = tourService.computeChildFriendliness(testTour);

        assertThat(result).isTrue();
    }

    @Test
    void computeChildFriendliness_easyShortHighRating_returnsTrue() {
        TourLog log = new TourLog();
        log.setDifficulty(Difficulty.EASY);
        log.setTotalDistance(5.0);
        log.setRating(5);
        testTour.setTourLogs(List.of(log));

        boolean result = tourService.computeChildFriendliness(testTour);

        assertThat(result).isTrue();
    }

    @Test
    void computeChildFriendliness_hardLongLowRating_returnsFalse() {
        TourLog log = new TourLog();
        log.setDifficulty(Difficulty.HARD);
        log.setTotalDistance(50.0);
        log.setRating(1);
        testTour.setTourLogs(List.of(log));

        boolean result = tourService.computeChildFriendliness(testTour);

        assertThat(result).isFalse();
    }

    @Test
    void difficultyScore_easy_returns1() {
        assertThat(tourService.difficultyScore(Difficulty.EASY)).isEqualTo(1);
    }

    @Test
    void difficultyScore_medium_returns2() {
        assertThat(tourService.difficultyScore(Difficulty.MEDIUM)).isEqualTo(2);
    }

    @Test
    void difficultyScore_hard_returns3() {
        assertThat(tourService.difficultyScore(Difficulty.HARD)).isEqualTo(3);
    }
}
