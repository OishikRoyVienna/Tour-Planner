package tourplanner.backend;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class BackendApplicationTests {

    @Test
    void applicationClassExists() {
        assertThat(BackendApplication.class.isAnnotationPresent(
                org.springframework.boot.autoconfigure.SpringBootApplication.class
        )).isTrue();
    }

    @Test
    void mainMethodExists() throws NoSuchMethodException {
        assertThat(BackendApplication.class.getDeclaredMethod("main", String[].class))
                .isNotNull();
    }
}
