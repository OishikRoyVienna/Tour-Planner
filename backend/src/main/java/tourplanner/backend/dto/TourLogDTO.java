package tourplanner.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tourplanner.backend.model.Difficulty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourLogDTO {

    private Long id;

    @NotNull(message = "Date/time is required")
    private LocalDateTime dateTime;

    @Size(max = 1000, message = "Comment too long")
    private String comment;

    private Difficulty difficulty;

    @Min(value = 0, message = "Distance cannot be negative")
    private Double totalDistance;

    @Min(value = 0, message = "Time cannot be negative")
    private Integer totalTime;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @NotNull(message = "Tour ID is required")
    private Long tourId;
}