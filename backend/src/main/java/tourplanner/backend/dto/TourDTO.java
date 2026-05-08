package tourplanner.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tourplanner.backend.model.TransportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourDTO {

    private Long id;

    @NotBlank(message = "Tour name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description too long")
    private String description;

    @NotBlank(message = "From location is required")
    private String fromLocation;

    @NotBlank(message = "To location is required")
    private String toLocation;

    @NotNull(message = "Transport type is required")
    private TransportType transportType;

    @Min(value = 0, message = "Distance cannot be negative")
    private Double distance;

    @Min(value = 0, message = "Estimated time cannot be negative")
    private Integer estimatedTime;

    private String routeInformation;
    private String imagePath;

    @NotNull(message = "User ID is required")
    private Long userId;
}