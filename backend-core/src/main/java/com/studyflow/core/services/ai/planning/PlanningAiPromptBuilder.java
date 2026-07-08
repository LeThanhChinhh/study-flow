package com.studyflow.core.services.ai.planning;

import org.springframework.stereotype.Service;

@Service
public class PlanningAiPromptBuilder {

    public String buildPlanningPrompt(PlanningAiRequest request) {
        String fileNameInfo = request.getFileName() != null ? "Tên file: " + request.getFileName() + "\n" : "";

        return fileNameInfo + 
            "Phân tích tài liệu PDF được đính kèm và tạo kế hoạch học tập.\n" +
            "YÊU CẦU BẮT BUỘC:\n" +
            "- Chỉ trả về duy nhất một đối tượng JSON.\n" +
            "- Không sử dụng markdown fence (không có ```json).\n" +
            "- Không có bất kỳ text giải thích nào trước hay sau JSON.\n" +
            "- Root của JSON phải là một Object.\n" +
            "- schemaVersion phải là 1.\n" +
            "- source phải là \"gemini-planning-flow\".\n" +
            "- fileName phải là tên file nếu có, nếu không thì để null hoặc chuỗi rỗng.\n" +
            "- modules là một mảng (array) chứa các phần học.\n" +
            "- Mỗi module phải có: title (chuỗi), orderIndex (số nguyên), tasks (mảng).\n" +
            "- Mỗi task phải có: title (chuỗi), estimatedMinutes (số nguyên).\n" +
            "- estimatedMinutes nên nằm trong khoảng hợp lý từ 15 đến 90 phút.\n" +
            "- Không tạo quá 50 modules.\n" +
            "- Không tạo quá 200 tasks tổng cộng.\n" +
            "- Ngay cả khi tài liệu PDF có rất ít nội dung, BẮT BUỘC phải tạo tối thiểu 1 module và 1 task.\n";
    }
}
