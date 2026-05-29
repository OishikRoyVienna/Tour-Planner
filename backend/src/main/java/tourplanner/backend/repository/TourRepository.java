package tourplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tourplanner.backend.model.Tour;

import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {

    List<Tour> findByUserId(Long userId);

    @Query("SELECT DISTINCT t FROM Tour t LEFT JOIN t.tourLogs l WHERE t.user.id = :userId AND (" +
           "LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.fromLocation) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(t.toLocation) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(l.comment) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Tour> searchByUserAndQuery(@Param("userId") Long userId, @Param("q") String query);
}