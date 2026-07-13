package com.studyflow.core.services;

import com.studyflow.core.dtos.timeslots.CreateTimeSlotRequest;
import com.studyflow.core.dtos.timeslots.TimeSlotResponse;
import com.studyflow.core.dtos.timeslots.UpdateTimeSlotRequest;
import com.studyflow.core.entities.TimeSlot;
import com.studyflow.core.exceptions.ConflictException;
import com.studyflow.core.exceptions.ResourceNotFoundException;
import com.studyflow.core.repositories.TimeSlotRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class TimeSlotService {

    private static final String OVERLAP_MESSAGE =
            "This time slot overlaps with an existing availability window";

    private final TimeSlotRepository timeSlotRepository;
    private final CurrentUserService currentUserService;

    public TimeSlotService(TimeSlotRepository timeSlotRepository, CurrentUserService currentUserService) {
        this.timeSlotRepository = timeSlotRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public TimeSlotResponse createTimeSlot(CreateTimeSlotRequest request, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        validateTimeRange(request.startTime(), request.endTime());
        validateNoOverlap(userId, request.dayOfWeek(), request.startTime(), request.endTime(), null);

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setUserId(userId);
        timeSlot.setDayOfWeek(request.dayOfWeek());
        timeSlot.setStartTime(request.startTime());
        timeSlot.setEndTime(request.endTime());

        return TimeSlotResponse.from(timeSlotRepository.save(timeSlot));
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getTimeSlots(Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        return timeSlotRepository.findByUserIdOrderByDayOfWeekAscStartTimeAsc(userId).stream()
                .map(TimeSlotResponse::from)
                .toList();
    }

    @Transactional
    public TimeSlotResponse updateTimeSlot(
            UUID timeSlotId,
            UpdateTimeSlotRequest request,
            Authentication authentication
    ) {
        TimeSlot timeSlot = findOwnedTimeSlot(timeSlotId, authentication);

        Integer dayOfWeek = request.dayOfWeek() != null ? request.dayOfWeek() : timeSlot.getDayOfWeek();
        LocalTime startTime = request.startTime() != null ? request.startTime() : timeSlot.getStartTime();
        LocalTime endTime = request.endTime() != null ? request.endTime() : timeSlot.getEndTime();

        validateTimeRange(startTime, endTime);
        validateNoOverlap(timeSlot.getUserId(), dayOfWeek, startTime, endTime, timeSlot.getId());

        timeSlot.setDayOfWeek(dayOfWeek);
        timeSlot.setStartTime(startTime);
        timeSlot.setEndTime(endTime);

        return TimeSlotResponse.from(timeSlotRepository.save(timeSlot));
    }

    @Transactional
    public void deleteTimeSlot(UUID timeSlotId, Authentication authentication) {
        TimeSlot timeSlot = findOwnedTimeSlot(timeSlotId, authentication);
        timeSlotRepository.delete(timeSlot);
    }

    private TimeSlot findOwnedTimeSlot(UUID timeSlotId, Authentication authentication) {
        UUID userId = currentUserService.getCurrentUserId(authentication);
        return timeSlotRepository.findByIdAndUserId(timeSlotId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void validateNoOverlap(
            UUID userId,
            Integer dayOfWeek,
            LocalTime startTime,
            LocalTime endTime,
            UUID ignoredTimeSlotId
    ) {
        boolean overlaps = timeSlotRepository.findByUserIdAndDayOfWeek(userId, dayOfWeek).stream()
                .filter(existing -> ignoredTimeSlotId == null || !existing.getId().equals(ignoredTimeSlotId))
                .anyMatch(existing ->
                        startTime.isBefore(existing.getEndTime())
                                && endTime.isAfter(existing.getStartTime())
                );

        if (overlaps) {
            throw new ConflictException(OVERLAP_MESSAGE);
        }
    }
}
