# AI Planning Contract

## 1. Mục tiêu
Tài liệu này định nghĩa contract (schema) cho `rawJson` của Planning AI result. Contract này được sử dụng bởi `PlanningAiResultNormalizer` trước khi một `Material` được đánh dấu là `COMPLETED` và trước khi `ScheduleService` generate ra các task. Mục đích là để đảm bảo rằng kết quả trả về từ AI luôn hợp lệ và có cấu trúc chuẩn hóa, dễ dàng tích hợp và sử dụng an toàn trên toàn hệ thống.

## 2. Normalized JSON Schema Example
Dưới đây là ví dụ về một JSON hợp lệ sau khi được chuẩn hóa (normalized):

```json
{
  "schemaVersion": 1,
  "source": "ai-planning-flow",
  "fileName": "example.pdf",
  "modules": [
    {
      "title": "Module title",
      "orderIndex": 1,
      "tasks": [
        {
          "title": "Task title",
          "estimatedMinutes": 25
        }
      ]
    }
  ]
}
```

## 3. Validation Rules
Các quy tắc validation được áp dụng cho `rawJson` thông qua `PlanningAiResultNormalizer`:

- **General**:
  - `rawJson` cannot be null or empty.
- **Modules**:
  - `modules` must be a non-empty array.
  - Max modules: 50.
  - Each module must be an object.
  - `module.title` is required, trimmed, max 255 chars.
  - `module.orderIndex` defaults to module index + 1 if missing.
- **Tasks**:
  - `module.tasks` must be a non-empty array.
  - Max tasks per module: 50.
  - Max total tasks: 200.
  - Each task must be an object.
  - `task.title` is required, trimmed, max 255 chars.
  - `task.estimatedMinutes`:
    - Missing, null, or blank defaults to 25.
    - Must be an integer if provided.
    - Valid range is 1..180.

## 4. Invalid Examples
Các ví dụ về dữ liệu không hợp lệ sẽ bị `PlanningAiResultNormalizer` từ chối:

- **Missing modules**:
  ```json
  { "source": "ai" }
  ```
- **Empty tasks**:
  ```json
  {
    "modules": [
      {
        "title": "Module 1",
        "tasks": []
      }
    ]
  }
  ```
- **Task title blank**:
  ```json
  {
    "modules": [
      {
        "title": "Module 1",
        "tasks": [
          { "title": "   ", "estimatedMinutes": 25 }
        ]
      }
    ]
  }
  ```
- **Invalid estimatedMinutes type (String `abc`)**:
  ```json
  {
    "modules": [
      {
        "title": "Module 1",
        "tasks": [
          { "title": "Task 1", "estimatedMinutes": "abc" }
        ]
      }
    ]
  }
  ```
- **Invalid estimatedMinutes type (Float/Double `25.5`)**:
  ```json
  {
    "modules": [
      {
        "title": "Module 1",
        "tasks": [
          { "title": "Task 1", "estimatedMinutes": 25.5 }
        ]
      }
    ]
  }
  ```
- **Out of range estimatedMinutes (`-10` or `181`)**:
  ```json
  {
    "modules": [
      {
        "title": "Module 1",
        "tasks": [
          { "title": "Task 1", "estimatedMinutes": -10 }
        ]
      }
    ]
  }
  ```

## 5. Notes for Future Gemini Integration
Khi tiến hành tích hợp Gemini thật, cần lưu ý các điều sau:

- Gemini integration must return or extract JSON matching this contract.
- Do not mark Material `COMPLETED` until normalized `rawJson` passes `PlanningAiResultNormalizer`.
- Do not store markdown fences like ```json in `rawJson`.
- If Gemini returns markdown/text around JSON, extraction should happen before calling normalizer in a future AI client/service.
- Timeout/quota/parsing failures should mark Material `FAILED` or return a clear error through polling.
- No API key or secret should be committed.
