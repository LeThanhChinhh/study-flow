package com.studyflow.core.services;

import com.studyflow.core.dtos.timeslots.CreateTimeSlotRequest;
import com.studyflow.core.dtos.timeslots.TimeSlotResponse;
import com.studyflow.core.dtos.timeslots.UpdateTimeSlotRequest;
import com.studyflow.core.entities.TimeSlot;
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

        if (request.dayOfWeek() != null) {
            timeSlot.setDayOfWeek(request.dayOfWeek());
        }

        LocalTime startTime = request.startTime() != null ? request.startTime() : timeSlot.getStartTime();
        LocalTime endTime = request.endTime() != null ? request.endTime() : timeSlot.getEndTime();
        validateTimeRange(startTime, endTime);

        if (request.startTime() != null) {
            timeSlot.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            timeSlot.setEndTime(request.endTime());
        }

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
}
