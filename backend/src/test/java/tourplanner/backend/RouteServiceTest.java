package tourplanner.backend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import tourplanner.backend.service.RouteService;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class RouteServiceTest {

    @InjectMocks
    private RouteService routeService;

    @Test
    void toOrsProfile_bike_returnsCycling() {
        ReflectionTestUtils.setField(routeService, "apiKey", "test-key");

        // Test profile mapping via reflection
        String result = invokeToOrsProfile("BIKE");
        assertThat(result).isEqualTo("cycling-regular");
    }

    @Test
    void toOrsProfile_hike_returnsFootHiking() {
        String result = invokeToOrsProfile("HIKE");
        assertThat(result).isEqualTo("foot-hiking");
    }

    @Test
    void toOrsProfile_running_returnsFootHiking() {
        String result = invokeToOrsProfile("RUNNING");
        assertThat(result).isEqualTo("foot-hiking");
    }

    @Test
    void toOrsProfile_vacation_returnsDrivingCar() {
        String result = invokeToOrsProfile("VACATION");
        assertThat(result).isEqualTo("driving-car");
    }

    @Test
    void toOrsProfile_car_returnsDrivingCar() {
        String result = invokeToOrsProfile("CAR");
        assertThat(result).isEqualTo("driving-car");
    }

    private String invokeToOrsProfile(String type) {
        return (String) ReflectionTestUtils.invokeMethod(routeService, "toOrsProfile", type);
    }
}
