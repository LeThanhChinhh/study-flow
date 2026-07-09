package com.studyflow.core.repositories;

import com.studyflow.core.entities.TimeSlot;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {

    List<TimeSlot> findByUserIdOrderByDayOfWeekAscStartTimeAsc(UUID userId);

    Optional<TimeSlot> findByIdAndUserId(UUID id, UUID userId);

    List<TimeSlot> findByUserIdAndDayOfWeek(UUID userId, Integer dayOfWeek);
}
