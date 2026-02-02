package com.minor.alumini_platform.dto;

import java.time.LocalDate;
import com.minor.alumini_platform.enums.AlumniDecisionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentStatusCheckResult {
    private boolean isPastExpectedEndDate;
    private boolean shouldPromptForAlumni;
    private boolean isStudentStillAllowed;
    private LocalDate expectedEndDate;
    private LocalDate nextPromptDate;
    private AlumniDecisionStatus alumniDecisionStatus;
}
