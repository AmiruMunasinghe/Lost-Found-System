package uom.msd.lostfound.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import uom.msd.lostfound.enums.ItemStatus;
import uom.msd.lostfound.enums.ReportType;
import uom.msd.lostfound.enums.Role;
import uom.msd.lostfound.models.Item;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.ItemRepository;
import uom.msd.lostfound.repositories.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ItemRepository itemRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        User adminUser = null;
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@uom.lk", passwordEncoder.encode("admin123"));
            admin.setFullName("Team 9 Admin");
            admin.setRole(Role.ADMIN);
            adminUser = userRepository.save(admin);
            System.out.println("Default admin user created: admin / admin123");
        } else {
            adminUser = userRepository.findByUsername("admin").orElse(null);
            if (adminUser != null && adminUser.getRole() != Role.ADMIN) {
                adminUser.setRole(Role.ADMIN);
                userRepository.save(adminUser);
            }
        }

        User studentUser = null;
        if (!userRepository.existsByUsername("student")) {
            User student = new User("student", "student@uom.lk", passwordEncoder.encode("student123"));
            student.setFullName("Amiru Munasinghe");
            student.setPhone("0771234567");
            student.setStudentId("200001A");
            student.setFaculty("Engineering");
            student.setDepartment("Computer Science & Engineering");
            student.setYearOfStudy("3");
            studentUser = userRepository.save(student);
            System.out.println("Default student user created: student / student123");
        } else {
            studentUser = userRepository.findByUsername("student").orElse(null);
        }

        if (itemRepository.count() == 0 && studentUser != null) {
            // Seed Lost Items
            Item lost1 = new Item(studentUser, "Blue Canvas Backpack", ReportType.LOST);
            lost1.setDescription("Contains a CS lecture note book, a pencil case, and an Outfit branded water bottle. Lost near the CSE department canteen.");
            lost1.setCategory("Bags");
            lost1.setLocation("CSE Canteen");
            lost1.setStatus(ItemStatus.OPEN);
            itemRepository.save(lost1);

            Item lost2 = new Item(studentUser, "Sony WH-1000XM4 Headphones", ReportType.LOST);
            lost2.setDescription("Black Sony wireless over-ear headphones. Case is also black. Lost in the main library study area on the second floor.");
            lost2.setCategory("Electronics");
            lost2.setLocation("Main Library");
            lost2.setStatus(ItemStatus.PENDING_REVIEW);
            itemRepository.save(lost2);

            // Seed Found Items
            Item found1 = new Item(studentUser, "Car Key with Leather Keychain", ReportType.FOUND);
            found1.setDescription("A Toyota smart key with a brown leather keychain. Found on the bench near the student service center.");
            found1.setCategory("Keys");
            found1.setLocation("Student Service Center");
            found1.setStatus(ItemStatus.OPEN);
            itemRepository.save(found1);

            Item found2 = new Item(studentUser, "Stainless Steel Water Bottle", ReportType.FOUND);
            found2.setDescription("Silver Hydro Flask bottle. Has a couple of stickers on it (one is a GitHub logo). Found in the seminar room.");
            found2.setCategory("Accessories");
            found2.setLocation("Seminar Room");
            found2.setStatus(ItemStatus.MATCHED);
            itemRepository.save(found2);

            System.out.println("Mock lost and found items seeded successfully.");
        }
    }
}
