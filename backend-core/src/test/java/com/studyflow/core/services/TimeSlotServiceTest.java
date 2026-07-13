package com.studyflow.core.services;

import com.studyflow.core.dtos.timeslots.CreateTimeSlotRequest;
import com.studyflow.core.dtos.timeslots.UpdateTimeSlotRequest;
import com.studyflow.core.entities.TimeSlot;
import com.studyflow.core.exceptions.ConflictException;
import com.studyflow.core.repositories.TimeSlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TimeSlotServiceTest {

    private TimeSlotRepository timeSlotRepository;
    private CurrentUserService currentUserService;
    private TimeSlotService timeSlotService;
    private Authentication authentication;
    private UUID userId;

    @BeforeEach
    void setUp() {
        timeSlotRepository = mock(TimeSlotRepository.class);
        currentUserService = mock(CurrentUserService.class);
        authentication = mock(Authentication.class);
        userId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId(authentication)).thenReturn(userId);
        when(timeSlotRepository.save(any(TimeSlot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        timeSlotService = new TimeSlotService(timeSlotRepository, currentUserService);
    }

    @Test
    void createTimeSlotRejectsOverlap() {
        when(timeSlotRepository.findByUserIdAndDayOfWeek(userId, 1))
                .thenReturn(List.of(timeSlot(1, "19:00", "20:00")));

        CreateTimeSlotRequest request = new CreateTimeSlotRequest(
                1,
                LocalTime.parse("18:00"),
                LocalTime.parse("21:00")
        );

        assertThrows(ConflictException.class,
                () -> timeSlotService.createTimeSlot(request, authentication));
    }

    @Test
    void createTimeSlotAllowsAdjacentWindow() {
        when(timeSlotRepository.findByUserIdAndDayOfWeek(userId, 1))
                .thenReturn(List.of(timeSlot(1, "19:00", "20:00")));

        CreateTimeSlotRequest request = new CreateTimeSlotRequest(
                1,
                LocalTime.parse("20:00"),
                LocalTime.parse("21:00")
        );

        assertDoesNotThrow(() -> timeSlotService.createTimeSlot(request, authentication));
        verify(timeSlotRepository).save(any(TimeSlot.class));
    }

    @Test
    void updateTimeSlotIgnoresCurrentRecord() {
        TimeSlot existing = timeSlot(1, "19:00", "20:00");
        when(timeSlotRepository.findByIdAndUserId(existing.getId(), userId)).thenReturn(Optional.of(existing));
        when(timeSlotRepository.findByUserIdAndDayOfWeek(userId, 1)).thenReturn(List.of(existing));

        UpdateTimeSlotRequest request = new UpdateTimeSlotRequest(
                1,
                LocalTime.parse("18:30"),
                LocalTime.parse("20:30")
        );

        assertDoesNotThrow(() -> timeSlotService.updateTimeSlot(existing.getId(), request, authentication));
    }

    @Test
    void updateTimeSlotRejectsOverlapWithAnotherRecord() {
        TimeSlot current = timeSlot(1, "08:00", "09:00");
        TimeSlot other = timeSlot(1, "10:00", "11:00");
        when(timeSlotRepository.findByIdAndUserId(current.getId(), userId)).thenReturn(Optional.of(current));
        when(timeSlotRepository.findByUserIdAndDayOfWeek(userId, 1)).thenReturn(List.of(current, other));

        UpdateTimeSlotRequest request = new UpdateTimeSlotRequest(
                1,
                LocalTime.parse("09:30"),
                LocalTime.parse("10:30")
        );

        assertThrows(ConflictException.class,
                () -> timeSlotService.updateTimeSlot(current.getId(), request, authentication));
    }

    private TimeSlot timeSlot(int dayOfWeek, String startTime, String endTime) {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(UUID.randomUUID());
        timeSlot.setUserId(userId);
        timeSlot.setDayOfWeek(dayOfWeek);
        timeSlot.setStartTime(LocalTime.parse(startTime));
        timeSlot.setEndTime(LocalTime.parse(endTime));
        return timeSlot;
    }
}
