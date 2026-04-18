package uom.msd.lostfound.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.models.Item;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByReportType(ReportType reportType);

    List<Item> findByStatus(ItemStatus status);

    List<Item> findByUserId(Long userId);

    List<Item> findByReportTypeAndStatus(ReportType reportType, ItemStatus status);

    List<Item> findByUserIdAndReportType(Long userId, ReportType reportType);

    @Query("SELECT i FROM Item i WHERE i.title LIKE %:searchTerm% OR i.description LIKE %:searchTerm%")
    List<Item> searchByTitleOrDescription(@Param("searchTerm") String searchTerm);

    @Query("SELECT i FROM Item i WHERE i.category = :category AND i.reportType = :type")
    List<Item> findBysCategoryAndType(@Param("category") String category, @Param("type") ReportType type);

    @Query("SELECT i FROM Item i WHERE i.location = :location AND i.status = :status")
    List<Item> findByLocationAndStatus(@Param("location") String location, @Param("status") ItemStatus status);
}
