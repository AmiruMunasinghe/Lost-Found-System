package uom.msd.lostfound.models;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_images")
@Getter
@Setter
@NoArgsConstructor 
public class ItemImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Setter(AccessLevel.NONE) 
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
}

    public ItemImage(Item item, String imageUrl) {
        this.item = item;
        this.imageUrl = imageUrl;
    }
}