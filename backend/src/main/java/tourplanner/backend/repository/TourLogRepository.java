package tourplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tourplanner.backend.model.TourLog;
import java.util.List;

@Repository
public interface TourLogRepository extends JpaRepository<TourLog, Long> {
    List<TourLog> findByTourId(Long tourId);
}